
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import DocumentList from '@/components/DocumentList';
import DocumentEditor from '@/components/DocumentEditor';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { uploadDocument, currentDocument, setCurrentDocument } = useDocuments();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadDocument(file, user.id);
      e.target.value = '';
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Document Management System</title>
        <meta name="description" content="Manage your documents, collaborate with your team, and edit documents in real-time" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">Document Manager</h1>
                <span className="text-sm text-gray-300">Welcome, {user.name}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleUploadButtonClick}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".docx,.odt"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                {isAdmin && (
                  <Button 
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>

                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentDocument ? (
            <DocumentEditor key={currentDocument.id} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DocumentList onSelectDocument={setCurrentDocument} />
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}

export default Dashboard;
