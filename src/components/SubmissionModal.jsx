import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const SubmissionModal = ({ isOpen, onClose, onCompleteInspection, onFillPartB }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Complete Report and Submit
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-start space-x-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">
                                    Complete Report and Submit
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Do you need to fill Part B (Detailed Inspection) which includes comprehensive questions about hazard identification, chemical storage, process safety, equipment safety, and other detailed safety assessments?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onCompleteInspection}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span>No, Complete Inspection</span>
                        </button>
                        <button
                            onClick={onFillPartB}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>Yes, Fill Part B</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;
