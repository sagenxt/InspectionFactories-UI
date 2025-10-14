import React from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    BarChart3,
    FolderOpen,
    FileText,
    Users,
    Settings,
    LogOut,
    CheckCircle
} from 'lucide-react';

const Sidebar = ({ onLogout, currentPage }) => {
    const menuItems = [
        { icon: Home, label: 'Dashboard', page: 'dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Applications', page: 'applications', path: '/applications' },
        { icon: CheckCircle, label: 'Completed Inspections', page: 'completed-inspections', path: '/completed-inspections' },
        // { icon: BarChart3, label: 'Reports', page: 'reports', path: '/reports' },
        // { icon: FolderOpen, label: 'Case Management', page: 'case-management', path: '/case-management' },
        // { icon: Users, label: 'Users', page: 'users', path: '/users' },
        // { icon: Settings, label: 'Settings', page: 'settings', path: '/settings' },
    ];

    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Factory Inspector</h2>
            </div>

            <div className="flex-1 p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Main Navigation</h3>
                <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.page;
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                    <LogOut size={20} className="mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
