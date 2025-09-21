import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AnalysisDisplay } from './AnalysisDisplay';
import { analyzeLegalDocument, suggestDocumentTitle } from '../services/geminiService';
import type { AnalysisResult, StoredDocument, ManualDeadline } from '../types';
import { sampleData } from '../constants';
import { Button } from './ui/Button';
import { Loader } from './ui/Loader';
import { SparklesIcon, UploadIcon, FileTextIcon, BotIcon } from './ui/icons/Icons';

interface AnalysisPageProps {
    document: StoredDocument | null;
    onSave: (originalText: string, analysis: AnalysisResult, name: string) => void;
    onCancel: () => void;
    manualDeadlines: ManualDeadline[];
    onAddManualDeadline: (deadline: Omit<ManualDeadline, 'id'>) => void;
}

const LOADING_STEPS = [
    "Parsing document...",
    "Identifying key clauses...",
    "Assessing potential risks...",
    "Extracting important dates...",
    "Finalizing summary...",
];

type AnalysisDepth = 'quick' | 'deep';

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ document, onSave, onCancel, manualDeadlines, onAddManualDeadline }) => {
    const [documentText, setDocumentText] = useState<string>(document?.originalText || '');
    const [documentName, setDocumentName] = useState<string>(document?.name || '');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(document?.analysis || null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuggestingTitle, setIsSuggestingTitle] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>('quick');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isExistingDoc = !!document;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading && !analysis) {
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading, analysis]);

    const handleAnalyze = useCallback(async () => {
        if (!documentText.trim()) {
            setError('Please enter some legal text to analyze.');
            return;
        }
        if (!documentName.trim()) {
            setError('Please provide a name for the document.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setLoadingStep(0);

        try {
            const result = await analyzeLegalDocument(documentText);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setError('An error occurred while analyzing the document. The AI may be experiencing high demand. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [documentText, documentName]);

    const handleSuggestTitle = useCallback(async () => {
        if (!documentText.trim()) return;
        setIsSuggestingTitle(true);
        try {
            const suggested = await suggestDocumentTitle(documentText);
            setDocumentName(suggested);
        } catch (err) {
            console.error("Failed to suggest title", err);
        } finally {
            setIsSuggestingTitle(false);
        }
    }, [documentText]);

    const handleUseSample = useCallback(() => {
        setDocumentText(sampleData);
        setDocumentName("Sample Lease Agreement");
        setAnalysis(null);
        setError(null);
    }, []);

    const handleSave = () => {
        if (analysis && documentName && documentText) {
            onSave(documentText, analysis, documentName);
        } else {
            setError("Cannot save. Analysis is not complete or name/text is missing.");
        }
    };
    
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setDocumentText(text);
                if (!documentName.trim()) {
                    setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
                }
            };
            reader.readAsText(file);
        }
    }, [documentName]);

    const renderRightPanel = () => {
        if (isLoading || analysis) {
            return (
                <div className="bg-secondary-dark rounded-xl border border-border-dark p-4 md:p-8 sticky top-28">
                    <AnalysisDisplay
                        analysis={analysis}
                        isLoading={isLoading && !analysis}
                        documentId={document?.id}
                        manualDeadlines={manualDeadlines}
                        onAddManualDeadline={onAddManualDeadline}
                    />
                    {!isExistingDoc && analysis && (
                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleSave}>Save to Dashboard</Button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="bg-secondary-dark rounded-xl border-2 border-dashed border-border-dark p-8 text-center flex flex-col items-center justify-center sticky top-28 h-full">
                <BotIcon className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-200">Your AI Legal Assistant</h3>
                <p className="text-gray-400 mt-2 max-w-sm">
                    Enter your document's text on the left. The AI will provide a plain-English summary, identify risks, and explain key clauses right here.
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                 <Button onClick={onCancel} variant="secondary">
                    &larr; Back to Dashboard
                </Button>
            </div>

            {isExistingDoc && (
                 <div className="bg-secondary-dark p-6 rounded-xl border border-border-dark mb-8">
                    <p className="text-sm text-gray-400 mt-1">Analyzed on: {new Date(document.date).toLocaleDateString()}</p>
                 </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Panel */}
                <div className="space-y-6">
                    {!isExistingDoc ? (
                         <div className="bg-secondary-dark p-6 rounded-xl border border-border-dark space-y-6">
                            {/* Document Name */}
                            <div>
                                <label htmlFor="documentName" className="block text-sm font-medium text-gray-300 mb-1">
                                    Document Name
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="documentName"
                                        className="w-full p-3 bg-primary-dark border border-border-dark rounded-lg text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent transition-shadow duration-200"
                                        placeholder="e.g., 'Apartment Lease Agreement'"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Button 
                                        onClick={handleSuggestTitle} 
                                        variant="secondary" 
                                        className="px-3"
                                        disabled={isSuggestingTitle || !documentText.trim()}
                                        aria-label="Suggest Title with AI"
                                    >
                                        {isSuggestingTitle ? <Loader /> : <SparklesIcon className="w-5 h-5 text-accent" />}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Document Content */}
                            <div>
                                <label htmlFor="documentText" className="block text-sm font-medium text-gray-300 mb-1">
                                    Document Content
                                </label>
                                <div className="relative">
                                    <textarea
                                      id="documentText"
                                      className="w-full h-72 p-3 bg-primary-dark border border-border-dark rounded-lg text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent transition-shadow duration-200 resize-y"
                                      placeholder="Paste your legal agreement, terms of service, or contract here..."
                                      value={documentText}
                                      onChange={(e) => setDocumentText(e.target.value)}
                                      disabled={isLoading}
                                    />
                                     <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-primary-dark/50 backdrop-blur-sm px-2 py-1 rounded-md">
                                        {documentText.trim().split(/\s+/).filter(Boolean).length} words
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" disabled={isLoading} className="w-full">
                                    <UploadIcon className="w-5 h-5 mr-2" /> Upload File
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.rtf" />
                                
                                <Button onClick={handleUseSample} variant="secondary" disabled={isLoading} className="w-full">
                                    <FileTextIcon className="w-5 h-5 mr-2" /> Use Sample
                                </Button>
                            </div>

                            {/* Analysis Config */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Configuration</h4>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-primary-dark rounded-lg border border-border-dark">
                                    <button onClick={() => setAnalysisDepth('quick')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${analysisDepth === 'quick' ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:bg-gray-700/50'}`}>Quick Scan</button>
                                    <button onClick={() => setAnalysisDepth('deep')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${analysisDepth === 'deep' ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:bg-gray-700/50'}`}>Deep Dive</button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button onClick={handleAnalyze} isLoading={isLoading} className="w-full py-3 text-base">
                                    Analyze Document
                                </Button>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-secondary-dark p-6 rounded-xl border border-border-dark space-y-4">
                            <h3 className="text-xl font-semibold text-gray-100">Original Document Text</h3>
                            <div className="max-h-96 overflow-y-auto p-4 bg-primary-dark rounded-lg border border-border-dark">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{documentText}</pre>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-r-lg" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="w-full">
                    { isExistingDoc ? 
                        (
                             <div className="bg-secondary-dark rounded-xl border border-border-dark p-4 md:p-8">
                                <AnalysisDisplay
                                    analysis={analysis}
                                    isLoading={false}
                                    documentId={document?.id}
                                    manualDeadlines={manualDeadlines}
                                    onAddManualDeadline={onAddManualDeadline}
                                />
                            </div>
                        ) : renderRightPanel() 
                    }
                </div>
            </div>
        </div>
    );
};