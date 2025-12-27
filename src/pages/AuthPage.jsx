
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, LogIn, UserPlus } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(email, password);
      if (success) {
        navigate('/');
      }
    } else {
      if (register(email, password, name)) {
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setName('');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Document Management System</title>
        <meta name="description" content="Sign in to access your documents and collaborative editing tools" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-500 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-white">
              Document Management
            </h1>
            <p className="text-center text-gray-300 mb-8">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-all"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <p className="text-sm text-blue-200 font-semibold mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-100">Admin: admin@example.com / admin123</p>
              <p className="text-xs text-blue-100">User: user@example.com / user123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default AuthPage;
