import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import StatusUpdateModal from './StatusUpdateModal';
import {
    AlertTriangle,
    FileText,
    Users,
    Building,
    Scale,
    MessageSquare,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Edit,
    Download,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const Applications = () => {
    const { showError, showSuccess } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhase, setSelectedPhase] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [expandedApplications, setExpandedApplications] = useState({});
    const [statusHistory, setStatusHistory] = useState({});
    const [loadingHistory, setLoadingHistory] = useState({});
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState({ comment: '', status: '' });

    const phases = [
        {
            name: 'Show Cause Notice',
            icon: AlertTriangle,
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            borderColor: 'border-red-200',
            iconColor: 'text-red-500'
        },
        {
            name: 'Improvement Notice',
            icon: FileText,
            color: 'orange',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700',
            borderColor: 'border-orange-200',
            iconColor: 'text-orange-500'
        },
        {
            name: 'Proposal by Field Officer',
            icon: Users,
            color: 'purple',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
            borderColor: 'border-purple-200',
            iconColor: 'text-purple-500'
        },
        {
            name: 'Action at Director',
            icon: Building,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            borderColor: 'border-indigo-200',
            iconColor: 'text-indigo-500'
        },
        {
            name: 'Government',
            icon: Scale,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-500'
        },
        {
            name: 'Complaint Filed',
            icon: MessageSquare,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-500'
        },
        {
            name: 'Disposal',
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            borderColor: 'border-green-200',
            iconColor: 'text-green-500'
        }
    ];

    const loadApplications = useCallback(async (page = 1, limit = 10, status = null) => {
        try {
            setLoading(true);
            const response = await inspectionAPI.getApplications(page, limit, status);
            const apps = response?.data || [];
            setApplications(apps);

            if (response?.total !== undefined) {
                setPagination({
                    total: response.total,
                    page: response.page || page,
                    limit: response.limit || limit
                });
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            showError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    // Initialize filter from URL search params on mount
    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam && !initialized) {
            setSelectedPhase(statusParam);
            setInitialized(true);
        } else if (!initialized) {
            setInitialized(true);
        }
    }, [searchParams, initialized]);

    // Load applications when phase changes or on initialization
    useEffect(() => {
        if (initialized) {
            loadApplications(1, pagination.limit, selectedPhase);
        }
    }, [selectedPhase, initialized, loadApplications, pagination.limit]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
            loadApplications(newPage, pagination.limit, selectedPhase);
        }
    };

    const handlePhaseFilter = (phaseName) => {
        if (selectedPhase === phaseName) {
            setSelectedPhase(null);
            // Clear status from URL
            searchParams.delete('status');
            setSearchParams(searchParams);
        } else {
            setSelectedPhase(phaseName);
            // Update URL with new status
            setSearchParams({ status: phaseName });
        }
    };

    const getPhaseConfig = (status) => {
        return phases.find(p => p.name === status) || {
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-700',
            borderColor: 'border-gray-200',
            iconColor: 'text-gray-500',
            icon: FileText
        };
    };

    const handleUpdateStatus = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    const handleSubmitStatusUpdate = async (newStatus, comment) => {
        try {
            await inspectionAPI.updateApplicationStatus(
                selectedApplication.id,
                newStatus,
                comment
            );

            showSuccess('Application status updated successfully');

            // Reload the current page to show updated data
            loadApplications(pagination.page, pagination.limit, selectedPhase);
        } catch (error) {
            console.error('Error updating application status:', error);
            showError('Failed to update application status. Please try again.');
            throw error;
        }
    };

    const handleDownloadReport = async (inspectionReportId) => {
        try {
            await inspectionAPI.downloadInspectionReport(inspectionReportId);
            showSuccess('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            showError('Failed to download report. Please try again.');
        }
    };

    const toggleExpandApplication = async (applicationId) => {
        const isExpanded = expandedApplications[applicationId];

        if (!isExpanded && !statusHistory[applicationId]) {
            // Load status history if not already loaded
            try {
                setLoadingHistory({ ...loadingHistory, [applicationId]: true });
                const history = await inspectionAPI.getApplicationStatusHistory(applicationId);
                setStatusHistory({ ...statusHistory, [applicationId]: history });
                setLoadingHistory({ ...loadingHistory, [applicationId]: false });
            } catch (error) {
                console.error('Error loading status history:', error);
                showError('Failed to load status history. Please try again.');
                setLoadingHistory({ ...loadingHistory, [applicationId]: false });
                return;
            }
        }

        setExpandedApplications({
            ...expandedApplications,
            [applicationId]: !isExpanded
        });
    };

    const countWords = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    };

    const truncateComment = (comment) => {
        if (!comment) return '';
        const words = comment.trim().split(/\s+/);
        if (words.length <= 50) return comment;
        return words.slice(0, 50).join(' ') + '...';
    };

    const handleViewComment = (comment, status) => {
        setSelectedComment({ comment, status });
        setCommentModalOpen(true);
    };

    const handleCloseCommentModal = () => {
        setCommentModalOpen(false);
        setSelectedComment({ comment: '', status: '' });
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Applications</h1>
                <p className="text-gray-600">View and manage factory inspection applications across different phases</p>
            </div>

            {/* Phase Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">Filter by Phase</h2>
                    {selectedPhase && (
                        <button
                            onClick={() => setSelectedPhase(null)}
                            className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear Filter
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {phases.map((phase) => {
                        const Icon = phase.icon;
                        const isSelected = selectedPhase === phase.name;
                        return (
                            <button
                                key={phase.name}
                                onClick={() => handlePhaseFilter(phase.name)}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                    ? `${phase.bgColor} ${phase.borderColor} shadow-md scale-105`
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? phase.iconColor : 'text-gray-400'}`} />
                                <p className={`text-xs font-medium text-center ${isSelected ? phase.textColor : 'text-gray-600'}`}>
                                    {phase.name}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {selectedPhase ? `${selectedPhase} Applications` : 'All Applications'}
                        </h2>
                        {!loading && (
                            <span className="text-sm text-gray-600">
                                {pagination.total} {pagination.total === 1 ? 'application' : 'applications'}
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Found</h3>
                        <p className="text-gray-500">
                            {selectedPhase
                                ? `There are no applications in the "${selectedPhase}" phase.`
                                : 'No applications available at the moment.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {applications.map((app) => {
                            const phaseConfig = getPhaseConfig(app.currentStatus);
                            const Icon = phaseConfig.icon;
                            return (
                                <div
                                    key={app.id}
                                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <h3 className="text-lg font-semibold text-gray-800 mr-3">
                                                    Application #{app.externalId}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${phaseConfig.bgColor} ${phaseConfig.textColor} ${phaseConfig.borderColor}`}>
                                                    <Icon className={`h-3 w-3 mr-1 ${phaseConfig.iconColor}`} />
                                                    {app.currentStatus}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium text-gray-700">Internal ID:</span>
                                                    <span className="ml-2">{app.id}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Inspection Report:</span>
                                                    <span className="ml-2">#{app.inspectionReportId}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Created:</span>
                                                    <span className="ml-2">
                                                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {app.updatedAt && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Last Updated:</span>
                                                        <span className="ml-2">
                                                            {new Date(app.updatedAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex space-x-2">
                                            <button
                                                onClick={() => toggleExpandApplication(app.id)}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
                                            >
                                                {expandedApplications[app.id] ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-2" />
                                                        Hide History
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        Show History
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport(app.inspectionReportId)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Update Status
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status History Section */}
                                    {expandedApplications[app.id] && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            {loadingHistory[app.id] ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : statusHistory[app.id] && statusHistory[app.id].length > 0 ? (
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-800 mb-3">Status History</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Status
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Comment
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Created At
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {statusHistory[app.id].map((history) => {
                                                                    const wordCount = countWords(history.comment);
                                                                    const needsViewMore = wordCount > 6;
                                                                    return (
                                                                        <tr key={history.id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                {history.status}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="truncate max-w-md">
                                                                                        {needsViewMore ? truncateComment(history.comment) : history.comment}
                                                                                    </span>
                                                                                    {needsViewMore && (
                                                                                        <button
                                                                                            onClick={() => handleViewComment(history.comment, history.status)}
                                                                                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                                                                                        >
                                                                                            View More
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {new Date(history.createdAt).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No status history available.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading && applications.length > 0 && pagination.total > pagination.limit && (
                    <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </div>
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
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            <StatusUpdateModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                application={selectedApplication}
                currentStatus={selectedApplication?.currentStatus}
                onSubmit={handleSubmitStatusUpdate}
            />

            {/* Comment View Modal */}
            {commentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Status Comment</h3>
                            <button
                                onClick={handleCloseCommentModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <label className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Status</label>
                                <p className="mt-1 text-lg font-medium text-gray-900">
                                    {selectedComment.status}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-green-600 uppercase tracking-wide">Comment</label>
                                <p className="mt-2 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedComment.comment}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleCloseCommentModal}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applications;

