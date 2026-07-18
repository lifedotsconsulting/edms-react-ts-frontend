import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/files?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="home-container">
      <div className="search-section">
        <h1 className="search-title">Find Drawings Fast</h1>
        <p className="search-subtitle">Search across thousands of engineering documents and files.</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={24} />
            <input 
              type="text" 
              className="search-input"
              placeholder="Enter drawing number, title, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
          </div>
          
          <button 
            type="button" 
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced Filters' : 'Advanced Search / Filters'}
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showAdvanced && (
            <div className="advanced-filters card">
              <div className="filter-grid">
                <div className="form-group"><label>Manufacturer</label><input type="text" placeholder="e.g. Acme Corp" /></div>
                <div className="form-group"><label>Author</label><input type="text" placeholder="e.g. John Doe" /></div>
                <div className="form-group"><label>Drawing Number</label><input type="text" placeholder="e.g. DWG-1001" /></div>
                <div className="form-group"><label>Discipline Code</label><input type="text" placeholder="e.g. MECH" /></div>
                <div className="form-group"><label>Subtitle 1</label><input type="text" /></div>
                <div className="form-group"><label>Subtitle 2</label><input type="text" /></div>
                <div className="form-group"><label>Cost Center</label><input type="text" placeholder="e.g. 50012" /></div>
                <div className="form-group"><label>WBS</label><input type="text" /></div>
                <div className="form-group"><label>Building Number</label><input type="text" placeholder="e.g. B-42" /></div>
                <div className="form-group"><label>Title (Temp)</label><input type="text" /></div>
                <div className="form-group"><label>Functional Location</label><input type="text" /></div>
                <div className="form-group"><label>Equipment Number (Temp)</label><input type="text" /></div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card card">
          <h3 className="card-header"><Clock size={18} /> Last Searched Items</h3>
          <ul className="item-list">
            <li><FileText size={16}/> DWG-8921 - Reactor Layout</li>
            <li><FileText size={16}/> DWG-1045 - Piping Diagram</li>
            <li><FileText size={16}/> DWG-3320 - HVAC Floor 2</li>
          </ul>
        </div>
        
        <div className="dashboard-card card">
          <h3 className="card-header"><FileText size={18} /> Last Viewed</h3>
          <ul className="item-list">
            <li><FileText size={16}/> DWG-5512 - Main Assembly</li>
            <li><FileText size={16}/> DOC-9011 - Maintenance Log</li>
          </ul>
        </div>
        
        <div className="dashboard-card card">
          <h3 className="card-header"><TrendingUp size={18} /> Most Searched</h3>
          <ul className="item-list">
            <li><FileText size={16}/> DWG-1000 - Site Master Plan</li>
            <li><FileText size={16}/> DWG-2000 - Electrical Grid</li>
            <li><FileText size={16}/> SPEC-400 - Steel Requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
