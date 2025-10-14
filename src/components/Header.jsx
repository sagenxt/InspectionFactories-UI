import React from 'react';
import { Users } from 'lucide-react';

const Header = ({ user }) => {
    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-baseline space-x-4">
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <div className="hidden md:block">
                                <span className="text-sm text-gray-400">|</span>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm text-gray-500">Factory Inspection System</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Factory Inspection Management System</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
                            <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                        </div>
                        <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                            <Users size={18} className="text-blue-600 mr-2" />
                            <span className="text-sm font-semibold text-blue-700">{user?.role || 'District Officer'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
