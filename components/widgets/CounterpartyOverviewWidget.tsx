import React, { useMemo } from 'react';
import type { StoredDocument } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { InfoIcon, UserIcon } from '../ui/icons/Icons';

interface CounterpartyOverviewWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
}

export const CounterpartyOverviewWidget: React.FC<CounterpartyOverviewWidgetProps> = ({ title, onRemove, documents }) => {
    const counterpartyFrequencies = useMemo(() => {
        const counts: { [key: string]: number } = {};
        documents.forEach(doc => {
            doc.analysis.counterparties?.forEach(party => {
                const name = party.trim();
                if(name) {
                    counts[name] = (counts[name] || 0) + 1;
                }
            });
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Show top 5
    }, [documents]);


    return (
        <WidgetWrapper title={title} onRemove={onRemove}>
             <div className="h-full">
                {counterpartyFrequencies.length > 0 ? (
                    <ul className="space-y-3">
                        {counterpartyFrequencies.map(([name, count]) => (
                            <li key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-700 p-2 rounded-full">
                                        <UserIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-200 text-sm">{name}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-300 bg-gray-700 px-2 py-0.5 rounded-full">{count}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <InfoIcon className="w-10 h-10 text-gray-600 mb-3" />
                        <h4 className="font-semibold text-gray-300">No Counterparty Data</h4>
                        <p className="text-sm text-gray-500 mt-1">Analyze documents to see who you're working with most often.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};