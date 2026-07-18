import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_FILES, type MockFile } from '../../../utils/mockFiles';
import './DocumentList.css';

interface ColumnConfig {
  key: keyof MockFile;
  label: string;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'st', label: 'ST' },
  { key: 'document', label: 'Document' },
  { key: 'version', label: 'Version' },
  { key: 'user', label: 'User' },
  { key: 'building', label: 'Building No.' },
  { key: 'drawing', label: 'Drawing No.' },
  { key: 'title', label: 'Title File Name' },
  { key: 'sub1', label: 'Sub Title 1' },
  { key: 'sub2', label: 'Sub Title 2' },
  { key: 'equipment', label: 'Equipment No.' },
  { key: 'status', label: 'Status' },
  { key: 'lastModified', label: 'Last Modified' },
];

const DocumentList: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [buildingFilter, setBuildingFilter] = useState('All');

  // Sorting State
  const [sortColumn, setSortColumn] = useState<keyof MockFile>('document');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Columns Visibilities State
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.map(c => c.key)
  );

  // Dynamic filter values
  const uniqueBuildings = useMemo(() => {
    return Array.from(new Set(MOCK_FILES.map(f => f.building).filter(Boolean))).sort();
  }, []);

  const handleSort = (column: keyof MockFile) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(k => k !== columnKey) 
        : [...prev, columnKey]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFormatFilter('All');
    setStatusFilter('All');
    setBuildingFilter('All');
    setCurrentPage(1);
  };

  // 1. Filter Logic
  const filteredFiles = useMemo(() => {
    return MOCK_FILES.filter(file => {
      // Search match
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        file.title.toLowerCase().includes(searchLower) ||
        file.document.toLowerCase().includes(searchLower) ||
        file.drawing.toLowerCase().includes(searchLower) ||
        file.user.toLowerCase().includes(searchLower) ||
        file.building.toLowerCase().includes(searchLower) ||
        file.equipment.toLowerCase().includes(searchLower);

      // Format match
      let matchesFormat = true;
      if (formatFilter !== 'All') {
        const ext = file.fileName.split('.').pop()?.toUpperCase();
        matchesFormat = ext === formatFilter;
      }

      // Status match
      const matchesStatus = statusFilter === 'All' || file.status === statusFilter;

      // Building match
      const matchesBuilding = buildingFilter === 'All' || file.building === buildingFilter;

      return matchesSearch && matchesFormat && matchesStatus && matchesBuilding;
    });
  }, [searchQuery, formatFilter, statusFilter, buildingFilter]);

  // 2. Sort Logic
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles];
    sorted.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Convert to string for comparisons if necessary
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
    return sorted;
  }, [filteredFiles, sortColumn, sortDirection]);

  // 3. Pagination Slice
  const totalItems = sortedFiles.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  
  // Adjust current page if it exceeds total pages after filtering
  const activePage = Math.min(currentPage, totalPages);

  const slicedFiles = useMemo(() => {
    const startIndex = (activePage - 1) * rowsPerPage;
    return sortedFiles.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedFiles, activePage, rowsPerPage]);

  const hasActiveFilters = searchQuery !== '' || formatFilter !== 'All' || statusFilter !== 'All' || buildingFilter !== 'All';

  // Get dynamic asset file URL helper
  const getAssetUrl = (fileName: string) => {
    return new URL(`../../../assets/${fileName}`, import.meta.url).href;
  };

  return (
    <div className="doclist-container">
      <div className="doclist-header">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted">Browse, search, and manage drawing documents.</p>
      </div>

      <div className="card table-container" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Controls Toolbar */}
        <div className="list-controls-bar">
          <div className="controls-left">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by title, doc code, building..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {hasActiveFilters && (
              <button 
                className="btn btn-secondary" 
                onClick={resetFilters} 
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                title="Reset Filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="controls-right">
            <div className="filter-group">
              <span className="text-xs font-semibold text-muted uppercase">Format</span>
              <select 
                value={formatFilter} 
                onChange={(e) => {
                  setFormatFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Formats</option>
                <option value="PDF">PDF Only</option>
                <option value="DWG">DWG Only</option>
                <option value="DWF">DWF Only</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="text-xs font-semibold text-muted uppercase">Status</span>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="text-xs font-semibold text-muted uppercase">Building</span>
              <select 
                value={buildingFilter} 
                onChange={(e) => {
                  setBuildingFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Buildings</option>
                {uniqueBuildings.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Column Customizer */}
            <div className="column-customizer-wrapper">
              <button 
                className={`btn btn-secondary ${showColumnsMenu ? 'active' : ''}`}
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                title="Customize Columns"
              >
                <SlidersHorizontal size={14} />
                <span>Columns</span>
              </button>

              {showColumnsMenu && (
                <div className="column-customizer-dropdown">
                  <span className="column-customizer-title">Toggle Columns</span>
                  {ALL_COLUMNS.map(col => (
                    <label key={col.key} className="column-toggle-label">
                      <input 
                        type="checkbox" 
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        disabled={visibleColumns.length === 1 && visibleColumns.includes(col.key)} // Keep at least one column
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto', flex: 1 }}>
          {slicedFiles.length === 0 ? (
            <div className="no-results-container">
              <AlertCircle size={36} style={{ opacity: 0.5 }} />
              <p className="font-semibold text-base">No matching drawings found</p>
              <p className="text-xs">Adjust your search keywords or filter values and try again.</p>
              <button className="btn btn-primary" onClick={resetFilters} style={{ marginTop: '0.5rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <table className="doc-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  {ALL_COLUMNS.map(col => {
                    const isVisible = visibleColumns.includes(col.key);
                    if (!isVisible) return null;

                    const isSorted = sortColumn === col.key;
                    return (
                      <th 
                        key={col.key} 
                        className="th-sortable" 
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="th-content">
                          <span>{col.label}</span>
                          <span className={`sort-indicator ${isSorted ? 'active' : ''}`}>
                            {isSorted && sortDirection === 'desc' ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronUp size={14} />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slicedFiles.map(file => (
                  <tr key={file.id}>
                    {visibleColumns.includes('st') && <td>{file.st}</td>}
                    {visibleColumns.includes('document') && (
                      <td className="font-medium text-primary">{file.document}</td>
                    )}
                    {visibleColumns.includes('version') && <td>{file.version}</td>}
                    {visibleColumns.includes('user') && <td>{file.user}</td>}
                    {visibleColumns.includes('building') && <td>{file.building}</td>}
                    {visibleColumns.includes('drawing') && <td>{file.drawing}</td>}
                    {visibleColumns.includes('title') && (
                      <td>
                        <div className="file-title">
                          <FileText size={16} />
                          {file.title}
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('sub1') && <td>{file.sub1}</td>}
                    {visibleColumns.includes('sub2') && <td>{file.sub2}</td>}
                    {visibleColumns.includes('equipment') && <td>{file.equipment}</td>}
                    {visibleColumns.includes('status') && (
                      <td>
                        <span className={`status-badge ${file.status.toLowerCase()}`}>
                          {file.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('lastModified') && <td>{file.lastModified}</td>}
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => navigate(`/files/${file.id}`)} 
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <a 
                          href={getAssetUrl(file.fileName)}
                          download={file.fileName}
                          className="btn-icon" 
                          title="Download File"
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer - Pagination */}
        {totalItems > 0 && (
          <div className="pagination-bar">
            <div className="pagination-left">
              <span>Show</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <span>
                Showing {Math.min((activePage - 1) * rowsPerPage + 1, totalItems)} to{' '}
                {Math.min(activePage * rowsPerPage, totalItems)} of {totalItems} files
              </span>
            </div>

            <div className="pagination-right">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(1)} 
                disabled={activePage === 1}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={activePage === 1}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button 
                  key={pageNum} 
                  className={`page-btn ${activePage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={activePage === totalPages}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={activePage === totalPages}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
