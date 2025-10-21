import React from 'react';
import { Users, Menu } from 'lucide-react';

const Header = ({ user, onMobileMenuToggle }) => {
    console.log(user);
    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
                <div className="flex items-center justify-between">
                    {/* Mobile hamburger menu button */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Toggle mobile menu"
                    >
                        <Menu size={20} className="text-gray-600" />
                    </button>

                    <div className="flex-1">
                        <div className="flex items-baseline space-x-2 sm:space-x-4">
                            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
                            <div className="hidden md:block">
                                <span className="text-sm text-gray-400">|</span>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm text-gray-500">Factory Inspection System</p>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Factory Inspection Management System</p>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                       
                        <div className="flex items-center px-2 sm:px-2 lg:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full border border-blue-200">
                            <Users size={14} className="text-blue-600 mr-1 sm:mr-1 lg:mr-2" />
                            <span className="text-xs font-semibold text-blue-700">{user?.name || 'District Officer'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
