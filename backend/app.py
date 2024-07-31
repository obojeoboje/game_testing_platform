from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
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

    db.session.commit()

    return jsonify({
        'correct_answers': correct_answers,
        'total_questions': total_questions,
        'experience_gained': experience_gained,
        'current_experience': user.experience,
        'current_level': user.level
    }), 200

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        'username': user.username,
        'experience': user.experience,
        'level': user.level,
        'tests_completed': user.tests_completed,
        'correct_answers': user.correct_answers,
        'total_answers': user.total_answers,
        'accuracy': (user.correct_answers / user.total_answers * 100) if user.total_answers > 0 else 0
    }), 200

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