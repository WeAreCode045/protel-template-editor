

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, Edit2, Save, UserPlus, Users, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user, logout, allUsers, deleteUser, register } = useAuth();
  const { placeholders, addPlaceholder, updatePlaceholder, deletePlaceholder } = useDocuments();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [newPlaceholder, setNewPlaceholder] = useState({
    code: '',
    category: '',
    templateType: '',
    demoValue: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleAddPlaceholder = (e) => {
    e.preventDefault();
    if (!newPlaceholder.code.startsWith('$')) {
      toast({
        title: "Invalid Code",
        description: "Placeholder code must start with $",
        variant: "destructive"
      });
      return;
    }
    addPlaceholder(newPlaceholder);
    setNewPlaceholder({ code: '', category: '', templateType: '', demoValue: '' });
  };

  const handleUpdatePlaceholder = (id) => {
    updatePlaceholder(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (register(newUser.email, newUser.password, newUser.name)) {
      setNewUser({ name: '', email: '', password: '', role: 'user' });
    }
  };
  
  const handleDeleteUser = (id) => {
    if (id === user.id) {
      toast({
        title: "Action Denied",
        description: "You cannot delete your own account while logged in.",
        variant: "destructive"
      });
      return;
    }
    
    setDeleteConfirmId(id);
  };

  const confirmDeleteUser = () => {
    deleteUser(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - Document Management System</title>
        <meta name="description" content="Manage placeholders, users, and system settings" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
              
              <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="placeholders" className="w-full">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
              </TabsList>

              <TabsContent value="placeholders" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Create New Placeholder</h2>
                    <form onSubmit={handleAddPlaceholder} className="space-y-4">
                      <div>
                        <Label className="text-white">Code</Label>
                        <input
                          type="text"
                          value={newPlaceholder.code}
                          onChange={(e) => setNewPlaceholder({...newPlaceholder, code: e.target.value})}
                          placeholder="$variable.name"
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Category</Label>
                        <input
                          type="text"
                          value={newPlaceholder.category}
                          onChange={(e) => setNewPlaceholder({...newPlaceholder, category: e.target.value})}
                          placeholder="User Info, Company, etc."
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Template Type</Label>
                        <input
                          type="text"
                          value={newPlaceholder.templateType}
                          onChange={(e) => setNewPlaceholder({...newPlaceholder, templateType: e.target.value})}
                          placeholder="All, Contracts, Invoices, etc."
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Demo Value</Label>
                        <input
                          type="text"
                          value={newPlaceholder.demoValue}
                          onChange={(e) => setNewPlaceholder({...newPlaceholder, demoValue: e.target.value})}
                          placeholder="Sample value for preview"
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Placeholder
                      </Button>
                    </form>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Manage Placeholders</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {placeholders.map((placeholder) => (
                        <div key={placeholder.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          {editingId === placeholder.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.code || placeholder.code}
                                onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                                className="w-full px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                              />
                              <input
                                type="text"
                                value={editForm.category || placeholder.category}
                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                className="w-full px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                              />
                              <input
                                type="text"
                                value={editForm.templateType || placeholder.templateType}
                                onChange={(e) => setEditForm({...editForm, templateType: e.target.value})}
                                className="w-full px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                              />
                              <input
                                type="text"
                                value={editForm.demoValue || placeholder.demoValue}
                                onChange={(e) => setEditForm({...editForm, demoValue: e.target.value})}
                                className="w-full px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleUpdatePlaceholder(placeholder.id)}
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  onClick={() => setEditingId(null)}
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="font-mono text-purple-300 font-semibold">{placeholder.code}</span>
                                  <p className="text-xs text-gray-400 mt-1">Category: {placeholder.category}</p>
                                  <p className="text-xs text-gray-400">Type: {placeholder.templateType}</p>
                                  <p className="text-sm text-white mt-2">Demo: {placeholder.demoValue}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingId(placeholder.id);
                                      setEditForm(placeholder);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => deletePlaceholder(placeholder.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Create New User</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <Label className="text-white">Full Name</Label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Email</Label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          placeholder="user@example.com"
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Password</Label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Role</Label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-800"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User Account
                      </Button>
                    </form>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Registered Users</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {allUsers.map((u) => (
                        <div key={u.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          {deleteConfirmId === u.id ? (
                            <div className="space-y-3">
                              <p className="text-white font-medium">Delete user {u.name}?</p>
                              <p className="text-sm text-gray-300">This action cannot be undone.</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={confirmDeleteUser}
                                  className="bg-red-500 hover:bg-red-600 flex-1"
                                >
                                  Delete
                                </Button>
                                <Button
                                  onClick={() => setDeleteConfirmId(null)}
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10 flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                  {u.role === 'admin' ? (
                                    <Key className="w-4 h-4 text-purple-300" />
                                  ) : (
                                    <Users className="w-4 h-4 text-blue-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white">{u.name}</p>
                                  <p className="text-sm text-gray-400">{u.email}</p>
                                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase tracking-wider">
                                    {u.role}
                                  </span>
                                </div>
                              </div>
                              
                              {u.id !== user.id && (
                                <Button
                                  onClick={() => handleDeleteUser(u.id)}
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default AdminPanel;

