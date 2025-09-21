import React, { useState, useEffect } from 'react';
import type { StoredDocument, ComparisonResult } from '../types';
import { compareLegalDocuments } from '../services/geminiService';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loader } from './ui/Loader';
import { ScaleIcon, CheckIcon, WarningIcon } from './ui/icons/Icons';

interface ComparisonPageProps {
    doc1: StoredDocument;
    doc2: StoredDocument;
    onBack: () => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ doc1, doc2, onBack }) => {
    const [comparison, setComparison] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getComparison = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await compareLegalDocuments(doc1.originalText, doc2.originalText);
                setComparison(result);
            } catch (err) {
                console.error(err);
                setError('An error occurred while comparing the documents. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        getComparison();
    }, [doc1, doc2]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="mt-8 flex flex-col items-center justify-center gap-4 p-8 bg-secondary-dark rounded-xl">
                    <Loader />
                    <p className="text-gray-300 font-medium">AI is comparing your documents...</p>
                    <p className="text-sm text-gray-400 text-center">This might take a moment. Please wait.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="mt-6 bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            );
        }
        
        if (!comparison) {
            return <p>No comparison data available.</p>;
        }

        return (
            <div className="space-y-8">
                <Card>
                    <Card.Header>
                        <CheckIcon className="w-7 h-7 text-green-400 mr-3" />
                        <Card.Title>Overall Summary of Differences</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <p className="text-gray-300 leading-relaxed">{comparison.overallSummary}</p>
                    </Card.Content>
                </Card>

                {comparison.clauseComparisons && comparison.clauseComparisons.length > 0 && (
                    <Card>
                        <Card.Header>
                           <ScaleIcon className="w-7 h-7 text-accent mr-3" />
                           <Card.Title>Clause-by-Clause Comparison</Card.Title>
                        </Card.Header>
                        <Card.Content>
                             <div className="space-y-6">
                                {comparison.clauseComparisons.map((item, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-gray-700/50 border border-border-dark">
                                        <h4 className="font-semibold text-gray-100 mb-1">{item.clauseTitle}</h4>
                                        <p className="text-sm text-gray-400 italic mb-4">{item.summaryOfDifference}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="border-l-4 border-gray-500 pl-3">
                                                <p className="font-semibold text-gray-200 mb-1">{doc1.name}</p>
                                                <p className="text-gray-400">{item.detailsDoc1}</p>
                                            </div>
                                            <div className="border-l-4 border-accent pl-3">
                                                 <p className="font-semibold text-gray-200 mb-1">{doc2.name}</p>
                                                <p className="text-gray-400">{item.detailsDoc2}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Content>
                    </Card>
                )}

                {comparison.riskProfileDifferences && comparison.riskProfileDifferences.length > 0 && (
                     <Card>
                        <Card.Header>
                            <WarningIcon className="w-7 h-7 text-red-400 mr-3" />
                           <Card.Title>Risk Profile Differences</Card.Title>
                        </Card.Header>
                         <Card.Content>
                            <div className="space-y-4">
                                {comparison.riskProfileDifferences.map((item, index) => (
                                    <div key={index} className="p-4 rounded-lg border-l-4 border-amber-500/70 bg-amber-900/20">
                                        <h4 className="font-semibold text-gray-100">{item.riskTitle}</h4>
                                        <p className="text-sm text-gray-300 mb-3">{item.summaryOfDifference}</p>
                                        <div className="flex gap-4 text-sm font-medium">
                                            <p className="text-gray-200"><span className="font-bold">{doc1.name}:</span> {item.riskInDoc1}</p>
                                            <p className="text-gray-200"><span className="font-bold">{doc2.name}:</span> {item.riskInDoc2}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Content>
                    </Card>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Button onClick={onBack} variant="secondary" className="mb-6">
                &larr; Back to Dashboard
            </Button>

            <div className="bg-secondary-dark p-6 rounded-xl border border-border-dark mb-8">
                <h2 className="text-2xl font-bold text-gray-100">Document Comparison</h2>
                <div className="mt-2 text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <p><span className="font-semibold">Document 1:</span> {doc1.name}</p>
                    <p><span className="font-semibold">Document 2:</span> {doc2.name}</p>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};