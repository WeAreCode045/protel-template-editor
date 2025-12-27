// Simple API server for OnlyOffice callbacks
// This would typically be a separate backend server (Node.js/Express, etc.)
// For demo purposes, this shows the callback handling logic

export async function handleOnlyOfficeCallback(documentId, callbackData) {
  console.log('OnlyOffice callback for document:', documentId, callbackData);
  
  // Status codes from OnlyOffice:
  // 0 - no document with the key identifier could be found
  // 1 - document is being edited
  // 2 - document is ready for saving
  // 3 - document saving error has occurred
  // 4 - document is closed with no changes
  // 6 - document is being edited, but the current document state is saved
  // 7 - error has occurred while force saving the document
  
  const { status, url, key, users } = callbackData;
  
  if (status === 2 || status === 6) {
    // Document is ready for saving
    if (url) {
      try {
        // Download the document from OnlyOffice
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Convert to base64 for storage
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            const fileData = reader.result;
            
            // Update the document in localStorage
            const storedDocs = localStorage.getItem('dms_documents');
            if (storedDocs) {
              const documents = JSON.parse(storedDocs);
              const docIndex = documents.findIndex(d => d.id === documentId);
              
              if (docIndex !== -1) {
                documents[docIndex].fileData = fileData;
                documents[docIndex].lastModified = new Date().toISOString();
                localStorage.setItem('dms_documents', JSON.stringify(documents));
                
                console.log('Document saved successfully:', documentId);
                resolve({ error: 0 });
              } else {
                resolve({ error: 1 }); // Document not found
              }
            } else {
              resolve({ error: 1 }); // No documents in storage
            }
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error saving document:', error);
        return { error: 1 };
      }
    }
  }
  
  // For other statuses, just acknowledge
  return { error: 0 };
}

// Mock API endpoint handler
export const setupCallbackHandler = () => {
  // In a real application, this would be handled by your backend server
  // For example, with Express.js:
  /*
  app.post('/api/documents/:id/callback', async (req, res) => {
    const documentId = req.params.id;
    const callbackData = req.body;
    
    const result = await handleOnlyOfficeCallback(documentId, callbackData);
    res.json(result);
  });
  */
  
  console.log('OnlyOffice callback handler ready');
  console.log('Note: You need a backend server to handle callbacks from OnlyOffice');
  console.log('Example endpoint: POST /api/documents/:id/callback');
};
