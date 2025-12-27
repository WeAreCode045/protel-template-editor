import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

function OnlyOfficeStatus() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverUrl] = useState('http://server_onlyoffice-documentserver:80');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${serverUrl}/healthcheck`, {
        method: 'GET',
        mode: 'no-cors', // May need CORS setup
      });
      
      // With no-cors, we can't read the response, but no error means server is reachable
      setServerStatus('online');
    } catch (error) {
      console.error('OnlyOffice server check failed:', error);
      setServerStatus('offline');
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'online':
        return 'OnlyOffice Server: Connected';
      case 'offline':
        return 'OnlyOffice Server: Offline';
      default:
        return 'OnlyOffice Server: Checking...';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/20 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-white font-semibold text-sm">{getStatusText()}</h3>
            <p className="text-xs text-gray-400">{serverUrl}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={checkServerStatus}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            as="a"
            href="/ONLYOFFICE_SETUP.md"
            target="_blank"
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Setup Guide
          </Button>
        </div>
      </div>
      
      {serverStatus === 'offline' && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
          <p className="font-semibold mb-1">⚠️ OnlyOffice Server Not Available</p>
          <p>
            The document editor requires OnlyOffice Document Server to be running.
            Please check the setup guide for configuration instructions.
          </p>
        </div>
      )}

      {serverStatus === 'online' && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300">
          <p className="font-semibold mb-1">✓ OnlyOffice Server Connected</p>
          <p>
            Document editing is available. Note: For full functionality, you need to set up
            backend callbacks for document saving.
          </p>
        </div>
      )}
    </div>
  );
}

export default OnlyOfficeStatus;
