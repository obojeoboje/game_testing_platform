from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta, datetime
import random

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
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
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

@app.route('/tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test(test_id):
    test = Test.query.get_or_404(test_id)
    questions = []
    for question in test.questions:
        options = [{'id': option.id, 'content': option.content} for option in question.options]
        random.shuffle(options)  # Перемешиваем варианты ответов
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    app.run(debug=True)