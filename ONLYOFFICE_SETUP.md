# OnlyOffice Document Server Integration

This document explains how OnlyOffice Document Server is integrated with the Protel Template Editor.

## Overview

OnlyOffice Document Server is used to provide rich document editing capabilities for uploaded Word documents (.docx, .odt). The integration allows users to:
- Edit documents in real-time with full formatting support
- Automatically save changes
- Insert placeholders into documents
- Preview and export documents

## Architecture

### Components

1. **Frontend (React)**
   - `DocumentEditor.jsx` - Main editor component using `@onlyoffice/document-editor-react`
   - `documentServer.js` - API client for OnlyOffice integration
   - `DocumentContext.jsx` - Document state management

2. **OnlyOffice Document Server**
   - Hosted at: `http://server_onlyoffice-documentserver:80/`
   - Provides the document editing interface
   - Handles document rendering and editing

3. **Backend API** (to be implemented)
   - Serves documents to OnlyOffice
   - Receives save callbacks from OnlyOffice
   - Manages document storage

## How It Works

### Document Loading Flow

1. User uploads a document (.docx, .odt)
2. Document is stored as base64 in localStorage with metadata
3. When editing, the app generates OnlyOffice config with:
   - Document URL (base64 data URL)
   - Unique document key (id + timestamp)
   - Callback URL for saves
4. OnlyOffice loads the document from the data URL
5. User can edit the document in the OnlyOffice interface

### Document Saving Flow

1. OnlyOffice auto-saves periodically or on user action
2. OnlyOffice sends callback to backend with status and download URL
3. Backend downloads the updated document from OnlyOffice
4. Backend converts to base64 and updates localStorage
5. Document is marked as saved with new timestamp

## Configuration

### OnlyOffice Document Server URL

The document server URL is configured in `DocumentEditor.jsx`:

```javascript
documentServerUrl="http://server_onlyoffice-documentserver:80/"
```

**For Production:** Update this to your actual OnlyOffice Document Server URL.

### Document Configuration

Each document requires:
- `fileType`: Extension (docx, odt, doc, etc.)
- `key`: Unique identifier (changes on each save to trigger reload)
- `title`: Document display name
- `url`: Document URL (currently using base64 data URLs)
- `callbackUrl`: Endpoint for save callbacks

## Current Limitations & TODO

### ⚠️ Known Issues

1. **Callback URL Not Working**: OnlyOffice callbacks require a backend server
   - Currently no backend to receive save callbacks
   - Document saves are not persisted from OnlyOffice edits
   
2. **Data URL Limitation**: Using base64 data URLs has size limits
   - May not work for large documents (>10MB)
   - OnlyOffice may require proper HTTP URLs

3. **No Placeholder Insertion**: The placeholder insertion API is not implemented
   - Need to use OnlyOffice Document Builder API
   - Requires backend processing

### ✅ Required Setup for Production

#### 1. Set up Backend API

Create endpoints for:

```javascript
// Serve document to OnlyOffice
GET /api/documents/:id/download
Response: Binary file (docx/odt)

// Receive save callbacks
POST /api/documents/:id/callback
Body: { status, url, key, users }
Response: { error: 0 }
```

Example with Express.js:

```javascript
const express = require('express');
const app = express();

// Serve document
app.get('/api/documents/:id/download', async (req, res) => {
  const doc = await getDocument(req.params.id);
  const buffer = Buffer.from(doc.fileData.split(',')[1], 'base64');
  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.send(buffer);
});

// Handle callback
app.post('/api/documents/:id/callback', async (req, res) => {
  const { status, url } = req.body;
  
  if (status === 2) { // Ready for save
    const response = await fetch(url);
    const buffer = await response.buffer();
    await saveDocument(req.params.id, buffer);
  }
  
  res.json({ error: 0 });
});
```

#### 2. Update Document Server API

In `src/api/documentServer.js`, update URLs:

```javascript
createConfig(document, editorMode = 'edit') {
  return {
    document: {
      url: `${this.baseUrl}/api/documents/${document.id}/download`,
      // ...
    },
    editorConfig: {
      callbackUrl: `${this.baseUrl}/api/documents/${document.id}/callback`,
      // ...
    }
  };
}
```

#### 3. Configure CORS

OnlyOffice Document Server needs CORS access:

```javascript
// Backend server
app.use(cors({
  origin: 'http://server_onlyoffice-documentserver:80',
  credentials: true
}));
```

#### 4. Storage Migration

Move from localStorage to proper database:
- MongoDB, PostgreSQL, or similar
- Store files in S3, MinIO, or filesystem
- Keep metadata in database

## Testing

### Verify OnlyOffice Server

```bash
curl http://server_onlyoffice-documentserver:80/healthcheck
```

Should return: `true`

### Test Document Loading

1. Upload a .docx file
2. Click to edit
3. Check browser console for:
   - "OnlyOffice Document Editor is ready"
   - No CORS errors
   - No 404 errors for document URL

### Test Document Saving

1. Make edits in OnlyOffice
2. Check Network tab for callback POST request
3. Verify backend receives callback
4. Confirm document is updated in storage

## Troubleshooting

### Editor Shows "Download Failed"

- Check document URL is accessible
- Verify OnlyOffice server can reach the URL
- Check CORS headers

### Saves Not Working

- Verify callback URL is set
- Check backend receives POST requests
- Review OnlyOffice logs: `docker logs <onlyoffice-container>`

### Performance Issues

- Large documents may be slow with base64 URLs
- Use proper file storage (S3, filesystem)
- Enable OnlyOffice caching

## Resources

- [OnlyOffice API Documentation](https://api.onlyoffice.com/editors/config/)
- [React Component Docs](https://github.com/ONLYOFFICE/document-editor-react)
- [Document Server Setup](https://helpcenter.onlyoffice.com/installation/docs-developer-edition-docker.aspx)

## Development vs Production

### Development (Current)
- ✅ Frontend only with base64 data URLs
- ✅ OnlyOffice editor loads in iframe
- ❌ No save functionality
- ❌ Placeholder insertion not working

### Production (Recommended)
- ✅ Backend API with proper endpoints
- ✅ File storage (S3/MinIO/filesystem)
- ✅ Database for metadata
- ✅ OnlyOffice save callbacks working
- ✅ Full document lifecycle management
