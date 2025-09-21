import React from 'react';
import type { StoredDocument, ManualDeadline, DocumentStatus, ActivityEvent } from '../types';
import { Button } from './ui/Button';
import { AddWidgetPanel } from './AddWidgetPanel';
import { RiskOverviewWidget } from './widgets/RiskOverviewWidget';
import { DocumentHistoryWidget } from './widgets/DocumentHistoryWidget';
import { UpcomingDeadlinesWidget } from './widgets/UpcomingDeadlinesWidget';
import { ClauseFrequencyWidget } from './widgets/ClauseFrequencyWidget';
import { DocumentStatusWidget } from './widgets/DocumentStatusWidget';
import { CounterpartyOverviewWidget } from './widgets/CounterpartyOverviewWidget';
import { TeamActivityFeedWidget } from './widgets/TeamActivityFeedWidget';

interface DashboardProps {
    documents: StoredDocument[];
    manualDeadlines: ManualDeadline[];
    activityFeed: ActivityEvent[];
    onAnalyzeNew: () => void;
    onViewDocument: (doc: StoredDocument) => void;
    onDeleteDocument: (id: string) => void;
    onCompareDocuments: (docIds: [string, string]) => void;
    onUpdateDocumentStatus: (docId: string, status: DocumentStatus) => void;
    widgets: string[];
    onAddWidget: (widgetId: string) => void;
    onRemoveWidget: (widgetId: string) => void;
    onAddManualDeadline: (deadline: Omit<ManualDeadline, 'id'>) => void;
    onUpdateManualDeadline: (deadline: ManualDeadline) => void;
    onDeleteManualDeadline: (id: string) => void;
}

// Map widget IDs to their components and default layout properties
const WIDGET_MAP: { [key: string]: { name: string; component: React.FC<any>; gridSpan: string } } = {
  'risk-overview': { name: 'Risk Overview', component: RiskOverviewWidget, gridSpan: 'md:col-span-2' },
  'doc-status': { name: 'Document Status', component: DocumentStatusWidget, gridSpan: 'md:col-span-2' },
  'upcoming-deadlines': { name: 'Upcoming Deadlines', component: UpcomingDeadlinesWidget, gridSpan: 'md:col-span-4' },
  'counterparty-overview': { name: 'Counterparty Overview', component: CounterpartyOverviewWidget, gridSpan: 'md:col-span-2' },
  'team-activity-feed': { name: 'Team Activity Feed', component: TeamActivityFeedWidget, gridSpan: 'md:col-span-2' },
  'clause-frequency': { name: 'Clause Frequency', component: ClauseFrequencyWidget, gridSpan: 'md:col-span-2' },
  'doc-history': { name: 'Document History', component: DocumentHistoryWidget, gridSpan: 'md:col-span-4' },
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
    const { 
        documents, 
        onAnalyzeNew, 
        widgets,
        onAddWidget,
        onRemoveWidget 
    } = props;
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100">Welcome back, indudhar.</h2>
                    <p className="text-gray-400 mt-1">Here's your overview of contracts and legal documents.</p>
                </div>
                <Button onClick={onAnalyzeNew}>+ Analyze Document</Button>
            </div>
            
            <AddWidgetPanel 
                availableWidgets={WIDGET_MAP}
                activeWidgets={widgets}
                onAddWidget={onAddWidget}
            />

            {widgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {widgets.map(widgetId => {
                        const widgetConfig = WIDGET_MAP[widgetId];
                        if (!widgetConfig) return null;
                        
                        const WidgetComponent = widgetConfig.component;

                        return (
                            <div key={widgetId} className={widgetConfig.gridSpan}>
                                <WidgetComponent
                                    title={widgetConfig.name}
                                    onRemove={() => onRemoveWidget(widgetId)}
                                    {...props}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-secondary-dark rounded-xl border border-border-dark">
                    <h3 className="text-lg font-medium text-gray-300">Your dashboard is empty</h3>
                    <p className="text-gray-500 mt-2 text-sm">Use the "Add Widget" button above to get started.</p>
                </div>
            )}
        </div>
    );
};