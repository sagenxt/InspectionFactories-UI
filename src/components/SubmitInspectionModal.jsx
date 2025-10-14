import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const SubmitInspectionModal = ({ isOpen, onClose, inspection, onSubmit }) => {
    const [externalId, setExternalId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!externalId.trim()) {
            setError('Application ID is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await onSubmit(externalId);
            // Reset form on success
            setExternalId('');
            onClose();
        } catch (error) {
            // Display the exact error message from the backend
            const errorMessage = error.message || 'Failed to submit application. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setExternalId('');
            setError('');
            onClose();
        }
    };

    if (!isOpen || !inspection) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Submit Inspection as Application</h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Inspection Details</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Report ID:</span> #{inspection.id}
                                </div>
                                {inspection.factoryName && (
                                    <div>
                                        <span className="font-medium">Factory:</span> {inspection.factoryName}
                                    </div>
                                )}
                                {inspection.factoryRegistrationNumber && (
                                    <div>
                                        <span className="font-medium">Registration:</span> {inspection.factoryRegistrationNumber}
                                    </div>
                                )}
                            </div>
                        </div>

                        <label htmlFor="externalId" className="block text-sm font-medium text-gray-700 mb-2">
                            Application ID (External ID) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="externalId"
                            value={externalId}
                            onChange={(e) => {
                                setExternalId(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter Application ID"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            This ID will be used to identify the application in the system
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !externalId.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitInspectionModal;

