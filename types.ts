export enum RiskSeverity {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum DocumentStatus {
    Draft = 'Draft',
    InReview = 'In Review',
    AwaitingSignature = 'Awaiting Signature',
    Active = 'Active',
    Expired = 'Expired',
}

export interface KeyClause {
  clauseTitle: string;
  explanation: string;
  originalTextSnippet: string;
}

export interface PotentialRisk {
  riskTitle: string;
  riskDescription: string;
  severity: RiskSeverity;
}

export interface KeyDate {
    eventName: string;
    date: string; // ISO 8601 format: "YYYY-MM-DD"
    originalTextSnippet: string;
}

export interface AnalysisResult {
  summary: string;
  keyClauses: KeyClause[];
  potentialRisks: PotentialRisk[];
  keyDates: KeyDate[];
  counterparties: string[];
}

export interface StoredDocument {
    id: string;
    name: string;
    date: string;
    originalText: string;
    analysis: AnalysisResult;
    status: DocumentStatus;
    modifiedBy?: string;
}

export interface ManualDeadline {
    id: string;
    eventName: string;
    date: string; // "YYYY-MM-DD"
    docId?: string; // Optional: link to an existing document
}

// Types for Activity Feed
export type ActivityEventType = 'DOCUMENT_CREATED' | 'STATUS_UPDATED' | 'DOCUMENT_DELETED';

export interface ActivityEvent {
    id: string;
    type: ActivityEventType;
    timestamp: string; // ISO 8601
    user: string; // Simulated user name
    details: {
        documentName: string;
        docId?: string;
        oldStatus?: DocumentStatus;
        newStatus?: DocumentStatus;
    };
}

// Types for Document Comparison Feature
export interface ClauseComparison {
    clauseTitle: string;
    summaryOfDifference: string;
    detailsDoc1: string;
    detailsDoc2: string;
}

export interface RiskComparison {
    riskTitle: string;
    summaryOfDifference: string;
    riskInDoc1: string; // e.g., "Low" or "Not Present"
    riskInDoc2: string; // e.g., "High" or "Present"
}

export interface ComparisonResult {
    overallSummary: string;
    clauseComparisons: ClauseComparison[];
    riskProfileDifferences: RiskComparison[];
}