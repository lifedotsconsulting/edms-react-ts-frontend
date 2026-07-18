import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  X, 
  Trash2, 
  UserPlus, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import './AccessControl.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Engineer' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatarColor: string;
}

interface Permission {
  key: string;
  name: string;
  description: string;
}

const ALL_PERMISSIONS: Permission[] = [
  { key: 'search', name: 'Search drawings', description: 'Search drawing documents by number, type, or title.' },
  { key: 'view', name: 'View drawings', description: 'View full drawing details, version history, and previews.' },
  { key: 'download', name: 'Download drawings', description: 'Download source files or PDFs for offline usage.' },
  { key: 'manage_users', name: 'Manage Users', description: 'Add, modify roles, and change system access status for users.' },
  { key: 'manage_metadata', name: 'Manage MetaData', description: 'Add, edit, or configure drawing building and equipment tags.' }
];

const ROLE_PERMISSIONS: Record<'Admin' | 'Engineer' | 'Viewer', string[]> = {
  Admin: ['search', 'view', 'download', 'manage_users', 'manage_metadata'],
  Engineer: ['search', 'view', 'download'],
  Viewer: ['search', 'view']
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice.smith@resonac.com', role: 'Admin', status: 'Active', lastActive: 'Just now', avatarColor: '#8b5cf6' },
  { id: '2', name: 'Bob Johnson', email: 'bob.johnson@resonac.com', role: 'Engineer', status: 'Active', lastActive: '2 hours ago', avatarColor: '#0ea5e9' },
  { id: '3', name: 'Charlie Brown', email: 'charlie.brown@resonac.com', role: 'Viewer', status: 'Active', lastActive: 'Yesterday', avatarColor: '#64748b' },
  { id: '4', name: 'Diana Prince', email: 'diana.prince@resonac.com', role: 'Engineer', status: 'Inactive', lastActive: '3 days ago', avatarColor: '#0ea5e9' },
  { id: '5', name: 'Evan Wright', email: 'evan.wright@resonac.com', role: 'Viewer', status: 'Active', lastActive: '5 hours ago', avatarColor: '#64748b' },
  { id: '6', name: 'Fiona Gallagher', email: 'fiona.g@resonac.com', role: 'Engineer', status: 'Active', lastActive: '10 minutes ago', avatarColor: '#0ea5e9' },
];

const ROLE_DESCRIPTIONS: Record<'Admin' | 'Engineer' | 'Viewer', string> = {
  Admin: 'Full access to view, download, manage users, and configure drawing metadata.',
  Engineer: 'Access to search, view details, and download drawing assets. No management rights.',
  Viewer: 'Read-only access to search and view drawing details. Download disabled.'
};

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#f43f5e'];

const AccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Engineer' | 'Viewer'>('Viewer');
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState('');

  // Dynamically calculate counts
  const totalUsers = users.length;
  const activeUsersCount = useMemo(() => users.filter(u => u.status === 'Active').length, [users]);
  const roleDistribution = useMemo(() => {
    return {
      Admin: users.filter(u => u.role === 'Admin').length,
      Engineer: users.filter(u => u.role === 'Engineer').length,
      Viewer: users.filter(u => u.role === 'Viewer').length,
    };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Action Handlers
  const handleRoleChange = (userId: string, newRole: 'Admin' | 'Engineer' | 'Viewer') => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active', lastActive: 'Just now' } 
          : user
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUserName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!newUserEmail.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: newUserStatus,
      lastActive: 'Never',
      avatarColor: randomColor
    };

    setUsers(prev => [newUser, ...prev]);
    
    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Viewer');
    setNewUserStatus('Active');
    setShowAddModal(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="access-control-container">
      <div className="access-control-header">
        <h1 className="text-2xl font-bold">Access Control</h1>
        <p className="text-muted">Manage system users, assigned roles, and feature permissions.</p>
      </div>

      {/* Main Tabs */}
      <div className="access-tabs">
        <button 
          className={`access-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Users
        </button>
        <button 
          className={`access-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={18} />
          Roles & Permissions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' ? (
          <div className="flex-col gap-4">
            {/* Stats Row */}
            <div className="stats-summary-grid">
              <div className="card stat-card">
                <div className="stat-icon-wrapper">
                  <Users size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-value">{totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <UserCheck size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-value">{activeUsersCount}</span>
                  <span className="stat-label">Active Users</span>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-value">{roleDistribution.Admin}</span>
                  <span className="stat-label">Admins</span>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                  <Shield size={20} style={{ color: '#0ea5e9' }} />
                </div>
                <div className="stat-details">
                  <span className="stat-value">{roleDistribution.Engineer}</span>
                  <span className="stat-label">Engineers</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: '1rem 1.5rem' }}>
              <div className="search-filter-row">
                <div className="search-input-wrapper">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-controls">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted uppercase">Role</span>
                    <select 
                      value={roleFilter} 
                      onChange={(e) => setRoleFilter(e.target.value)}
                      style={{ padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted uppercase">Status</span>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={16} />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="table-responsive">
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <AlertCircle size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p className="font-medium">No users found</p>
                    <p className="text-xs">Try adjusting your filters or search keywords.</p>
                  </div>
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Assigned Role</th>
                        <th>Status</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-profile-cell">
                              <div 
                                className="avatar" 
                                style={{ backgroundColor: user.avatarColor }}
                              >
                                {getInitials(user.name)}
                              </div>
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className={`role-badge ${user.role.toLowerCase()}`}>
                                {user.role}
                              </span>
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                style={{ 
                                  padding: '0.15rem 1.5rem 0.15rem 0.35rem', 
                                  fontSize: '0.75rem',
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Admin">Admin</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleStatusToggle(user.id)}
                              className={`status-badge ${user.status.toLowerCase()}`}
                              title="Click to toggle status"
                              style={{ border: 'none', cursor: 'pointer' }}
                            >
                              {user.status}
                            </button>
                          </td>
                          <td>
                            <span className="text-sm text-muted">{user.lastActive}</span>
                          </td>
                          <td>
                            <button 
                              className="btn-icon" 
                              onClick={() => handleDeleteUser(user.id)} 
                              title="Delete User"
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Roles & Permissions Tab */
          <div className="roles-grid">
            {(['Admin', 'Engineer', 'Viewer'] as const).map(roleName => {
              const assignedPermissions = ROLE_PERMISSIONS[roleName];
              const desc = ROLE_DESCRIPTIONS[roleName];
              const assignedCount = users.filter(u => u.role === roleName).length;

              return (
                <div key={roleName} className="card flex-col gap-4">
                  <div>
                    <div className="role-card-header">
                      <span className={`role-badge ${roleName.toLowerCase()}`} style={{ fontSize: '0.875rem', padding: '0.35rem 1rem' }}>
                        {roleName}
                      </span>
                      <span className="role-user-count">
                        {assignedCount} {assignedCount === 1 ? 'user' : 'users'}
                      </span>
                    </div>
                    <p className="role-card-desc">{desc}</p>
                  </div>

                  <div className="permissions-section">
                    <span className="permissions-title">System Permissions</span>
                    <div className="permission-list">
                      {ALL_PERMISSIONS.map(permission => {
                        const hasPermission = assignedPermissions.includes(permission.key);
                        return (
                          <div 
                            key={permission.key} 
                            className={`permission-item ${hasPermission ? 'allowed' : 'denied'}`}
                          >
                            <div>
                              <div className="font-semibold text-xs">{permission.name}</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '0.1rem' }}>
                                {permission.description}
                              </div>
                            </div>
                            <div className={`perm-indicator ${hasPermission ? 'yes' : 'no'}`}>
                              {hasPermission ? (
                                <Check size={16} />
                              ) : (
                                <X size={16} style={{ color: '#ef4444' }} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add User Modal Dialog */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Add System User</span>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="user-name">Full Name</label>
                  <input 
                    id="user-name"
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-email">Email Address</label>
                  <input 
                    id="user-email"
                    type="email" 
                    placeholder="e.g. john.doe@resonac.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user-role">Access Role</label>
                    <select 
                      id="user-role"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                    >
                      <option value="Viewer">Viewer (Read-Only)</option>
                      <option value="Engineer">Engineer (Download)</option>
                      <option value="Admin">Admin (Full Access)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="user-status">Initial Status</label>
                    <select 
                      id="user-status"
                      value={newUserStatus}
                      onChange={(e) => setNewUserStatus(e.target.value as any)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;

