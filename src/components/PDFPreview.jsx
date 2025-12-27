
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocuments } from '@/contexts/DocumentContext';
import { FileText, Download, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function PDFPreview({ content, show }) {
  const { placeholders } = useDocuments();
  const { toast } = useToast();
  const [previewContent, setPreviewContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to process content and replace placeholders
  const processContent = (rawContent) => {
    if (!rawContent) return '';
    let replacedContent = rawContent;
    
    placeholders.forEach(placeholder => {
      // Escape special regex characters in the placeholder code
      const regex = new RegExp(placeholder.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      replacedContent = replacedContent.replace(regex, `<span class="text-blue-600 font-medium bg-blue-50 px-1 rounded border border-blue-100" title="${placeholder.category}: ${placeholder.templateType}">${placeholder.demoValue}</span>`);
    });
    
    // Simple conversion of newlines to line breaks for HTML display
    return replacedContent.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Real-time update effect
  useEffect(() => {
    if (show) {
      // Small debounce could be added here if performance becomes an issue
      setLastUpdated(new Date());
    }
  }, [content, show]);

  const handleDownload = () => {
    toast({
      title: "PDF Generation",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 h-full flex flex-col overflow-hidden shadow-xl">
      <div className="bg-white/5 px-4 py-3 border-b border-white/20 flex items-center justify-between shrink-0">
        <h3 className="text-white font-semibold flex items-center text-sm">
          <Eye className="w-4 h-4 mr-2 text-blue-400" />
          Live Preview
        </h3>
        <Button
          onClick={handleDownload}
          size="sm"
          variant="outline"
          className="h-8 text-xs border-white/20 text-white hover:bg-white/10"
        >
          <Download className="w-3 h-3 mr-1" />
          Export PDF
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-900/50">
        <AnimatePresence mode="wait">
          {show && content ? (
            <motion.div
              key="preview-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-sm shadow-2xl mx-auto min-h-[calc(100%-2rem)] max-w-[210mm] origin-top"
            >
              {/* Simulated A4 Paper Header */}
              <div className="h-16 border-b border-gray-100 mb-8 mx-8 flex items-end pb-2">
                 <div className="w-full flex justify-between items-center text-xs text-gray-400 font-sans">
                    <span>DMS PREVIEW MODE</span>
                    <span>{new Date().toLocaleDateString()}</span>
                 </div>
              </div>

              {/* Document Body */}
              <div className="px-12 pb-12 text-gray-800 font-serif leading-relaxed text-[11pt]">
                {/* We use a specialized renderer here instead of dangerouslySetInnerHTML for safety and React component integration */}
                <div className="whitespace-pre-wrap">
                  {/* Re-calculate display content on render to ensure it's always fresh */}
                  {(() => {
                    let replacedContent = content;
                    // First pass: identify structure (simple example)
                    
                    // Second pass: Replace placeholders with styled span elements (simulated via array mapping)
                    // Since we can't easily inject HTML strings safely into React without danger, 
                    // we will parse the string into segments.
                    
                    const segments = [];
                    let remaining = content;
                    
                    // Regex to find all placeholders
                    const placeholderCodes = placeholders.map(p => p.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                    const regex = new RegExp(`(${placeholderCodes})`, 'g');
                    
                    const parts = content.split(regex);
                    
                    return parts.map((part, i) => {
                      const placeholder = placeholders.find(p => p.code === part);
                      if (placeholder) {
                        return (
                           <span key={i} className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 text-sm font-medium select-all" title={`Placeholder: ${placeholder.code}`}>
                             {placeholder.demoValue}
                           </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    });
                  })()}
                </div>
              </div>
              
               {/* Simulated A4 Paper Footer */}
               <div className="mt-12 mx-8 pt-4 border-t border-gray-100 flex justify-center text-[10px] text-gray-400 font-sans">
                  Page 1 of 1
               </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className="bg-white/5 p-4 rounded-full mb-4">
                <FileText className="w-12 h-12 text-gray-500" />
              </div>
              <h4 className="text-white font-medium mb-2">Empty Document</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Start typing in the editor or insert placeholders to see the live preview.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/5 px-4 py-2 border-t border-white/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[10px] text-gray-400 uppercase tracking-wider">System Ready</span>
        </div>
        {lastUpdated && (
           <span className="text-[10px] text-gray-500">
             Updated: {lastUpdated.toLocaleTimeString()}
           </span>
        )}
      </div>
    </div>
  );
}

export default PDFPreview;
