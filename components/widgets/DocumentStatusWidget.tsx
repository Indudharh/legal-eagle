import React, { useMemo } from 'react';
import type { StoredDocument } from '../../types';
import { DocumentStatus } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { InfoIcon } from '../ui/icons/Icons';

interface DocumentStatusWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
}

const getStatusCounts = (documents: StoredDocument[]) => {
    const counts: { [key in DocumentStatus]: number } = {
        [DocumentStatus.Draft]: 0,
        [DocumentStatus.InReview]: 0,
        [DocumentStatus.AwaitingSignature]: 0,
        [DocumentStatus.Active]: 0,
        [DocumentStatus.Expired]: 0,
    };

    documents.forEach(doc => {
        if (doc.status in counts) {
            counts[doc.status]++;
        }
    });
    return counts;
};

const STATUS_COLORS: { [key in DocumentStatus]: string } = {
    [DocumentStatus.Draft]: 'bg-gray-500',
    [DocumentStatus.InReview]: 'bg-yellow-500',
    [DocumentStatus.AwaitingSignature]: 'bg-blue-500',
    [DocumentStatus.Active]: 'bg-green-500',
    [DocumentStatus.Expired]: 'bg-red-500',
};


export const DocumentStatusWidget: React.FC<DocumentStatusWidgetProps> = ({ title, onRemove, documents }) => {
    const statusCounts = useMemo(() => getStatusCounts(documents), [documents]);
    const total = documents.length;

    return (
        <WidgetWrapper title={title} onRemove={onRemove}>
            <div className="h-full">
                {total > 0 ? (
                    <div className="space-y-4">
                        <div className="w-full flex rounded-full h-3 overflow-hidden bg-gray-700">
                            {Object.entries(statusCounts).map(([status, count]) => {
                                if (count === 0) return null;
                                return (
                                    <div 
                                        key={status} 
                                        className={`${STATUS_COLORS[status as DocumentStatus]}`} 
                                        style={{ width: `${(count / total) * 100}%` }}
                                        title={`${status}: ${count}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                             {Object.entries(statusCounts).map(([status, count]) => (
                                 <div key={status} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status as DocumentStatus]}`}></span>
                                        <span className="text-gray-400">{status}</span>
                                    </div>
                                    <span className="font-semibold text-gray-200">{count}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <InfoIcon className="w-10 h-10 text-gray-600 mb-3" />
                        <h4 className="font-semibold text-gray-300">No Documents</h4>
                        <p className="text-sm text-gray-500 mt-1">Document statuses will appear here once you analyze a document.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};