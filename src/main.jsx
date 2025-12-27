
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

const initDemoUsers = () => {
  const existingUsers = localStorage.getItem('dms_users');
  if (!existingUsers) {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'user@example.com',
        password: 'user123',
        name: 'Regular User',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('dms_users', JSON.stringify(demoUsers));
  }
};

initDemoUsers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
