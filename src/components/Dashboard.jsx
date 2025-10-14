import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Dashboard = ({ onLogout, user }) => {
    const location = useLocation();

    // Determine current page from location
    const getCurrentPage = () => {
        if (location.pathname === '/' || location.pathname === '/dashboard') {
            return 'dashboard';
        }
        // Extract page name from path
        const pathParts = location.pathname.split('/').filter(Boolean);
        return pathParts[0] || 'dashboard';
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar onLogout={onLogout} currentPage={getCurrentPage()} />
            <div className="flex-1 flex flex-col">
                <Header user={user} />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
