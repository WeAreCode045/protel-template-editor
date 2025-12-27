
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Shield, User } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {
      name: formData.name,
      email: formData.email
    };
    if (formData.password) {
      updates.password = formData.password;
    }
    updateProfile(user.id, updates);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Settings - Document Management System</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-xl font-bold text-white">Account Settings</h1>
              </div>
              
              <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
          >
            <div className="flex items-center mb-8 pb-8 border-b border-white/10">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mr-6">
                <User className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex items-center mt-2">
                  <Shield className="w-3 h-3 text-blue-400 mr-1" />
                  <span className="text-xs text-blue-400 uppercase tracking-wide">{user.role} Account</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Display Name</Label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">New Password</Label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all"
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-xs text-gray-400">Only enter a value if you want to change your password.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600 px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default Settings;
