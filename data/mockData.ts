import { type StoredDocument, type ManualDeadline, type ActivityEvent, RiskSeverity, DocumentStatus } from '../types';

// Utility to create dates relative to today for deadlines
const getFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getPastDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

export const mockDocuments: StoredDocument[] = [
  {
    id: 'doc-1',
    name: 'Innovate Corp Services Agreement',
    date: getPastDate(5),
    originalText: 'Services agreement...',
    status: DocumentStatus.Active,
    modifiedBy: 'Alex Johnson',
    analysis: {
      summary: 'This is a standard services agreement where your company provides marketing services to Innovate Corp. Key terms include a 12-month duration, net-30 payment, and a strict confidentiality clause.',
      keyClauses: [
        { clauseTitle: 'Term of Agreement', explanation: 'The agreement is valid for one year and renews automatically unless a 60-day notice is given.', originalTextSnippet: '...shall continue for a period of twelve (12) months...' },
        { clauseTitle: 'Payment Terms', explanation: 'Invoices are due within 30 days of receipt. Late payments incur a 5% penalty.', originalTextSnippet: '...payment due within thirty (30) days of the invoice date...' },
      ],
      potentialRisks: [
        { riskTitle: 'Automatic Renewal', riskDescription: 'The contract renews automatically, which could lock you into another year if termination notice is missed.', severity: RiskSeverity.High },
        { riskTitle: 'Unlimited Liability', riskDescription: 'The agreement does not cap liability, exposing your company to potentially high financial risk.', severity: RiskSeverity.High },
      ],
      keyDates: [
        { eventName: 'Contract End Date', date: getFutureDate(360), originalTextSnippet: '...ending on the one-year anniversary of the Effective Date.' },
        { eventName: 'Renewal Notice Deadline', date: getFutureDate(300), originalTextSnippet: '...notice of termination no less than sixty (60) days prior...' },
      ],
      counterparties: ['Innovate Corp.', 'Your Company Inc.'],
    },
  },
  {
    id: 'doc-2',
    name: 'Project Phoenix NDA',
    date: getPastDate(12),
    originalText: 'Non-Disclosure Agreement...',
    status: DocumentStatus.AwaitingSignature,
    modifiedBy: 'Maria Garcia',
    analysis: {
      summary: 'A mutual non-disclosure agreement for discussions about "Project Phoenix". It covers confidential information shared between both parties for a period of 3 years.',
      keyClauses: [
        { clauseTitle: 'Definition of Confidential Information', explanation: 'Defines what is considered confidential, including technical and business information.', originalTextSnippet: '..."Confidential Information" shall include all data, materials...' },
      ],
      potentialRisks: [
        { riskTitle: 'Vague Definition', riskDescription: 'The definition of confidential information is broad, which could lead to disputes over what is covered.', severity: RiskSeverity.Medium },
      ],
      keyDates: [
        { eventName: 'NDA Expiration', date: getFutureDate(1083), originalTextSnippet: '...obligations of confidentiality shall expire three (3) years from the Effective Date...' },
      ],
      counterparties: ['Phoenix Systems', 'Your Company Inc.'],
    },
  },
   {
    id: 'doc-3',
    name: 'Downtown Office Lease',
    date: getPastDate(25),
    originalText: 'Commercial Lease Agreement...',
    status: DocumentStatus.InReview,
    modifiedBy: 'Chen Wei',
    analysis: {
      summary: 'A 5-year commercial lease for an office space at 123 Business Rd. Includes terms on rent, security deposit, and maintenance responsibilities.',
      keyClauses: [
        { clauseTitle: 'Lease Term', explanation: 'The lease is for a fixed 5-year period.', originalTextSnippet: '...a term of five (5) years, commencing on...' },
        { clauseTitle: 'Security Deposit', explanation: 'A security deposit equal to two months\' rent is required.', originalTextSnippet: '...security deposit in the amount of two (2) months\' rent...' },
      ],
      potentialRisks: [
        { riskTitle: 'Rent Escalation Clause', riskDescription: 'Rent increases by 4% annually, which is higher than the market average.', severity: RiskSeverity.Medium },
      ],
      keyDates: [
         { eventName: 'Lease Start Date', date: getFutureDate(5), originalTextSnippet: '...commencing on the first day of next month...' },
      ],
      counterparties: ['Metropolis Properties LLC', 'Your Company Inc.'],
    },
  },
  {
    id: 'doc-4',
    name: 'Freelance Designer Contract',
    date: getPastDate(2),
    originalText: 'Independent Contractor Agreement...',
    status: DocumentStatus.Draft,
    modifiedBy: 'David Smith',
    analysis: {
      summary: 'A straightforward contract for hiring a freelance designer for a website redesign project. Payment is structured in two milestones.',
      keyClauses: [
        { clauseTitle: 'Intellectual Property', explanation: 'Upon final payment, all IP for the created work transfers to your company.', originalTextSnippet: '...all rights, title, and interest in the Work Product shall be assigned to the Client...' },
      ],
      potentialRisks: [
         { riskTitle: 'No Rush Fee Clause', riskDescription: 'The contract does not specify fees for expedited work, which could lead to scope creep.', severity: RiskSeverity.Low },
      ],
      keyDates: [
          { eventName: 'Project Delivery Deadline', date: getFutureDate(45), originalTextSnippet: '...final delivery of all assets no later than 45 days...' },
      ],
      counterparties: ['Jane Artist', 'Your Company Inc.'],
    },
  },
   {
    id: 'doc-5',
    name: 'Old Partnership Agreement',
    date: getPastDate(1200),
    originalText: 'Partnership agreement from a previous venture...',
    status: DocumentStatus.Expired,
    modifiedBy: 'Fatima Al-Sayed',
    analysis: {
      summary: 'An expired partnership agreement from 2021. No active obligations remain.',
      keyClauses: [],
      potentialRisks: [],
      keyDates: [],
      counterparties: ['Legacy Partners'],
    },
  }
];

export const mockManualDeadlines: ManualDeadline[] = [
    { id: 'md-1', eventName: 'Quarterly Tax Filing', date: getFutureDate(15), docId: undefined },
    { id: 'md-2', eventName: 'Submit Final Project Deliverables', date: getFutureDate(45), docId: 'doc-4' },
    { id: 'md-3', eventName: 'Annual Insurance Renewal', date: getFutureDate(75) },
];

export const mockActivityFeed: ActivityEvent[] = [
    { id: 'act-1', type: 'DOCUMENT_CREATED', timestamp: getPastDate(2), user: 'David Smith', details: { documentName: 'Freelance Designer Contract', docId: 'doc-4' } },
    { id: 'act-2', type: 'STATUS_UPDATED', timestamp: getPastDate(4), user: 'Alex Johnson', details: { documentName: 'Innovate Corp Services Agreement', docId: 'doc-1', oldStatus: DocumentStatus.InReview, newStatus: DocumentStatus.Active } },
    { id: 'act-3', type: 'DOCUMENT_CREATED', timestamp: getPastDate(5), user: 'Alex Johnson', details: { documentName: 'Innovate Corp Services Agreement', docId: 'doc-1' } },
    { id: 'act-4', type: 'STATUS_UPDATED', timestamp: getPastDate(10), user: 'Maria Garcia', details: { documentName: 'Project Phoenix NDA', docId: 'doc-2', oldStatus: DocumentStatus.Draft, newStatus: DocumentStatus.AwaitingSignature } },
    { id: 'act-5', type: 'DOCUMENT_DELETED', timestamp: getPastDate(11), user: 'Chen Wei', details: { documentName: 'Obsolete Marketing Proposal' } },
];
