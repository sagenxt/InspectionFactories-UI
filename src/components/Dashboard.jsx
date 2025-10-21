import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Dashboard = ({ onLogout, user }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out`}>
                <Sidebar
                    onLogout={onLogout}
                    currentPage={getCurrentPage()}
                    onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                />
            </div>

            <div className="flex-1 flex flex-col lg:ml-0">
                <Header
                    user={user}
                    onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isMobileMenuOpen={isMobileMenuOpen}
                />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
