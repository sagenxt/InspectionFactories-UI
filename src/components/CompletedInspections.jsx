import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import SubmitInspectionModal from './SubmitInspectionModal';
import {
    CheckCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Building,
    MapPin,
    Eye,
    Send
} from 'lucide-react';

const CompletedInspections = () => {
    const { showError, showSuccess } = useToast();
    const navigate = useNavigate();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);

    const loadCompletedInspections = useCallback(async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await inspectionAPI.getCompletedInspections(page, limit);
            const reports = response?.reports || [];
            setInspections(reports);

            if (response?.total !== undefined) {
                setPagination({
                    total: response.total,
                    page: response.page || page,
                    limit: response.limit || limit,
                    totalPages: response.totalPages || Math.ceil(response.total / (response.limit || limit))
                });
            }
        } catch (error) {
            console.error('Error loading completed inspections:', error);
            showError('Failed to load completed inspections. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const handleSubmitInspection = (inspection) => {
        setSelectedInspection(inspection);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInspection(null);
    };

    const handleSubmitApplication = async (externalId) => {
        try {
            await inspectionAPI.submitApplication(
                selectedInspection.id,
                externalId
            );

            showSuccess('Application submitted successfully');
            handleCloseModal();
            // Reload the list to update the UI
            loadCompletedInspections(pagination.page, pagination.limit);
        } catch (error) {
            console.error('Error submitting application:', error);
            // Re-throw the error with the original message from backend
            throw error;
        }
    };

    useEffect(() => {
        loadCompletedInspections(pagination.page, pagination.limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadCompletedInspections(newPage, pagination.limit);
        }
    };

    const handleViewInspection = (reportId) => {
        navigate(`/inspection/${reportId}/review`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-800">Completed Inspections</h1>
                </div>
                <p className="text-gray-600">View all inspection reports that have been completed and submitted</p>
            </div>

            {/* Completed Inspections List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            Completed Reports
                        </h2>
                        {!loading && (
                            <span className="text-sm text-gray-600">
                                {pagination.total} {pagination.total === 1 ? 'report' : 'reports'}
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Completed Inspections</h3>
                        <p className="text-gray-500">
                            There are no completed inspection reports at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {inspections.map((inspection) => (
                            <div
                                key={inspection.id}
                                className="p-6 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800 mr-3">
                                                {inspection.factoryName || `Inspection Report #${inspection.id}`}
                                            </h3>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                                Complete
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                            {inspection.factoryRegistrationNumber && (
                                                <div className="flex items-start">
                                                    <Building className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Registration Number</span>
                                                        <span>{inspection.factoryRegistrationNumber}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {inspection.inspectionDate && (
                                                <div className="flex items-start">
                                                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Inspection Date</span>
                                                        <span>{formatDate(inspection.inspectionDate)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {inspection.factoryAddress && (
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Address</span>
                                                        <span>{inspection.factoryAddress}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start">
                                                <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                <div>
                                                    <span className="font-medium text-gray-700 block">Report ID</span>
                                                    <span>#{inspection.id}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                <div>
                                                    <span className="font-medium text-gray-700 block">Created</span>
                                                    <span>{formatDateTime(inspection.createdAt)}</span>
                                                </div>
                                            </div>

                                            {inspection.updatedAt && (
                                                <div className="flex items-start">
                                                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Completed</span>
                                                        <span>{formatDateTime(inspection.updatedAt)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {inspection.metadata && inspection.metadata.metadata && (
                                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Metadata</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                    {Object.entries(inspection.metadata.metadata).map(([key, value]) => (
                                                        <div key={key} className="flex">
                                                            <span className="font-medium text-gray-600 mr-2">{key}:</span>
                                                            <span className="text-gray-800">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleViewInspection(inspection.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </button>
                                        {inspection.applicationNumber === null && (
                                            <button
                                                onClick={() => handleSubmitInspection(inspection)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Submit Application
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && inspections.length > 0 && pagination.total > pagination.limit && (
                    <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.totalPages}
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
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Inspection Modal */}
            <SubmitInspectionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                inspection={selectedInspection}
                onSubmit={handleSubmitApplication}
            />
        </div>
    );
};

export default CompletedInspections;

