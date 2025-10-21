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
        <div className="flex-1 p-0 sm:p-6 overflow-y-auto">
            <div className="mb-6 p-4 sm:p-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Applications</h1>
                <p className="text-sm lg:text-base text-gray-600">View and manage factory inspection applications across different phases</p>
            </div>

            {/* Phase Filters */}
            <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-0 sm:border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-3">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <Filter className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Filter by Phase</h2>
                            <p className="text-sm text-gray-500">Select a phase to filter applications</p>
                        </div>
                    </div>
                    {selectedPhase && (
                        <button
                            onClick={() => setSelectedPhase(null)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors self-start sm:ml-auto"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filter
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4">
                    {phases.map((phase) => {
                        const Icon = phase.icon;
                        const isSelected = selectedPhase === phase.name;
                        return (
                            <button
                                key={phase.name}
                                onClick={() => handlePhaseFilter(phase.name)}
                                className={`group relative p-3 lg:p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${isSelected
                                    ? `${phase.bgColor} ${phase.borderColor} shadow-lg scale-105 ring-2 ring-offset-2 ${phase.borderColor.replace('border-', 'ring-')}`
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-2 lg:p-3 rounded-full mb-2 lg:mb-3 transition-colors duration-300 ${isSelected
                                        ? `${phase.bgColor} shadow-md`
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                        }`}>
                                        <Icon className={`h-5 w-5 lg:h-7 lg:w-7 transition-colors duration-300 ${isSelected ? phase.iconColor : 'text-gray-500 group-hover:text-gray-700'}`} />
                                    </div>
                                    <p className={`text-xs font-semibold leading-tight transition-colors duration-300 ${isSelected ? phase.textColor : 'text-gray-700 group-hover:text-gray-900'}`}>
                                        {phase.name}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-200">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h2 className="text-lg lg:text-xl font-bold text-gray-800">
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
                                    className={`p-4 lg:p-6 transition-colors duration-150 relative ${expandedApplications[app.id]
                                        ? 'bg-blue-50 border-l-4 border-blue-500 shadow-md'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2">
                                                <h3 className="text-base lg:text-lg font-semibold text-gray-800">
                                                    Application #{app.externalId}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border w-fit ${phaseConfig.bgColor} ${phaseConfig.textColor} ${phaseConfig.borderColor}`}>
                                                    <Icon className={`h-3 w-3 mr-1 ${phaseConfig.iconColor}`} />
                                                    {app.currentStatus}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
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
                                        <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                                            <button
                                                onClick={() => toggleExpandApplication(app.id)}
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm font-medium"
                                            >
                                                {expandedApplications[app.id] ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-1 sm:mr-2" />
                                                        <span className="hidden sm:inline">Hide History</span>
                                                        <span className="sm:hidden">Hide</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-1 sm:mr-2" />
                                                        <span className="hidden sm:inline">Show History</span>
                                                        <span className="sm:hidden">Show</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport(app.inspectionReportId)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium"
                                            >
                                                <Download className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="hidden sm:inline">Download PDF</span>
                                                <span className="sm:hidden">PDF</span>
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app)}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                                            >
                                                <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="hidden sm:inline">Update Status</span>
                                                <span className="sm:hidden">Update</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status History Section */}
                                    {expandedApplications[app.id] && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden">
                                            {loadingHistory[app.id] ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : statusHistory[app.id] && statusHistory[app.id].length > 0 ? (
                                                <div className="h-full flex flex-col">
                                                    <div className="flex items-center mb-3 flex-shrink-0 p-4 border-b border-gray-200">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                        <h4 className="text-md font-semibold text-gray-800">Status History for Application #{app.externalId}</h4>
                                                    </div>
                                                    <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Status
                                                                    </th>
                                                                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Comment
                                                                    </th>
                                                                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                                                            <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                {history.status}
                                                                            </td>
                                                                            <td className="px-3 lg:px-6 py-4 text-sm text-gray-700">
                                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                                    <span className="truncate max-w-xs sm:max-w-md">
                                                                                        {needsViewMore ? truncateComment(history.comment) : history.comment}
                                                                                    </span>
                                                                                    {needsViewMore && (
                                                                                        <button
                                                                                            onClick={() => handleViewComment(history.comment, history.status)}
                                                                                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap text-left sm:text-center"
                                                                                        >
                                                                                            View More
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
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
                                                <div className="flex items-center justify-center h-full p-4">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                        <p className="text-sm text-gray-500">No status history available for Application #{app.externalId}</p>
                                                    </div>
                                                </div>
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
                    <div className="p-4 lg:p-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="text-sm text-gray-600 text-center sm:text-left">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <span className="text-sm text-gray-500 text-center sm:text-left">
                                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                                </span>
                                <div className="flex justify-center space-x-2">
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
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-800">Status Comment</h3>
                            <button
                                onClick={handleCloseCommentModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4 lg:p-6 overflow-y-auto max-h-[60vh]">
                            <div className="mb-4 lg:mb-6 pb-4 border-b border-gray-200">
                                <label className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Status</label>
                                <p className="mt-1 text-base lg:text-lg font-medium text-gray-900">
                                    {selectedComment.status}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-green-600 uppercase tracking-wide">Comment</label>
                                <p className="mt-2 text-sm lg:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedComment.comment}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 lg:p-6 border-t border-gray-200 flex justify-end">
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

