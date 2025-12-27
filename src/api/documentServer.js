// Document Server API for OnlyOffice integration
// This handles serving documents to OnlyOffice and receiving callbacks

export class DocumentServerAPI {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // Generate a document URL that OnlyOffice can access
  getDocumentUrl(documentId, fileData) {
    // Convert base64 data to blob URL
    if (fileData && fileData.startsWith('data:')) {
      return fileData;
    }
    return '';
  }

  // Generate a unique document key for OnlyOffice
  // The key must change when the document is edited to force OnlyOffice to reload
  generateDocumentKey(documentId, lastModified) {
    return `${documentId}_${new Date(lastModified).getTime()}`;
  }

  // Get file extension from filename or mime type
  getFileExtension(filename, mimeType) {
    if (filename) {
      const ext = filename.split('.').pop().toLowerCase();
      if (ext) return ext;
    }
    
    // Fallback to mime type mapping
    const mimeToExt = {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.oasis.opendocument.text': 'odt',
      'application/msword': 'doc',
      'application/pdf': 'pdf',
    };
    
    return mimeToExt[mimeType] || 'docx';
  }

  // Handle OnlyOffice callback (when document is saved)
  async handleCallback(data) {
    console.log('OnlyOffice callback received:', data);
    
    if (data.status === 2 || data.status === 6) {
      // Status 2: Document is ready for saving
      // Status 6: Document is being edited, save the current version
      if (data.url) {
        try {
          // Download the document from OnlyOffice
          const response = await fetch(data.url);
          const blob = await response.blob();
          
          // Convert to base64
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                success: true,
                fileData: reader.result,
                error: 0
              });
            };
            reader.onerror = () => {
              reject({
                success: false,
                error: 1
              });
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error downloading document from OnlyOffice:', error);
          return { success: false, error: 1 };
        }
      }
    }
    
    return { error: 0 };
  }

  // Prefer fetching signed config from backend to satisfy JWT
  async fetchSignedConfig(document, editorMode = 'edit') {
    try {
      let resp = await fetch(`/api/documents/${document.id}/onlyoffice-config`);
      // If the document is unknown to the backend, try to register it now
      if (resp.status === 404 && document.fileData) {
        try {
          const up = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: document.id, name: document.name, type: document.type, base64: document.fileData })
          });
          if (up.ok) {
            resp = await fetch(`/api/documents/${document.id}/onlyoffice-config`);
          }
        } catch (_) {
          // ignore and fall through
        }
      }
      if (!resp.ok) throw new Error('config fetch failed');
      const { config, token } = await resp.json();
      return { config, token };
    } catch (e) {
      console.error('Failed to fetch signed config; falling back to client config.', e);
      const fileExt = this.getFileExtension(document.name, document.type);
      const documentKey = this.generateDocumentKey(document.id, document.lastModified);
      let documentType = 'word';
      if (['xls', 'xlsx', 'ods'].includes(fileExt)) documentType = 'cell';
      else if (['ppt', 'pptx', 'odp'].includes(fileExt)) documentType = 'slide';
      const config = {
        document: {
          fileType: fileExt,
          key: documentKey,
          title: document.name,
          url: document.fileUrl || `${this.baseUrl}/api/documents/${document.id}/download`,
          permissions: { edit: editorMode === 'edit', download: true, print: true, review: true, comment: true }
        },
        documentType,
        editorConfig: {
          mode: editorMode,
          lang: 'en',
          callbackUrl: `${this.baseUrl}/api/documents/${document.id}/callback`,
          user: { id: document.userId || 'user1', name: 'User' },
          customization: { autosave: true, forcesave: true }
        },
        height: '100%',
        width: '100%'
      };
      return { config, token: null };
    }
  }
}

export const documentServerAPI = new DocumentServerAPI();
