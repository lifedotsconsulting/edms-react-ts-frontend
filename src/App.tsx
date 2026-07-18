import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/public/login/Login';
import Home from './pages/private/home/Home';
import DocumentList from './pages/private/document-list/DocumentList';
import DocumentDetails from './pages/private/document-details/DocumentDetails';
import AccessControl from './pages/private/access-control/AccessControl';
import Profile from './pages/private/profile/Profile';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Private Routes with Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="files" element={<DocumentList />} />
            <Route path="files/:id" element={<DocumentDetails />} />
            <Route path="access-control" element={<AccessControl />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
