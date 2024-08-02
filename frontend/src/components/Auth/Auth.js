import React, { useState } from 'react';
import axios from 'axios';

function Auth({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      if (response.data.access_token) {
        setToken(response.data.access_token);
        // Убедитесь, что вы устанавливаете все необходимые поля пользователя
        setUser({ 
          username: response.data.username,
          level: response.data.level,
          experience: response.data.experience,
          is_admin: response.data.is_admin
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="card auth-card">
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="switch-auth">
        {isLogin ? 'Нужно зарегистрироваться?' : 'Уже есть аккаунт?'}
      </button>
    </div>
  );
}

export default Auth;