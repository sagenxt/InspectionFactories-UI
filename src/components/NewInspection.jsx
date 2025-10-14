import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import { ChevronRight, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import SubmissionModal from './SubmissionModal';

const NewInspection = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [sections, setSections] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [inspectionReportId, setInspectionReportId] = useState(null);
    const [inspectionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [isPartB, setIsPartB] = useState(false);
    const [partBSections, setPartBSections] = useState([]);
    const [partBAnswers, setPartBAnswers] = useState({});

    useEffect(() => {
        if (reportId) {
            loadExistingInspection(reportId);
        } else {
            // If no reportId in URL, redirect to dashboard
            navigate('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportId]);

    useEffect(() => {
        if (sections.length > 0) {
            loadQuestions(sections[currentSectionIndex].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sections, currentSectionIndex]);

    useEffect(() => {
        if (partBSections.length > 0 && isPartB) {
            loadQuestions(partBSections[currentSectionIndex].id);
        } else if (partBSections.length === 0 && isPartB) {
            // If Part B has no sections, show a message and don't load questions
            setQuestions([]);
            showWarning('No Part B sections available for this inspection.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partBSections, currentSectionIndex, isPartB]);


    const loadExistingInspection = async (reportId) => {
        try {
            setLoading(true);

            // Set the inspection report ID directly
            setInspectionReportId(reportId);

            // Load Part A sections
            const sectionsData = await inspectionAPI.getSections("A");
            setSections(sectionsData);

            // Load Part B sections (for reference when prepopulating answers)
            let partBSectionsData = [];
            try {
                partBSectionsData = await inspectionAPI.getSections("B");
                // Don't set as active yet, just store for reference
            } catch (error) {
                console.warn('Could not load Part B sections:', error);
            }

            // Try to load existing answers to prepopulate (for draft status)
            try {
                const existingAnswers = await inspectionAPI.getAnswers(reportId);
                console.log('Loaded existing answers:', existingAnswers);
                if (existingAnswers.length > 0) {
                    prepopulateAnswers(existingAnswers, sectionsData, partBSectionsData);
                    // showInfo(`Resuming inspection with ${existingAnswers.length} existing answers`);
                }
            } catch (answerError) {
                console.warn('Could not load existing answers:', answerError);
                // Continue without prepopulating answers
            }

            // showSuccess(`Loaded existing inspection! Report ID: ${reportId}`);
            // showInfo(`Loaded ${sectionsData.length} inspection sections`);
        } catch (error) {
            console.error('Error loading existing inspection:', error);
            showError('Failed to load existing inspection. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const prepopulateAnswers = (existingAnswers, partASections, partBSections) => {
        // Convert API response format to our internal format
        // Separate Part A and Part B answers based on section IDs
        const partAAnswers = {};
        const partBAnswers = {};

        // Create sets of section IDs for quick lookup
        const partASectionIds = new Set(partASections.map(s => s.id));
        const partBSectionIds = new Set(partBSections.map(s => s.id));

        existingAnswers.forEach(answer => {
            const answerData = {
                value: answer.value,
                notes: answer.notes || ''
            };

            // Check if the question belongs to Part A or Part B based on sectionId
            if (answer.Question && answer.Question.sectionId) {
                const sectionId = answer.Question.sectionId;

                if (partASectionIds.has(sectionId)) {
                    partAAnswers[answer.questionId] = answerData;
                } else if (partBSectionIds.has(sectionId)) {
                    partBAnswers[answer.questionId] = answerData;
                } else {
                    // If section not found in either, default to Part A
                    partAAnswers[answer.questionId] = answerData;
                }
            } else {
                // If no section info, default to Part A
                partAAnswers[answer.questionId] = answerData;
            }
        });

        setAnswers(partAAnswers);
        setPartBAnswers(partBAnswers);
        console.log('Prepopulated Part A answers:', partAAnswers);
        console.log('Prepopulated Part B answers:', partBAnswers);
    };

    const loadQuestions = async (sectionId) => {
        try {
            setLoading(true);
            const questionsData = await inspectionAPI.getQuestions(sectionId);
            setQuestions(questionsData);
        } catch (error) {
            console.error('Error loading questions:', error);
            showError('Failed to load questions for this section. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        if (isPartB) {
            setPartBAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    value,
                    notes: prev[questionId]?.notes || ''
                }
            }));
        } else {
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    value,
                    notes: prev[questionId]?.notes || ''
                }
            }));
        }
    };

    const handleNotesChange = (questionId, notes) => {
        if (isPartB) {
            setPartBAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    value: prev[questionId]?.value || '',
                    notes
                }
            }));
        } else {
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    value: prev[questionId]?.value || '',
                    notes
                }
            }));
        }
    };

    const nextSection = async () => {
        // Check if all questions are answered
        const currentAnswers = isPartB ? partBAnswers : answers;
        const unansweredQuestions = questions.filter(question => !currentAnswers[question.id]?.value);

        if (unansweredQuestions.length > 0) {
            showWarning(`Please answer all questions before proceeding. ${unansweredQuestions.length} question(s) remaining.`);
            return;
        }

        // Save current section answers before moving to next section
        setSaving(true);

        try {
            await saveCurrentSectionAnswers();
            showSuccess(`Section "${currentSection?.name}" saved successfully!`);

            if (currentSectionIndex < currentSections.length - 1) {
                setCurrentSectionIndex(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error saving section:', error);
            showError('Failed to save section. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const saveCurrentSectionAnswers = async () => {
        if (!currentSection || !inspectionReportId) return;

        const currentAnswers = isPartB ? partBAnswers : answers;

        // Get answers for current section only
        const currentSectionAnswers = Object.entries(currentAnswers)
            .filter(([questionId]) => {
                // Find the question to check if it belongs to current section
                const question = questions.find(q => q.id === parseInt(questionId));
                return question && question.sectionId === currentSection.id;
            })
            .map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                value: answer.value,
                notes: answer.notes || ''
            }));

        if (currentSectionAnswers.length > 0) {
            await inspectionAPI.submitAnswers(inspectionReportId.toString(), currentSectionAnswers);
            console.log(`Saved answers for section: ${currentSection.name}`);
        }
    };

    const prevSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
        }
    };

    const loadPartBSections = async () => {
        try {
            setLoading(true);

            const sectionsData = await inspectionAPI.getSections("B");

            if (sectionsData.length === 0) {
                showWarning('No Part B sections available for this inspection.');
                setPartBSections([]);
                setIsPartB(true);
                setCurrentSectionIndex(0);
                return;
            }

            setPartBSections(sectionsData);
            setIsPartB(true);
            setCurrentSectionIndex(0);

            showSuccess(`Loaded ${sectionsData.length} Part B sections for detailed inspection`);
        } catch (error) {
            console.error('Error loading Part B sections:', error);
            showError('Failed to load Part B sections. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteInspection = async () => {
        setShowSubmissionModal(false);
        // Navigate to review screen (sections already saved before modal was shown)
        navigate(`/inspection/${reportId}/review`);
    };

    const handleFillPartB = async () => {
        setShowSubmissionModal(false);
        await loadPartBSections();
    };

    const handleSubmitClick = async () => {
        // Check if all questions are answered
        const currentQuestions = isPartB ? questions : questions;
        const currentAnswers = isPartB ? partBAnswers : answers;
        const unansweredQuestions = currentQuestions.filter(question => !currentAnswers[question.id]?.value);

        if (unansweredQuestions.length > 0) {
            showWarning(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`);
            return;
        }

        // Save current section answers BEFORE going to review
        setSaving(true);

        try {
            await saveCurrentSectionAnswers();
            showSuccess('All sections saved successfully!');

            if (isPartB) {
                // For Part B, navigate to review screen
                navigate(`/inspection/${reportId}/review`);
            } else {
                // For Part A, show modal to ask about Part B
                setShowSubmissionModal(true);
            }
        } catch (error) {
            console.error('Error saving final section:', error);
            showError('Failed to save section. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const currentSections = isPartB ? partBSections : sections;
    const currentSection = currentSections[currentSectionIndex];
    const isLastSection = currentSectionIndex === currentSections.length - 1;

    // If Part B has no sections, show appropriate message
    if (isPartB && partBSections.length === 0) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="flex flex-col items-center justify-center h-64">
                        <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Part B Sections Available</h2>
                        <p className="text-gray-600 mb-6">There are no Part B sections available for this inspection.</p>
                        <button
                            onClick={() => {
                                setIsPartB(false);
                                setCurrentSectionIndex(0);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Return to Part A
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {reportId ? 'Continue Inspection' : 'New Inspection'}
                            </h1>
                            {inspectionData && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Factory:</span> {inspectionData.factoryName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Registration:</span> {inspectionData.factoryRegistrationNumber}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Address:</span> {inspectionData.factoryAddress}
                                    </p>
                                </div>
                            )}
                        </div>
                        {inspectionReportId && (
                            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Report ID: {inspectionReportId}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{isPartB ? 'Part B' : 'Part A'} - Section {currentSectionIndex + 1} of {currentSections.length}</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-medium">{currentSection?.name}</span>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-4 flex space-x-2">
                        {currentSections.map((section, index) => {
                            const isCompleted = index < currentSectionIndex;
                            const isCurrent = index === currentSectionIndex;
                            return (
                                <div
                                    key={section.id}
                                    className={`h-2 flex-1 rounded ${isCompleted
                                        ? 'bg-green-500'
                                        : isCurrent
                                            ? 'bg-blue-500'
                                            : 'bg-gray-200'
                                        }`}
                                    title={section.name}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        {currentSection?.name}
                    </h2>

                    <div className="space-y-6">
                        {questions.map((question) => (
                            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="flex items-start space-x-3 mb-4">
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                            {question.id}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 flex-1">
                                        {question.text}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex space-x-6">
                                        {['Yes', 'No', 'N/A'].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    checked={(isPartB ? partBAnswers[question.id]?.value : answers[question.id]?.value) === option}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">
                                                    {option}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {((isPartB ? partBAnswers[question.id]?.value : answers[question.id]?.value) === 'Yes' || (isPartB ? partBAnswers[question.id]?.value : answers[question.id]?.value) === 'No') && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notes
                                            </label>
                                            <textarea
                                                value={(isPartB ? partBAnswers[question.id]?.notes : answers[question.id]?.notes) || ''}
                                                onChange={(e) => handleNotesChange(question.id, e.target.value)}
                                                placeholder="Enter your notes here..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={prevSection}
                        disabled={currentSectionIndex === 0}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex space-x-4">
                        {!isLastSection ? (
                            <button
                                onClick={nextSection}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Next Section
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitClick}
                                disabled={saving}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Continue to Review
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Submission Modal */}
            <SubmissionModal
                isOpen={showSubmissionModal}
                onClose={() => setShowSubmissionModal(false)}
                onCompleteInspection={handleCompleteInspection}
                onFillPartB={handleFillPartB}
            />
        </div>
    );
};

export default NewInspection;
