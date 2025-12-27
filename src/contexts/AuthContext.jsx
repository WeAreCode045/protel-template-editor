
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const storedUser = localStorage.getItem('dms_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    }
    
    // Load all users for admin/management
    const storedUsers = localStorage.getItem('dms_users');
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    }
  }, []);

  const refreshUsers = () => {
    const storedUsers = localStorage.getItem('dms_users');
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    }
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('dms_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userSession = { 
        id: foundUser.id, 
        email: foundUser.email, 
        name: foundUser.name,
        role: foundUser.role 
      };
      setUser(userSession);
      setIsAdmin(foundUser.role === 'admin');
      localStorage.setItem('dms_user', JSON.stringify(userSession));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      return true;
    }
    
    toast({
      title: "Login Failed",
      description: "Invalid email or password",
      variant: "destructive",
    });
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('dms_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const register = (email, password, name) => {
    const users = JSON.parse(localStorage.getItem('dms_users') || '[]');
    
    if (users.find(u => u.email === email)) {
      toast({
        title: "Registration Failed",
        description: "Email already exists",
        variant: "destructive",
      });
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem('dms_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    
    toast({
      title: "Registration Successful",
      description: "You can now log in with your credentials",
    });
    return true;
  };

  const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('dms_users') || '[]');
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('dms_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    
    toast({
      title: "User Deleted",
      description: "User account has been permanently removed.",
    });
  };

  const updateProfile = (userId, updates) => {
    const users = JSON.parse(localStorage.getItem('dms_users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    
    localStorage.setItem('dms_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    
    // If updating current user, update session
    if (user && user.id === userId) {
      const updatedSession = { ...user, ...updates };
      // Remove password from session object if it was in updates
      if (updatedSession.password) delete updatedSession.password;
      
      setUser(updatedSession);
      localStorage.setItem('dms_user', JSON.stringify(updatedSession));
    }

    toast({
      title: "Profile Updated",
      description: "Your account details have been saved.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      allUsers,
      login, 
      logout, 
      register,
      deleteUser,
      updateProfile,
      refreshUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
