from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta, datetime
import random
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, or_
from markdown import markdown
import re


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Измените на свой секретный ключ
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    experience = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    tests_completed = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    total_answers = db.Column(db.Integer, default=0)
    achievements = db.Column(db.String(500), default='')  # Будем хранить достижения как строку, разделенную запятыми
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    questions = db.relationship('Question', backref='test', lazy=True)


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    options = db.relationship('Option', backref='question', lazy=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)


class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    date_completed = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('test_results', lazy=True))
    test = db.relationship('Test', backref=db.backref('results', lazy=True))

class Material(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    cover_image = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, is_admin=user.is_admin), 200
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.username), 200

@app.route('/tests', methods=['GET'])
@jwt_required()
def get_tests():
    tests = Test.query.all()
    return jsonify([{'id': test.id, 'title': test.title} for test in tests]), 200


@app.route('/tests', methods=['POST'])
@jwt_required()
def create_test():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    data = request.json
    new_test = Test(title=data['title'])
    db.session.add(new_test)
    db.session.commit()

    for question_data in data['questions']:
        question = Question(content=question_data['content'], test_id=new_test.id)
        db.session.add(question)
        db.session.commit()

        for option_data in question_data['options']:
            option = Option(
                content=option_data['content'],
                is_correct=option_data['is_correct'],
                question_id=question.id
            )
            db.session.add(option)

    db.session.commit()
    return jsonify({"msg": "Test created successfully", "test_id": new_test.id}), 201

