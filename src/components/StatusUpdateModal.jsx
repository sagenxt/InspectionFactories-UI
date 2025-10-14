import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, FileText, Users, Building, Scale, MessageSquare, CheckCircle } from 'lucide-react';

const StatusUpdateModal = ({ isOpen, onClose, application, onSubmit, currentStatus }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const phases = [
        { name: 'Show Cause Notice', icon: AlertTriangle },
        { name: 'Improvement Notice', icon: FileText },
        { name: 'Proposal by Field Officer', icon: Users },
        { name: 'Action at Director', icon: Building },
        { name: 'Government', icon: Scale },
        { name: 'Complaint Filed', icon: MessageSquare },
        { name: 'Disposal', icon: CheckCircle }
    ];

    useEffect(() => {
        if (isOpen) {
            setSelectedStatus(currentStatus || '');
            setComment('');
        }
    }, [isOpen, currentStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStatus || !comment.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(selectedStatus, comment);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Update Application Status</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Application #{application?.externalId}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Current Status Display */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Status
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-medium">{currentStatus}</span>
                            </div>
                        </div>

                        {/* Status Dropdown */}
                        <div className="mb-6">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                New Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Select a status...</option>
                                {phases.map((phase) => {
                                    const Icon = phase.icon;
                                    return (
                                        <option key={phase.name} value={phase.name}>
                                            {phase.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Comment Field */}
                        <div className="mb-6">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Comment <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                                placeholder="Enter detailed comments about this status update..."
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                {comment.length} characters
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                disabled={isSubmitting || !selectedStatus || !comment.trim()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Status'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StatusUpdateModal;

