import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', is_admin: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('http://localhost:5000/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ username: '', password: '', is_admin: false });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://localhost:5000/users/${editingUser.id}`, editingUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="user-management">
      <h2>Управление пользователями</h2>
      <div className="create-user">
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={newUser.is_admin}
            onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
          />
          Admin
        </label>
        <button onClick={handleCreateUser}>Create User</button>
      </div>
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-item">
            {editingUser && editingUser.id === user.id ? (
              <>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={editingUser.is_admin}
                    onChange={(e) => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                  />
                  Admin
                </label>
                <button onClick={handleUpdateUser}>Save</button>
                <button onClick={() => setEditingUser(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{user.username}</span>
                <span>{user.is_admin ? 'Admin' : 'User'}</span>
                <button onClick={() => setEditingUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;