@app.route('/tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test(test_id):
    test = Test.query.get_or_404(test_id)
    questions = []
    for question in test.questions:
        options = [{'id': option.id, 'content': option.content, 'is_correct': option.is_correct} for option in question.options]
        questions.append({
            'id': question.id,
            'content': question.content,
            'options': options
        })
    return jsonify({
        'id': test.id,
        'title': test.title,
        'questions': questions
    }), 200


@app.route('/tests/<int:test_id>', methods=['PUT'])
@jwt_required()
def update_test(test_id):
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    test = Test.query.get_or_404(test_id)
    data = request.json

    test.title = data['title']

    # Удаляем существующие вопросы и варианты ответов
    for question in test.questions:
        for option in question.options:
            db.session.delete(option)
        db.session.delete(question)

    # Добавляем новые вопросы и варианты ответов
    for question_data in data['questions']:
        question = Question(content=question_data['content'], test_id=test.id)
        db.session.add(question)
        db.session.flush()  # Чтобы получить id нового вопроса

        for option_data in question_data['options']:
            option = Option(
                content=option_data['content'],
                is_correct=option_data.get('is_correct', False),  # Явно устанавливаем is_correct
                question_id=question.id
            )
            db.session.add(option)

    try:
        db.session.commit()
        return jsonify({"msg": "Test updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating test: {str(e)}")
        return jsonify({"msg": "An error occurred while updating the test"}), 500


@app.route('/tests/<int:test_id>', methods=['DELETE'])
@jwt_required()
def delete_test(test_id):
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    test = Test.query.get_or_404(test_id)

    for question in test.questions:
        for option in question.options:
            db.session.delete(option)
        db.session.delete(question)

    db.session.delete(test)
    db.session.commit()

    return jsonify({"msg": "Test deleted successfully"}), 200


@app.route('/tests/<int:test_id>/submit', methods=['POST'])
@jwt_required()
def submit_test(test_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()

    test = Test.query.get_or_404(test_id)
    total_questions = len(test.questions)

    correct_answers = 0
    for answer in data['answers']:
        question = Question.query.get(answer['question_id'])
        if question and question.test_id == test_id:
            option = Option.query.get(answer['option_id'])
            if option and option.question_id == question.id and option.is_correct:
                correct_answers += 1

    experience_gained = correct_answers * 50
    user.experience += experience_gained
    user.tests_completed += 1
    user.correct_answers += correct_answers
    user.total_answers += total_questions

    while user.experience >= 500:
        user.level += 1
        user.experience -= 500

    # Сохраняем результат теста
    test_result = TestResult(
        user_id=user.id,
        test_id=test_id,
        score=correct_answers,
        total_questions=total_questions
    )
    db.session.add(test_result)

    new_achievements = check_and_update_achievements(user)

    db.session.commit()

    return jsonify({
        'correct_answers': correct_answers,
        'total_questions': total_questions,
        'experience_gained': experience_gained,
        'current_experience': user.experience,
        'current_level': user.level,
        'new_achievements': new_achievements
    }), 200


def check_and_update_achievements(user):
    new_achievements = []
    all_achievements = [
        ('tests_novice', 'Completed 5 tests', lambda u: u.tests_completed >= 5),
        ('tests_pro', 'Completed 20 tests', lambda u: u.tests_completed >= 20),
        ('accuracy_master', 'Achieved 80% accuracy',
         lambda u: (u.correct_answers / u.total_answers >= 0.8) if u.total_answers > 0 else False),
        ('level_5', 'Reached level 5', lambda u: u.level >= 5),
        ('perfect_test', 'Got 100% on a test', lambda u: u.correct_answers == u.total_answers and u.total_answers > 0)
    ]

    current_achievements = set(user.achievements.split(',')) if user.achievements else set()

    for ach_id, ach_name, ach_check in all_achievements:
        if ach_id not in current_achievements and ach_check(user):
            current_achievements.add(ach_id)
            new_achievements.append(ach_name)

    user.achievements = ','.join(current_achievements)
    return new_achievements

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    achievements = user.achievements.split(',') if user.achievements else []
    return jsonify({
        'username': user.username,
        'experience': user.experience,
        'level': user.level,
        'tests_completed': user.tests_completed,
        'correct_answers': user.correct_answers,
        'total_answers': user.total_answers,
        'accuracy': (user.correct_answers / user.total_answers * 100) if user.total_answers > 0 else 0,
        'achievements': achievements
    }), 200


@app.route('/test-history', methods=['GET'])
@jwt_required()
def get_test_history():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    test_results = TestResult.query.filter_by(user_id=user.id).order_by(TestResult.date_completed.desc()).all()

    history = [{
        'test_id': result.test_id,
        'test_title': result.test.title,
        'score': result.score,
        'total_questions': result.total_questions,
        'date_completed': result.date_completed.isoformat()
    } for result in test_results]

    return jsonify(history), 200

@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({"msg": "Admin access required"}), 403
    users = User.query.all()
    return jsonify([{"id": user.id, "username": user.username, "is_admin": user.is_admin} for user in users]), 200

@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403
    data = request.json
    new_user = User(username=data['username'], is_admin=data.get('is_admin', False))
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.is_admin = data.get('is_admin', user.is_admin)
    if 'password' in data:
        user.set_password(data['password'])
    db.session.commit()
    return jsonify({"msg": "User updated successfully"}), 200

@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({"msg": "Admin access required"}), 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully"}), 200

def is_admin(user_id):
    user = User.query.get(user_id)
    return user.is_admin if user else False

def create_sample_data():
    if not Test.query.first():
        test = Test(title="Основы тестирования")
        db.session.add(test)
        db.session.commit()

        question1 = Question(content="Что такое тестирование ПО?", test_id=test.id)
        db.session.add(question1)
        db.session.commit()

        options1 = [
            Option(content="Процесс проверки соответствия ПО требованиям", is_correct=True, question_id=question1.id),
            Option(content="Написание кода", is_correct=False, question_id=question1.id),
            Option(content="Создание документации", is_correct=False, question_id=question1.id),
            Option(content="Управление проектом", is_correct=False, question_id=question1.id)
        ]
        db.session.add_all(options1)
        db.session.commit()

@app.route('/admin/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    # Общее количество пользователей
    total_users = User.query.count()

    # Активные пользователи (те, кто прошел тест за последние 30 дней)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.session.query(func.count(func.distinct(TestResult.user_id))).filter(TestResult.date_completed >= thirty_days_ago).scalar()

    # Общее количество тестов
    total_tests = Test.query.count()

    # Количество пройденных тестов
    completed_tests = TestResult.query.count()

    # Средний балл
    average_score = db.session.query(func.avg(TestResult.score * 100.0 / TestResult.total_questions)).scalar()

    # Самый популярный тест (тест с наибольшим количеством прохождений)
    top_test = db.session.query(Test.title, func.count(TestResult.id).label('count')).\
        join(TestResult, Test.id == TestResult.test_id).\
        group_by(Test.id).\
        order_by(func.count(TestResult.id).desc()).\
        first()

    return jsonify({
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalTests": total_tests,
        "completedTests": completed_tests,
        "averageScore": float(average_score) if average_score else 0,
        "topTest": top_test.title if top_test else None
    }), 200


def normalize_string(s):
    return re.sub(r'\W+', '', s.lower())


@app.route('/materials', methods=['GET'])
@jwt_required()
def get_materials():
    search = request.args.get('search', '')
    topic = request.args.get('topic', '')

    query = Material.query
    if search:
        query = query.filter(
            (Material.title.ilike(f'%{search}%')) |
            (Material.content.ilike(f'%{search}%'))
        )
    if topic:
        query = query.filter(Material.topic.ilike(f'%{topic}%'))

    materials = query.all()
    return jsonify([{
        'id': m.id,
        'title': m.title,
        'content': markdown(m.content),
        'topic': m.topic,
        'cover_image': m.cover_image,  # Добавьте это
        'created_at': m.created_at.isoformat(),
        'updated_at': m.updated_at.isoformat()
    } for m in materials])


@app.route('/materials', methods=['POST'])
@jwt_required()
def create_material():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    data = request.json
    new_material = Material(
        title=data['title'],
        content=data['content'],
        topic=data['topic'],
        cover_image=data.get('cover_image', '')  # Добавьте это
    )
    db.session.add(new_material)
    db.session.commit()
    return jsonify({"msg": "Material created successfully", "id": new_material.id}), 201


@app.route('/materials/<int:material_id>', methods=['GET'])
@jwt_required()
def get_material(material_id):
    material = Material.query.get_or_404(material_id)
    return jsonify({
        'id': material.id,
        'title': material.title,
        'content': markdown(material.content),
        'topic': material.topic,
        'cover_image': material.cover_image,  # Добавьте это
        'created_at': material.created_at.isoformat(),
        'updated_at': material.updated_at.isoformat()
    })


@app.route('/materials/<int:material_id>', methods=['PUT'])
@jwt_required()
def update_material(material_id):
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    material = Material.query.get_or_404(material_id)
    data = request.json
    material.title = data.get('title', material.title)
    material.content = data.get('content', material.content)
    material.topic = data.get('topic', material.topic)
    material.cover_image = data.get('cover_image', material.cover_image)  # Добавьте это
    db.session.commit()
    return jsonify({"msg": "Material updated successfully"})


@app.route('/materials/<int:material_id>', methods=['DELETE'])
@jwt_required()
def delete_material(material_id):
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403

    material = Material.query.get_or_404(material_id)
    db.session.delete(material)
    db.session.commit()
    return jsonify({"msg": "Material deleted successfully"})


@app.route('/materials/topics', methods=['GET'])
@jwt_required()
def get_topics():
    topics = db.session.query(Material.topic.distinct()).all()
    return jsonify([topic[0] for topic in topics])

def update_all_passwords():
    users = User.query.all()
    for user in users:
        if not user.password.startswith('pbkdf2:sha256:') and not user.password.startswith('scrypt:'):
            user.set_password(user.password)
    db.session.commit()

def create_admin():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', is_admin=True)
        admin.set_password('adminpassword')
        db.session.add(admin)
        db.session.commit()
        print('Admin user created')
    else:
        print('Admin user already exists')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
        update_all_passwords()
        create_admin()
    app.run(debug=True)