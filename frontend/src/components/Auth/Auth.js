import React, { useState } from 'react';
import { login, register, setAuthToken } from '../../utils/api';

function Auth({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authFunction = isLogin ? login : register;
      const response = await authFunction(username, password);
      
      if (response.data.access_token) {
        const token = response.data.access_token;
        setAuthToken(token);
        localStorage.setItem('token', token);
        setToken(token);
        
        setUser({ 
          username: response.data.username,
          level: response.data.level,
          experience: response.data.experience,
          is_admin: response.data.is_admin
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      // Здесь можно добавить обработку ошибок, например, показать сообщение пользователю
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