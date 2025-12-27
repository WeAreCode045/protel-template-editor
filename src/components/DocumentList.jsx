
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Calendar, HardDrive } from 'lucide-react';

function DocumentList({ onSelectDocument }) {
  const { user } = useAuth();
  const { documents, deleteDocument } = useDocuments();
  
  const userDocs = documents.filter(doc => doc.userId === user.id);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userDocs.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Documents Yet</h2>
        <p className="text-gray-300 mb-6">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-300" />
              </div>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
            
            <h3 className="text-white font-semibold mb-2 truncate">{doc.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-300">
                <HardDrive className="w-4 h-4 mr-2" />
                {formatFileSize(doc.size)}
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(doc.lastModified)}
              </div>
            </div>
            
            <Button 
              onClick={() => onSelectDocument(doc)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Open Document
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DocumentList;
