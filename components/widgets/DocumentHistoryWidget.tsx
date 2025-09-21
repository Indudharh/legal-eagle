import React, { useState, useMemo } from 'react';
import type { StoredDocument } from '../../types';
import { RiskSeverity, DocumentStatus } from '../../types';
import { Button } from '../ui/Button';
import { SearchIcon, ChevronUpDownIcon, ArrowUpIcon, ArrowDownIcon, ScaleIcon, TrashIcon } from '../ui/icons/Icons';
import { WidgetWrapper } from './WidgetWrapper';

interface DocumentHistoryWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
    onViewDocument: (doc: StoredDocument) => void;
    onDeleteDocument: (id: string) => void;
    onCompareDocuments: (docIds: [string, string]) => void;
    onUpdateDocumentStatus: (docId: string, status: DocumentStatus) => void;
}

type SortKey = 'name' | 'date' | 'risk' | 'status';
type SortDirection = 'ascending' | 'descending';

const getOverallRiskForDocument = (doc: StoredDocument): RiskSeverity => {
    if (!doc.analysis || !doc.analysis.potentialRisks) return RiskSeverity.Low;
    const risks = doc.analysis.potentialRisks;
    if (risks.some(r => r.severity === RiskSeverity.High)) return RiskSeverity.High;
    if (risks.some(r => r.severity === RiskSeverity.Medium)) return RiskSeverity.Medium;
    return RiskSeverity.Low;
};

const RiskBadge: React.FC<{ severity: RiskSeverity }> = ({ severity }) => {
    const styles = {
        [RiskSeverity.High]: 'bg-red-900/50 text-red-300 ring-1 ring-inset ring-red-500/50',
        [RiskSeverity.Medium]: 'bg-amber-900/50 text-amber-300 ring-1 ring-inset ring-amber-500/50',
        [RiskSeverity.Low]: 'bg-green-900/50 text-green-300 ring-1 ring-inset ring-green-500/50',
    };
    return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${styles[severity]}`}>{severity}</span>;
};

// Sortable Table Header Component
const SortableHeader: React.FC<{
    sortKey: SortKey;
    title: string;
    sortConfig: { key: SortKey; direction: SortDirection } | null;
    requestSort: (key: SortKey) => void;
    className?: string;
}> = ({ sortKey, title, sortConfig, requestSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = isSorted ? (sortConfig?.direction === 'ascending' ? ArrowUpIcon : ArrowDownIcon) : ChevronUpDownIcon;
    return (
        <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="group inline-flex items-center">
                {title}
                <Icon className={`w-4 h-4 ml-1.5 flex-none rounded ${isSorted ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-300'}`} />
            </button>
        </th>
    );
};


export const DocumentHistoryWidget: React.FC<DocumentHistoryWidgetProps> = ({
    title,
    onRemove,
    documents,
    onViewDocument,
    onDeleteDocument,
    onCompareDocuments,
    onUpdateDocumentStatus,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'date', direction: 'descending' });
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [documents, searchQuery]);

    const sortedDocuments = useMemo(() => {
        let sortableItems = [...filteredDocuments];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                switch (sortConfig.key) {
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case 'date':
                        aValue = new Date(a.date).getTime();
                        bValue = new Date(b.date).getTime();
                        break;
                    case 'status':
                        aValue = a.status.toLowerCase();
                        bValue = b.status.toLowerCase();
                        break;
                    case 'risk':
                        const riskOrder = { [RiskSeverity.High]: 2, [RiskSeverity.Medium]: 1, [RiskSeverity.Low]: 0 };
                        aValue = riskOrder[getOverallRiskForDocument(a)];
                        bValue = riskOrder[getOverallRiskForDocument(b)];
                        break;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredDocuments, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectDoc = (docId: string) => {
        setSelectedDocs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(docId)) {
                newSelection.delete(docId);
            } else {
                newSelection.add(docId);
            }
            return newSelection;
        });
    };
    
    const handleCompare = () => {
        const selected = Array.from(selectedDocs);
        if (selected.length === 2) {
            onCompareDocuments([selected[0], selected[1]]);
            setSelectedDocs(new Set());
        }
    };
    
    const comparisonActionBar = selectedDocs.size > 0 && (
        <div className="bg-gray-700/50 p-3 border-b border-border-dark">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-accent">{selectedDocs.size} document{selectedDocs.size > 1 ? 's' : ''} selected</p>
                <Button onClick={handleCompare} disabled={selectedDocs.size !== 2} className="px-3 py-1.5 text-xs">
                    <ScaleIcon className="w-4 h-4 mr-2" />
                    Compare
                </Button>
            </div>
        </div>
    );

    return (
        <WidgetWrapper title={title} onRemove={onRemove} contentClassName="p-0">
            {comparisonActionBar}
             <div className="p-4 border-b border-border-dark">
                <div className="relative w-full sm:max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-border-dark bg-primary-dark py-2 pl-10 pr-3 text-sm text-gray-200 placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                        placeholder="Search documents by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search documents"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead className="bg-gray-700/30">
                        <tr>
                             <th scope="col" className="px-4 py-3">
                                {/* Intentionally blank for checkbox */}
                            </th>
                            <SortableHeader sortKey="name" title="Document Name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader sortKey="date" title="Date Analyzed" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader sortKey="risk" title="Risk Level" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader sortKey="status" title="Status" sortConfig={sortConfig} requestSort={requestSort} />
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark">
                        {sortedDocuments.length > 0 ? (
                            sortedDocuments.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                                            checked={selectedDocs.has(doc.id)}
                                            onChange={() => handleSelectDoc(doc.id)}
                                            aria-label={`Select ${doc.name}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-200 truncate" style={{maxWidth: '30ch'}}>{doc.name}</p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(doc.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <RiskBadge severity={getOverallRiskForDocument(doc)} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        <select
                                            value={doc.status}
                                            onChange={(e) => onUpdateDocumentStatus(doc.id, e.target.value as DocumentStatus)}
                                            className="block w-full rounded-md border-border-dark shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 text-sm py-1.5 bg-secondary-dark text-gray-200"
                                            aria-label={`Status for ${doc.name}`}
                                        >
                                            {Object.values(DocumentStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => onViewDocument(doc)} className="text-accent hover:text-accent-600 hover:underline">
                                                View
                                            </button>
                                            <button 
                                                onClick={() => onDeleteDocument(doc.id)} 
                                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                aria-label={`Delete ${doc.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12 px-4">
                                    <p className="text-gray-300 font-medium">No documents found</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchQuery ? "Try adjusting your search." : "Analyze a new document to get started."}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </WidgetWrapper>
    );
};