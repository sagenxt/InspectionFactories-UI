import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Play, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import SummaryCards from './SummaryCards';
import PhasesGrid from './PhasesGrid';

const MainContent = () => {
    const navigate = useNavigate();
    const { showError } = useToast();
    const [activeReports, setActiveReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10
    });

    const loadActiveReports = useCallback(async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await inspectionAPI.getActiveInspectionReports(page, limit);
            // Handle both array response and paginated response
            const reports = Array.isArray(response) ? response : (response?.data || []);
            setActiveReports(reports);

            // Store pagination metadata
            if (response?.total !== undefined) {
                setPagination({
                    total: response.total,
                    page: response.page || page,
                    limit: response.limit || limit
                });
            }
        } catch (error) {
            console.error('Error loading active reports:', error);
            showError('Failed to load active inspection reports. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadActiveReports();
    }, [loadActiveReports]);

    const handleStartInspection = (inspectionReportId) => {
        // Navigate to inspection page with the reportId
        navigate(`/inspection/${inspectionReportId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
            loadActiveReports(newPage, pagination.limit);
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'draft':
                return <Clock className="h-5 w-5 text-orange-500" />;
            case 'in_progress':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-orange-100 text-orange-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            {/* Original Dashboard Components */}
            <SummaryCards />
            <PhasesGrid />

            {/* Active Inspection Reports Section */}
            <div className="mt-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Active Inspection Reports</h2>
                    <p className="text-gray-600">Manage and continue your inspection reports</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : activeReports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Reports</h3>
                        <p className="text-gray-500 mb-6">You don't have any active inspection reports at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {activeReports?.map((report) => (
                            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                {report.factoryName}
                                            </h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                                                {getStatusIcon(report.status)}
                                                <span className="ml-2 capitalize">{report.status}</span>
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Registration:</span> {report.factoryRegistrationNumber}
                                            </div>
                                            <div>
                                                <span className="font-medium">Report ID:</span> {report.id}
                                            </div>
                                            <div>
                                                <span className="font-medium">Address:</span> {report.factoryAddress}
                                            </div>
                                            <div>
                                                <span className="font-medium">Created:</span> {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        {report.status.toLowerCase() === 'pending' && 'Ready to start inspection'}
                                        {report.status.toLowerCase() === 'draft' && 'Draft inspection - resume where you left off'}
                                        {report.status.toLowerCase() === 'in_progress' && 'Inspection in progress'}
                                        {report.status.toLowerCase() === 'complete' && 'Inspection completed'}
                                        {report.status.toLowerCase() === 'yettostart' && 'Ready to start inspection'}
                                    </div>

                                    {report.status.toLowerCase() === 'yettostart' && (
                                        <button
                                            onClick={() => handleStartInspection(report.id)}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Play className="h-4 w-4" />
                                            <span>Start Inspection</span>
                                        </button>
                                    )}

                                    {(report.status.toLowerCase() === 'draft') && (
                                        <button
                                            onClick={() => handleStartInspection(report.id)}
                                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Play className="h-4 w-4" />
                                            <span>{report.status.toLowerCase() === 'draft' ? 'Resume Inspection' : 'Continue Inspection'}</span>
                                        </button>
                                    )}

                                    {report.status.toLowerCase() === 'completed' && (
                                        <span className="text-green-600 font-medium flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Completed</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Info */}
                {!loading && activeReports.length > 0 && pagination.total > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {activeReports.length} of {pagination.total} report{pagination.total !== 1 ? 's' : ''}
                        </div>
                        {Math.ceil(pagination.total / pagination.limit) > 1 && (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainContent;
