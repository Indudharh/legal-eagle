import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AnalysisPage } from './components/AnalysisPage';
import { ComparisonPage } from './components/ComparisonPage';
import { LoginPage } from './components/LoginPage';
import { type StoredDocument, type AnalysisResult, type ManualDeadline, DocumentStatus, type ActivityEvent } from './types';
import { mockDocuments, mockManualDeadlines, mockActivityFeed } from './data/mockData';

type View = 'dashboard' | 'analysis' | 'comparison';

const DEFAULT_WIDGETS = ['risk-overview', 'upcoming-deadlines', 'doc-history', 'doc-status', 'counterparty-overview', 'team-activity-feed'];
const SIMULATED_USERS = ["Alex Johnson", "Maria Garcia", "Chen Wei", "Fatima Al-Sayed", "David Smith"];
const CURRENT_USER = "indudhar";

const App: React.FC = () => {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [manualDeadlines, setManualDeadlines] = useState<ManualDeadline[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [activeDocument, setActiveDocument] = useState<StoredDocument | null>(null);
  const [comparisonDocs, setComparisonDocs] = useState<[StoredDocument, StoredDocument] | null>(null);
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);


  // Load data from localStorage on initial render, or use mock data
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('legalEagleDocs');
      const storedDeadlines = localStorage.getItem('legalEagleDeadlines');
      const storedFeed = localStorage.getItem('legalEagleActivityFeed');
      const storedLayout = localStorage.getItem('legalEagleLayout');

      if (storedDocs) {
        const parsedDocs: StoredDocument[] = JSON.parse(storedDocs);
        const updatedDocs = parsedDocs.map(doc => ({
            ...doc,
            status: doc.status || DocumentStatus.Draft
        }));
        setDocuments(updatedDocs);
        if (storedDeadlines) setManualDeadlines(JSON.parse(storedDeadlines));
        if (storedFeed) setActivityFeed(JSON.parse(storedFeed));
      } else {
        // First time user: load mock data
        setDocuments(mockDocuments);
        setManualDeadlines(mockManualDeadlines);
        setActivityFeed(mockActivityFeed);
      }
      
      if (storedLayout) {
        setDashboardWidgets(JSON.parse(storedLayout));
      } else {
        setDashboardWidgets(DEFAULT_WIDGETS);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Fallback to mock data on error
      setDocuments(mockDocuments);
      setManualDeadlines(mockManualDeadlines);
      setActivityFeed(mockActivityFeed);
      setDashboardWidgets(DEFAULT_WIDGETS);
    }
  }, []);

  // Persist documents to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('legalEagleDocs', JSON.stringify(documents));
    } catch (error) {
      console.error("Failed to save documents to localStorage", error);
    }
  }, [documents, isAuthenticated]);

  // Persist manual deadlines to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('legalEagleDeadlines', JSON.stringify(manualDeadlines));
    } catch (error) {
      console.error("Failed to save deadlines to localStorage", error);
    }
  }, [manualDeadlines, isAuthenticated]);

  // Persist activity feed to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('legalEagleActivityFeed', JSON.stringify(activityFeed));
    } catch (error) {
      console.error("Failed to save activity feed to localStorage", error);
    }
  }, [activityFeed, isAuthenticated]);

  // Persist dashboard layout to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('legalEagleLayout', JSON.stringify(dashboardWidgets));
    } catch (error) {
      console.error("Failed to save layout to localStorage", error);
    }
  }, [dashboardWidgets, isAuthenticated]);
  
  const getRandomUser = () => {
    const otherUsers = SIMULATED_USERS.filter(u => u !== CURRENT_USER);
    return otherUsers[Math.floor(Math.random() * otherUsers.length)];
  }

  const logActivity = useCallback((type: ActivityEvent['type'], details: ActivityEvent['details'], isCurrentUser: boolean = false) => {
    const newEvent: ActivityEvent = {
        id: Date.now().toString(),
        type,
        timestamp: new Date().toISOString(),
        user: isCurrentUser ? CURRENT_USER : getRandomUser(),
        details,
    };
    setActivityFeed(prev => [newEvent, ...prev].slice(0, 50)); // Keep feed to a reasonable size
  }, []);

  const handleAddWidget = useCallback((widgetId: string) => {
    if (!dashboardWidgets.includes(widgetId)) {
        setDashboardWidgets(prev => [...prev, widgetId]);
    }
  }, [dashboardWidgets]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setDashboardWidgets(prev => prev.filter(id => id !== widgetId));
  }, []);


  const handleNavigateToAnalysis = useCallback((doc: StoredDocument | null) => {
    setActiveDocument(doc);
    setView('analysis');
  }, []);

  const handleNavigateToDashboard = useCallback(() => {
    setActiveDocument(null);
    setComparisonDocs(null);
    setView('dashboard');
  }, []);

  const handleNavigateToComparison = useCallback((docIds: [string, string]) => {
    const doc1 = documents.find(d => d.id === docIds[0]);
    const doc2 = documents.find(d => d.id === docIds[1]);
    if (doc1 && doc2) {
        setComparisonDocs([doc1, doc2]);
        setView('comparison');
    } else {
        console.error("Could not find documents for comparison");
    }
  }, [documents]);
  
  const handleSaveDocument = useCallback((
      originalText: string, 
      analysis: AnalysisResult,
      name: string
  ) => {
      const newDoc: StoredDocument = {
          id: Date.now().toString(),
          name: name || `Document-${Date.now()}`,
          date: new Date().toISOString(),
          originalText,
          analysis,
          status: DocumentStatus.Draft,
          modifiedBy: CURRENT_USER,
      };
      setDocuments(prevDocs => [newDoc, ...prevDocs]);
      logActivity('DOCUMENT_CREATED', { documentName: newDoc.name, docId: newDoc.id }, true);
      handleNavigateToDashboard();
  }, [handleNavigateToDashboard, logActivity]);
  
  const handleDeleteDocument = useCallback((id: string) => {
    const docToDelete = documents.find(doc => doc.id === id);
    if (docToDelete) {
        logActivity('DOCUMENT_DELETED', { documentName: docToDelete.name }, true);
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
    }
  }, [documents, logActivity]);

  const handleUpdateDocumentStatus = useCallback((docId: string, status: DocumentStatus) => {
    const docToUpdate = documents.find(doc => doc.id === docId);

    setDocuments(prevDocs => 
        prevDocs.map(doc => {
            if (doc.id === docId) {
                if (doc.status !== status && docToUpdate) {
                    logActivity('STATUS_UPDATED', {
                        documentName: doc.name,
                        docId: doc.id,
                        oldStatus: doc.status,
                        newStatus: status
                    }, true);
                }
                return { ...doc, status, modifiedBy: CURRENT_USER };
            }
            return doc;
        })
    );
  }, [documents, logActivity]);

  const handleAddManualDeadline = useCallback((deadline: Omit<ManualDeadline, 'id'>) => {
    const newDeadline: ManualDeadline = { ...deadline, id: Date.now().toString() };
    setManualDeadlines(prev => [...prev, newDeadline]);
  }, []);

  const handleUpdateManualDeadline = useCallback((updatedDeadline: ManualDeadline) => {
    setManualDeadlines(prev => prev.map(d => d.id === updatedDeadline.id ? updatedDeadline : d));
  }, []);

  const handleDeleteManualDeadline = useCallback((id: string) => {
    setManualDeadlines(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
      switch (view) {
          case 'dashboard':
              return (
                  <Dashboard 
                      documents={documents} 
                      manualDeadlines={manualDeadlines}
                      activityFeed={activityFeed}
                      onAnalyzeNew={() => handleNavigateToAnalysis(null)}
                      onViewDocument={handleNavigateToAnalysis}
                      onDeleteDocument={handleDeleteDocument}
                      onCompareDocuments={handleNavigateToComparison}
                      onUpdateDocumentStatus={handleUpdateDocumentStatus}
                      widgets={dashboardWidgets}
                      onAddWidget={handleAddWidget}
                      onRemoveWidget={handleRemoveWidget}
                      onAddManualDeadline={handleAddManualDeadline}
                      onUpdateManualDeadline={handleUpdateManualDeadline}
                      onDeleteManualDeadline={handleDeleteManualDeadline}
                  />
              );
          case 'analysis':
              return (
                  <AnalysisPage 
                      document={activeDocument}
                      onSave={handleSaveDocument}
                      onCancel={handleNavigateToDashboard}
                      manualDeadlines={manualDeadlines}
                      onAddManualDeadline={handleAddManualDeadline}
                  />
              );
          case 'comparison':
              if (comparisonDocs) {
                  return (
                      <ComparisonPage
                          doc1={comparisonDocs[0]}
                          doc2={comparisonDocs[1]}
                          onBack={handleNavigateToDashboard}
                      />
                  );
              }
              handleNavigateToDashboard();
              return null;
      }
  };
  
  const getPageTitle = () => {
      switch (view) {
          case 'dashboard': return 'Dashboard';
          case 'analysis': return activeDocument ? `Analysis: ${activeDocument.name}` : 'New Document Analysis';
          case 'comparison': return 'Document Comparison';
          default: return 'Legal Eagle AI';
      }
  }

  return (
    <div className="min-h-screen bg-primary-dark font-sans text-gray-300 flex">
      <Sidebar 
          activeView={view}
          onNavigateDashboard={handleNavigateToDashboard}
          onNavigateAnalysis={() => handleNavigateToAnalysis(null)}
      />
      <div className="flex-1 flex flex-col">
        <TopBar 
            title={getPageTitle()}
            onLogout={handleLogout} 
            currentUser={CURRENT_USER}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;