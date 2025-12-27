
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDocuments } from '@/contexts/DocumentContext';
import { Button } from '@/components/ui/button';
import PlaceholderSidebar from '@/components/PlaceholderSidebar';
import PDFPreview from '@/components/PDFPreview';
import { ArrowLeft, Save, FileEdit, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function DocumentEditor() {
  const { currentDocument, setCurrentDocument, updateDocument } = useDocuments();
  const { toast } = useToast();
  
  // Initialize content from the current document
  const [content, setContent] = useState(currentDocument?.content || '');
  const [showPreview, setShowPreview] = useState(true); // Default to showing preview
  const [isSaving, setIsSaving] = useState(false);

  // Sync content if document changes or reloads
  useEffect(() => {
    if (currentDocument?.content) {
      setContent(currentDocument.content);
    }
  }, [currentDocument]);

  const handleSave = async () => {
    if (currentDocument) {
      setIsSaving(true);
      // Simulate network delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 500));
      updateDocument(currentDocument.id, content);
      setIsSaving(false);
      
      // Force refresh preview by toggling visible state briefly or rely on prop update
      // Since PDFPreview watches 'content' prop when 'show' is true, it should update automatically
    }
  };

  const handleInsertPlaceholder = (code) => {
    // Basic text insertion for textarea
    const textarea = document.getElementById('document-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + code + content.substring(end);
      setContent(newContent);
      
      // Restore focus and cursor position after React re-render
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + code.length, start + code.length);
      }, 0);

      toast({
        title: "Placeholder Inserted",
        description: `Inserted ${code} at cursor position`,
      });
    } else {
      // Fallback if textarea not found
      setContent(prev => prev + ' ' + code);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]" // Adjusted height calculation
    >
      <div className="col-span-3 h-full overflow-hidden">
        <PlaceholderSidebar onInsert={handleInsertPlaceholder} />
      </div>

      <div className="col-span-5 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden flex flex-col h-full">
        <div className="bg-white/5 px-4 py-3 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <Button
              onClick={() => setCurrentDocument(null)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-white font-semibold truncate text-sm">{currentDocument?.name}</h2>
              <span className="text-xs text-blue-300 flex items-center gap-1">
                <FileEdit className="w-3 h-3" /> Editing Mode
              </span>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 shrink-0"
            size="sm"
          >
            <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 relative group">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Markdown / Text Editor
            </span>
          </div>
          <textarea
            id="document-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your document content here..."
            className="flex-1 w-full p-6 bg-white/5 border-none text-white placeholder-gray-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
            spellCheck="false"
          />
        </div>
        
        <div className="bg-white/5 px-4 py-2 border-t border-white/20 text-xs text-gray-400 flex justify-between items-center">
           <span>{content.length} characters</span>
           <span className="flex items-center gap-1"><Wand2 className="w-3 h-3"/> Auto-preview enabled</span>
        </div>
      </div>

      <div className="col-span-4 h-full overflow-hidden">
        <PDFPreview content={content} show={showPreview} />
      </div>
    </motion.div>
  );
}

export default DocumentEditor;
