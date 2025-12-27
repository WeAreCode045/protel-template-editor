
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const DocumentContext = createContext(null);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedDocs = localStorage.getItem('dms_documents');
    const storedPlaceholders = localStorage.getItem('dms_placeholders');
    
    if (storedDocs) setDocuments(JSON.parse(storedDocs));
    if (storedPlaceholders) {
      setPlaceholders(JSON.parse(storedPlaceholders));
    } else {
      const defaultPlaceholders = [
        { id: '1', code: '$user.name', category: 'User Info', templateType: 'All', demoValue: 'John Doe' },
        { id: '2', code: '$user.email', category: 'User Info', templateType: 'All', demoValue: 'john.doe@example.com' },
        { id: '3', code: '$user.phone', category: 'User Info', templateType: 'All', demoValue: '+1 234 567 8900' },
        { id: '4', code: '$company.name', category: 'Company', templateType: 'Business', demoValue: 'Acme Corporation' },
        { id: '5', code: '$company.address', category: 'Company', templateType: 'Business', demoValue: '123 Business St, NY 10001' },
        { id: '6', code: '$date.today', category: 'Dates', templateType: 'All', demoValue: new Date().toLocaleDateString() },
        { id: '7', code: '$contract.number', category: 'Legal', templateType: 'Contracts', demoValue: 'CNT-2025-001' },
        { id: '8', code: '$amount.total', category: 'Financial', templateType: 'Invoices', demoValue: '$5,250.00' },
      ];
      setPlaceholders(defaultPlaceholders);
      localStorage.setItem('dms_placeholders', JSON.stringify(defaultPlaceholders));
    }
  }, []);

  const uploadDocument = (file, userId) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload .docx or .odt files only",
        variant: "destructive",
      });
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate content extraction for the demo editor
      const initialEditorContent = `Document: ${file.name}
      
[This is a simulated text view of the uploaded binary document. In a production environment with full Collabora Online integration, the actual document content and formatting would appear here.]

Section 1: Introduction
This Agreement is made on $date.today between $company.name and $user.name.

Section 2: Terms
The total value of this contract is $amount.total.
      `;

      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        userId,
        content: initialEditorContent,
        fileData: e.target.result,
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      localStorage.setItem('dms_documents', JSON.stringify(updatedDocs));
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and processed`,
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "There was an error reading the file",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
    return true;
  };

  const updateDocument = (docId, content) => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId 
        ? { ...doc, content, lastModified: new Date().toISOString() }
        : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem('dms_documents', JSON.stringify(updatedDocs));
    
    // Also update the current document if it's the one being edited
    if (currentDocument && currentDocument.id === docId) {
      setCurrentDocument(prev => ({ ...prev, content, lastModified: new Date().toISOString() }));
    }
    
    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully",
    });
  };

  const deleteDocument = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    localStorage.setItem('dms_documents', JSON.stringify(updatedDocs));
    
    toast({
      title: "Document Deleted",
      description: "Document has been removed",
    });
  };

  const addPlaceholder = (placeholder) => {
    const newPlaceholder = {
      ...placeholder,
      id: Date.now().toString()
    };
    const updated = [...placeholders, newPlaceholder];
    setPlaceholders(updated);
    localStorage.setItem('dms_placeholders', JSON.stringify(updated));
    
    toast({
      title: "Placeholder Created",
      description: `${placeholder.code} has been added`,
    });
  };

  const updatePlaceholder = (id, updates) => {
    const updated = placeholders.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlaceholders(updated);
    localStorage.setItem('dms_placeholders', JSON.stringify(updated));
    
    toast({
      title: "Placeholder Updated",
      description: "Changes have been saved",
    });
  };

  const deletePlaceholder = (id) => {
    const updated = placeholders.filter(p => p.id !== id);
    setPlaceholders(updated);
    localStorage.setItem('dms_placeholders', JSON.stringify(updated));
    
    toast({
      title: "Placeholder Deleted",
      description: "Placeholder has been removed",
    });
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      placeholders,
      currentDocument,
      setCurrentDocument,
      uploadDocument,
      updateDocument,
      deleteDocument,
      addPlaceholder,
      updatePlaceholder,
      deletePlaceholder
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
