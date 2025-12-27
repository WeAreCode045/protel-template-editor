
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DocumentEditor as OnlyOfficeEditor } from '@onlyoffice/document-editor-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { Button } from '@/components/ui/button';
import PlaceholderSidebar from '@/components/PlaceholderSidebar';
import PDFPreview from '@/components/PDFPreview';
import { ArrowLeft, Save, FileEdit, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function DocumentEditor() {
  const { currentDocument, setCurrentDocument, updateDocument } = useDocuments();
  const { toast } = useToast();
  const docEditorRef = useRef(null);
  
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
    if (currentDocument && docEditorRef.current) {
      setIsSaving(true);
      try {
        // Get content from OnlyOffice editor
        const editorContent = await docEditorRef.current.downloadAs('docx');
        updateDocument(currentDocument.id, editorContent);
        
        toast({
          title: "Document Saved",
          description: "Your changes have been saved successfully",
        });
      } catch (error) {
        toast({
          title: "Save Failed",
          description: "Failed to save document changes",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
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

        <div className="flex-1 flex flex-col min-h-0 relative">
          <OnlyOfficeEditor
            ref={docEditorRef}
            id="onlyoffice-editor"
            documentServerUrl="https://documentserver/"
            config={{
              document: {
                fileType: "docx",
                key: currentDocument?.id || "document-key",
                title: currentDocument?.name || "Untitled Document",
                url: "",
              },
              documentType: "word",
              editorConfig: {
                mode: "edit",
                callbackUrl: "",
              },
            }}
            onDocumentReady={() => {
              console.log("Document editor ready");
            }}
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div className="col-span-4 h-full overflow-hidden">
        <PDFPreview content={content} show={showPreview} />
      </div>
    </motion.div>
  );
}

export default DocumentEditor;
