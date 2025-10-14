import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Save } from 'lucide-react';
import { inspectionAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { getCurrentLocation } from '../utils/location';

const ReviewScreen = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [sections, setSections] = useState([]);
    const [partASections, setPartASections] = useState([]);
    const [answers, setAnswers] = useState({});
    const [partAAnswers, setPartAAnswers] = useState({});
    const [sectionQuestions, setSectionQuestions] = useState({});
    const [partAQuestions, setPartAQuestions] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isPartB, setIsPartB] = useState(false);

    useEffect(() => {
        if (reportId) {
            loadReviewData();
        } else {
            navigate('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportId]);

    const loadReviewData = async () => {
        try {
            setLoading(true);

            // Load existing answers to determine which parts were filled
            const existingAnswers = await inspectionAPI.getAnswers(reportId);

            // Load Part A sections
            const partASectionsData = await inspectionAPI.getSections("A");
            setPartASections(partASectionsData);

            // Load Part B sections
            let partBSectionsData = [];
            try {
                partBSectionsData = await inspectionAPI.getSections("B");
            } catch (error) {
                console.warn('Could not load Part B sections:', error);
            }

            // Create sets of section IDs for quick lookup
            const partASectionIds = new Set(partASectionsData.map(s => s.id));
            const partBSectionIds = new Set(partBSectionsData.map(s => s.id));

            // Separate answers into Part A and Part B
            const partAAnswersData = {};
            const partBAnswersData = {};
            let hasPartBAnswers = false;

            existingAnswers.forEach(answer => {
                const answerData = {
                    value: answer.value,
                    notes: answer.notes || ''
                };

                if (answer.Question && answer.Question.sectionId) {
                    const sectionId = answer.Question.sectionId;

                    if (partASectionIds.has(sectionId)) {
                        partAAnswersData[answer.questionId] = answerData;
                    } else if (partBSectionIds.has(sectionId)) {
                        partBAnswersData[answer.questionId] = answerData;
                        hasPartBAnswers = true;
                    }
                }
            });

            setPartAAnswers(partAAnswersData);
            setAnswers(partBAnswersData);
            setIsPartB(hasPartBAnswers);

            // Set the appropriate sections based on whether Part B was filled
            if (hasPartBAnswers) {
                setSections(partBSectionsData);
            } else {
                setSections(partASectionsData);
            }

            // Load questions for all sections
            await loadAllQuestions(partASectionsData, partBSectionsData, hasPartBAnswers);
        } catch (error) {
            console.error('Error loading review data:', error);
            showError('Failed to load inspection data. Please try again.');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadAllQuestions = async (partASectionsData, partBSectionsData, hasPartB) => {
        try {
            const questionsBySection = {};
            const partAQuestionsBySection = {};

            // Load Part A questions
            for (const section of partASectionsData) {
                const questions = await inspectionAPI.getQuestions(section.id);
                if (hasPartB) {
                    partAQuestionsBySection[section.id] = questions;
                } else {
                    questionsBySection[section.id] = questions;
                }
            }

            // Load Part B questions if needed
            if (hasPartB && partBSectionsData.length > 0) {
                for (const section of partBSectionsData) {
                    const questions = await inspectionAPI.getQuestions(section.id);
                    questionsBySection[section.id] = questions;
                }
            }

            setSectionQuestions(questionsBySection);
            setPartAQuestions(partAQuestionsBySection);
        } catch (error) {
            console.error('Error loading questions for review:', error);
        }
    };

    const handleEdit = () => {
        // Navigate back to inspection
        navigate(`/inspection/${reportId}`);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Get current location - MANDATORY
            let coordinates = null;
            try {
                console.log('Getting current location (mandatory)');
                coordinates = await getCurrentLocation();
                console.log('Location captured successfully', coordinates);
            } catch (locationError) {
                console.error('Could not get location:', locationError);
                showError(locationError.message || 'Location is required to submit inspection. Please enable location services and try again.');
                setSubmitting(false);
                return;
            }

            // Submit the inspection report with coordinates
            await inspectionAPI.submitInspectionReport(reportId, coordinates);

            showSuccess('Inspection submitted successfully! Thank you for completing the inspection.');

            // Navigate back to dashboard after successful submission
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error submitting inspection:', error);
            showError('Failed to submit inspection. Please try again.');
            setSubmitting(false);
        }
    };

    const renderSection = (section, questions, answers, isPartA = false) => {
        const sectionAnswers = questions
            .filter(question => answers[question.id])
            .map(question => ({
                question,
                answer: answers[question.id]
            }));

        return (
            <div key={`${isPartA ? 'parta-' : ''}${section.id}`} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {section.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {sectionAnswers.length} questions answered
                    </span>
                </div>

                <div className="space-y-4">
                    {sectionAnswers.map(({ question, answer }) => (
                        <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                        {question.id}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {question.text}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${answer.value === 'Yes'
                                            ? 'bg-green-100 text-green-800'
                                            : answer.value === 'No'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {answer.value}
                                        </span>
                                    </div>
                                    {answer.notes && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Notes:</span> {answer.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Inspection</h1>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Report ID:</span> {reportId}
                            </p>
                        </div>
                        <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Ready to Submit
                        </div>
                    </div>
                    <p className="text-gray-600">Please review your answers before submitting the inspection.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Show Part A sections if we're in Part B */}
                        {isPartB && partASections && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Part A - Basic Inspection</h2>
                                <div className="space-y-6">
                                    {partASections.map((section) => {
                                        const questions = partAQuestions[section.id] || [];
                                        return renderSection(section, questions, partAAnswers, true);
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Show current part sections */}
                        <div className={isPartB ? "mt-8" : ""}>
                            {isPartB && <h2 className="text-2xl font-bold text-gray-800 mb-4">Part B - Detailed Inspection</h2>}
                            <div className="space-y-6">
                                {sections.map((section) => {
                                    const questions = sectionQuestions[section.id] || [];
                                    return renderSection(section, questions, answers);
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handleEdit}
                            disabled={submitting}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
                        >
                            <span>← Back to Inspection</span>
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Submit Inspection</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewScreen;