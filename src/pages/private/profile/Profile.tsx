import React from 'react';
import { User, Mail, Building } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="flex-col gap-4 max-w-2xl mx-auto" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold">User Profile</h1>
        <p className="text-muted">Manage your personal information.</p>
      </div>
      
      <div className="card mt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary text-white flex items-center justify-center rounded-full" style={{ width: '64px', height: '64px', fontSize: '1.5rem', fontWeight: 'bold' }}>
            JD
          </div>
          <div>
            <h2 className="text-xl font-bold">John Doe</h2>
            <p className="text-muted">Engineering Department</p>
          </div>
        </div>
        
        <div className="flex-col gap-4">
          <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <Mail className="text-muted" />
            <div>
              <p className="text-sm text-muted">Email Address</p>
              <p className="font-medium">john.doe@resonac.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-b pb-4 mt-2" style={{ borderColor: 'var(--border-color)' }}>
            <Building className="text-muted" />
            <div>
              <p className="text-sm text-muted">Location / Building</p>
              <p className="font-medium">Building B-42, Floor 2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <User className="text-muted" />
            <div>
              <p className="text-sm text-muted">Role</p>
              <p className="font-medium">Senior Engineer</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <button className="btn btn-primary flex-1">Edit Profile</button>
          <button className="btn btn-secondary flex-1">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
