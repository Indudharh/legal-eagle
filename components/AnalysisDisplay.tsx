import React from 'react';
import type { AnalysisResult, KeyClause, PotentialRisk, KeyDate, ManualDeadline } from '../types';
import { RiskSeverity } from '../types';
import { Card } from './ui/Card';
import { Loader } from './ui/Loader';
import { WarningIcon, InfoIcon, CheckIcon, CalendarIcon } from './ui/icons/Icons';
import { Button } from './ui/Button';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  documentId?: string;
  manualDeadlines?: ManualDeadline[];
  onAddManualDeadline?: (deadline: Omit<ManualDeadline, 'id'>) => void;
}

const getRiskStyles = (severity: RiskSeverity): { icon: JSX.Element, color: string } => {
  switch (severity) {
    case RiskSeverity.High:
      return { icon: <WarningIcon className="w-6 h-6 text-red-400" />, color: "border-red-500/50 bg-red-900/20" };
    case RiskSeverity.Medium:
      return { icon: <WarningIcon className="w-6 h-6 text-amber-400" />, color: "border-amber-500/50 bg-amber-900/20" };
    case RiskSeverity.Low:
      return { icon: <InfoIcon className="w-6 h-6 text-green-400" />, color: "border-green-500/50 bg-green-900/20" };
    default:
      return { icon: <InfoIcon className="w-6 h-6 text-gray-400" />, color: "border-gray-600 bg-gray-700/30" };
  }
};

const RiskCard: React.FC<{ risk: PotentialRisk }> = ({ risk }) => {
  const { icon, color } = getRiskStyles(risk.severity);
  return (
    <div className={`p-4 rounded-lg border-l-4 ${color} flex items-start gap-4`}>
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-100">{risk.riskTitle}</h4>
        <p className="text-gray-300">{risk.riskDescription}</p>
      </div>
    </div>
  );
};

const ClauseCard: React.FC<{ clause: KeyClause }> = ({ clause }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-700/50 border border-border-dark">
      <h4 className="font-semibold text-gray-100 mb-2">{clause.clauseTitle}</h4>
      <p className="text-gray-300 mb-3">{clause.explanation}</p>
      <blockquote className="border-l-4 border-accent/50 pl-4 text-sm text-gray-400 italic">
        "{clause.originalTextSnippet}"
      </blockquote>
    </div>
  );
};

const KeyDateItem: React.FC<{ 
    keyDate: KeyDate; 
    documentId?: string;
    manualDeadlines?: ManualDeadline[];
    onAddManualDeadline?: (deadline: Omit<ManualDeadline, 'id'>) => void;
}> = ({ keyDate, documentId, manualDeadlines, onAddManualDeadline }) => {
    
    const isTracked = documentId 
        ? manualDeadlines?.some(d => d.docId === documentId && d.date === keyDate.date && d.eventName === keyDate.eventName) 
        : false;

    const handleAdd = () => {
        if (onAddManualDeadline && documentId) {
            onAddManualDeadline({
                eventName: keyDate.eventName,
                date: keyDate.date,
                docId: documentId,
            });
        }
    };
    
    return (
        <div className="p-4 rounded-lg bg-gray-700/50 border border-border-dark flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                 <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-gray-100">{keyDate.eventName}</h4>
                    <p className="font-mono text-sm bg-gray-700 text-accent px-2 py-0.5 rounded">{new Date(keyDate.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
                <blockquote className="mt-2 border-l-4 border-accent/50 pl-4 text-sm text-gray-400 italic">
                    "{keyDate.originalTextSnippet}"
                </blockquote>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
                {documentId && onAddManualDeadline ? (
                    isTracked ? (
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-green-300 bg-green-900/50 px-3 py-1.5 rounded-full">
                            <CheckIcon className="w-5 h-5" />
                            Tracked
                        </div>
                    ) : (
                        <Button onClick={handleAdd} variant="secondary" className="py-1.5 px-3 text-sm">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Add to Deadlines
                        </Button>
                    )
                ) : null}
            </div>
        </div>
    );
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, documentId, manualDeadlines, onAddManualDeadline }) => {
  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-4 p-8 bg-secondary-dark rounded-xl border border-border-dark">
        <Loader />
        <p className="text-gray-300 font-medium">AI is analyzing your document...</p>
        <p className="text-sm text-gray-400 text-center">This might take a moment. Please wait.</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Summary */}
      <Card>
        <Card.Header>
          <CheckIcon className="w-7 h-7 text-green-400 mr-3" />
          <Card.Title>Plain English Summary</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
        </Card.Content>
      </Card>

      {/* Potential Risks */}
      {analysis.potentialRisks && analysis.potentialRisks.length > 0 && (
        <Card>
          <Card.Header>
            <WarningIcon className="w-7 h-7 text-red-400 mr-3" />
            <Card.Title>Potential Risks & Red Flags</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {analysis.potentialRisks.map((risk, index) => (
                <RiskCard key={index} risk={risk} />
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Key Clauses */}
       {analysis.keyClauses && analysis.keyClauses.length > 0 && (
        <Card>
          <Card.Header>
            <InfoIcon className="w-7 h-7 text-accent mr-3" />
            <Card.Title>Key Clauses Explained</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {analysis.keyClauses.map((clause, index) => (
                <ClauseCard key={index} clause={clause} />
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Key Dates */}
      {analysis.keyDates && analysis.keyDates.length > 0 && (
        <Card>
            <Card.Header>
                <CalendarIcon className="w-7 h-7 text-accent mr-3" />
                <Card.Title>Key Dates & Deadlines</Card.Title>
            </Card.Header>
            <Card.Content>
                <div className="space-y-4">
                    {analysis.keyDates.map((keyDate, index) => (
                       <KeyDateItem 
                            key={index} 
                            keyDate={keyDate} 
                            documentId={documentId}
                            manualDeadlines={manualDeadlines}
                            onAddManualDeadline={onAddManualDeadline}
                       />
                    ))}
                </div>
            </Card.Content>
        </Card>
      )}
    </div>
  );
};