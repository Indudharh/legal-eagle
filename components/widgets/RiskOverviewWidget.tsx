import React, { useMemo } from 'react';
import type { StoredDocument } from '../../types';
import { RiskSeverity } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';

interface RiskOverviewWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
}

const getRiskCounts = (documents: StoredDocument[]) => {
    const counts = { [RiskSeverity.High]: 0, [RiskSeverity.Medium]: 0, [RiskSeverity.Low]: 0, total: 0 };
    documents.forEach(doc => {
        counts.total++;
        if (!doc.analysis || !doc.analysis.potentialRisks) return;
        const hasHigh = doc.analysis.potentialRisks.some(risk => risk.severity === RiskSeverity.High);
        const hasMedium = doc.analysis.potentialRisks.some(risk => risk.severity === RiskSeverity.Medium);
        
        if (hasHigh) {
            counts[RiskSeverity.High]++;
        } else if (hasMedium) {
            counts[RiskSeverity.Medium]++;
        } else {
            counts[RiskSeverity.Low]++;
        }
    });
    return counts;
};

export const RiskOverviewWidget: React.FC<RiskOverviewWidgetProps> = ({ title, onRemove, documents }) => {
    const riskCounts = useMemo(() => getRiskCounts(documents), [documents]);

    const riskData = [
        { label: 'High', count: riskCounts[RiskSeverity.High], color: 'text-red-300', bgColor: 'bg-red-900/40' },
        { label: 'Medium', count: riskCounts[RiskSeverity.Medium], color: 'text-amber-300', bgColor: 'bg-amber-900/40' },
        { label: 'Low', count: riskCounts[RiskSeverity.Low], color: 'text-green-300', bgColor: 'bg-green-900/40' },
    ];

    return (
        <WidgetWrapper title={title} onRemove={onRemove}>
             <div className="space-y-4">
                 <div className="p-4 bg-primary-dark rounded-lg text-center border border-border-dark">
                    <p className="text-4xl font-bold text-gray-100">{riskCounts.total}</p>
                    <p className="text-sm font-medium text-gray-400">Total Documents</p>
                </div>
                {riskCounts.total > 0 && (
                    <div className="space-y-3">
                        {riskData.map(risk => (
                            <div key={risk.label} className={`p-4 rounded-lg ${risk.bgColor}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${risk.color}`}>{risk.label} Risk</span>
                                    <span className={`text-sm font-semibold ${risk.color}`}>{risk.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};