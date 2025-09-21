import React, { useMemo } from 'react';
import type { StoredDocument } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { InfoIcon } from '../ui/icons/Icons';

interface ClauseFrequencyWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
}

export const ClauseFrequencyWidget: React.FC<ClauseFrequencyWidgetProps> = ({ title, onRemove, documents }) => {
    const clauseFrequencies = useMemo(() => {
        const counts: { [key: string]: number } = {};
        documents.forEach(doc => {
            doc.analysis.keyClauses?.forEach(clause => {
                const title = clause.clauseTitle.trim();
                counts[title] = (counts[title] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7);
    }, [documents]);

    const maxCount = clauseFrequencies[0]?.[1] || 0;

    return (
        <WidgetWrapper title={title} onRemove={onRemove}>
             <div className="h-full">
                {clauseFrequencies.length > 0 ? (
                    <div className="space-y-3 pt-2">
                        {clauseFrequencies.map(([clause, count]) => (
                            <div key={clause} className="flex items-center gap-4">
                                <div className="w-1/3 text-sm text-gray-400 truncate text-right">{clause}</div>
                                <div className="w-2/3">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-700 rounded-full h-5">
                                            <div 
                                                className="bg-accent h-5 rounded-full flex items-center justify-end pr-2" 
                                                style={{ width: `${Math.max((count / maxCount) * 100, 10)}%` }}
                                            >
                                                 <span className="text-xs font-bold text-gray-900">{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <InfoIcon className="w-10 h-10 text-gray-600 mb-3" />
                        <h4 className="font-semibold text-gray-300">No Clause Data</h4>
                        <p className="text-sm text-gray-500 mt-1">Analyze documents to see which clauses appear most often.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};