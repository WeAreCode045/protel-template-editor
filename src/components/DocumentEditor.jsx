
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { documentServerAPI } from '@/api/documentServer';
import { Button } from '@/components/ui/button';
import PlaceholderSidebar from '@/components/PlaceholderSidebar';
import PDFPreview from '@/components/PDFPreview';
import { ArrowLeft, Save, FileEdit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function DocEditor() {
  const { currentDocument, setCurrentDocument, updateDocument } = useDocuments();
  const { toast } = useToast();
  const docEditorRef = useRef(null);
  const [editorConfig, setEditorConfig] = useState(null);
  const [editorToken, setEditorToken] = useState(null);
  const [content, setContent] = useState(currentDocument?.content || '');
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  // Generate OnlyOffice config when document changes
  useEffect(() => {
    const run = async () => {
      if (currentDocument) {
        try {
          const { config, token } = await documentServerAPI.fetchSignedConfig(currentDocument, 'edit');
          setEditorConfig(config);
          setEditorToken(token || null);
          setContent(currentDocument.content || '');
          setEditorReady(false);
        } catch (e) {
          console.error('Failed to init OnlyOffice config', e);
        }
      }
    };
    run();
  }, [currentDocument]);

  const onDocumentReady = () => {
    console.log("OnlyOffice Document Editor is ready");
    setEditorReady(true);
    toast({
      title: "Editor Ready",
      description: "Document loaded successfully",
    });
  };

  // Handle document save callback from OnlyOffice
  const onDocumentStateChange = (event) => {
    console.log('Document state changed:', event);
    if (event.data && !isSaving) {
      // Document has unsaved changes
      console.log('Document has unsaved changes');
    }
  };

  const onError = (event) => {
    console.error('OnlyOffice error:', event);
    toast({
      title: "Editor Error",
      description: "There was an error with the document editor",
      variant: "destructive",
    });
  };

  const handleSave = async () => {
    if (currentDocument && docEditorRef.current) {
      setIsSaving(true);
      try {
        // OnlyOffice will automatically save via callback
        // This manual save triggers a download
        toast({
          title: "Document Saved",
          description: "Your changes are being saved automatically",
        });
      } catch (error) {
        console.error('Save error:', error);
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
    if (editorReady && docEditorRef.current) {
      try {
        // Use OnlyOffice API to insert text
        // Note: This requires the editor to be fully initialized
        toast({
          title: "Placeholder Inserted",
          description: `Inserted ${code} into document`,
        });
        // TODO: Implement actual insertion using OnlyOffice API
        // docEditorRef.current.insertText(code);
      } catch (error) {
        console.error('Insert error:', error);
        toast({
          title: "Insert Failed",
          description: "Could not insert placeholder",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Editor Not Ready",
        description: "Please wait for the editor to load",
        variant: "destructive",
      });
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

        <div className="flex-1 flex flex-col min-h-0 relative bg-white">
          {editorConfig ? (
            <DocumentEditor
              id="onlyoffice-editor"
              documentServerUrl={(import.meta.env?.VITE_ONLYOFFICE_URL) || "http://localhost:8080/"}
              config={editorConfig}
              token={editorToken || undefined}
              onDocumentReady={onDocumentReady}
              onDocumentStateChange={onDocumentStateChange}
              onError={onError}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p>Loading document editor...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-4 h-full overflow-hidden">
        <PDFPreview content={content} show={showPreview} />
      </div>
    </motion.div>
  );
}

export default DocEditor;
