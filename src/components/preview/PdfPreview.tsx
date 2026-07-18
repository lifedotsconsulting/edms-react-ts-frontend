import React from 'react';

interface PdfPreviewProps {
  url: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ url }) => {
  return (
    <div className="pdf-preview-container" style={{ width: '100%', height: '100%', minHeight: '500px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <iframe 
        src={`${url}#toolbar=0`} 
        width="100%" 
        height="100%" 
        style={{ border: 'none' }}
        title="PDF Preview"
      />
    </div>
  );
};

export default PdfPreview;
