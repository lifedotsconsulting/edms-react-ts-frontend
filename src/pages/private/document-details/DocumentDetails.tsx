import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, FileWarning } from 'lucide-react';
import PdfPreview from '../../../components/preview/PdfPreview';
import CadPreview from '../../../components/preview/CadPreview';
import { MOCK_FILES } from '../../../utils/mockFiles';
import './DocumentDetails.css';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const docId = Number(id);
  const doc = MOCK_FILES.find(f => f.id === docId);

  if (!doc) {
    return (
      <div className="doc-details-container flex items-center justify-center" style={{ height: '70vh' }}>
        <div className="card flex-col items-center gap-4 text-center" style={{ maxWidth: '400px', padding: '2rem' }}>
          <FileWarning size={48} className="text-muted" style={{ color: '#ef4444' }} />
          <div>
            <h2 className="text-xl font-bold">Document Not Found</h2>
            <p className="text-muted mt-2">The requested drawing document could not be located in the asset database.</p>
          </div>
          <button className="btn btn-primary w-full" onClick={() => navigate('/files')}>
            Back to Files
          </button>
        </div>
      </div>
    );
  }

  // Resolve assets path dynamically through Vite URL compiler
  const assetUrl = new URL(`../../../assets/${doc.fileName}`, import.meta.url).href;
  const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
  const isCad = doc.fileName.toLowerCase().endsWith('.dwg') || doc.fileName.toLowerCase().endsWith('.dwf');

  return (
    <div className="doc-details-container">
      <div className="doc-details-header">
        <div className="flex items-center gap-4">
          <button className="btn-icon" onClick={() => navigate('/files')} title="Back to Files">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{doc.title}</h1>
            <p className="text-muted">{doc.document} &bull; Version {doc.version}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary">
            <Share2 size={18} /> Share
          </button>
          <a 
            href={assetUrl} 
            download={doc.fileName}
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={18} /> Download
          </a>
        </div>
      </div>

      <div className="doc-details-content">
        <div className="doc-preview card" style={{ padding: '0', overflow: 'hidden' }}>
          {isPdf ? (
            <PdfPreview url={assetUrl} />
          ) : isCad ? (
            <CadPreview url={assetUrl} fileName={doc.fileName} />
          ) : (
            <div className="flex-col items-center justify-center" style={{ height: '500px', backgroundColor: 'var(--bg-surface-hover)' }}>
              <FileWarning size={48} className="text-muted" />
              <span className="text-sm font-medium mt-2">Preview not available for this format</span>
            </div>
          )}
        </div>
        
        <div className="doc-metadata card">
          <h2 className="text-lg font-semibold mb-4">Metadata Properties</h2>
          
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Document Code</span>
              <span className="metadata-value font-medium text-primary">{doc.document}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">File Name</span>
              <span className="metadata-value text-xs font-mono">{doc.fileName}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Status</span>
              <span className={`status-badge ${doc.status.toLowerCase()}`}>
                {doc.status}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Drawing Number</span>
              <span className="metadata-value">{doc.drawing}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Building Number</span>
              <span className="metadata-value">{doc.building}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Equipment Number</span>
              <span className="metadata-value">{doc.equipment}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Sub Title 1</span>
              <span className="metadata-value">{doc.sub1}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Sub Title 2</span>
              <span className="metadata-value">{doc.sub2}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Uploaded By</span>
              <span className="metadata-value">{doc.user}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Last Modified Date</span>
              <span className="metadata-value">{doc.lastModified}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;

