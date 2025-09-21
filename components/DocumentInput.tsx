import React, { useCallback, useRef } from 'react';
import { Button } from './ui/Button';

interface DocumentInputProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  documentName: string;
  setDocumentName: (name: string) => void;
  onAnalyze: () => void;
  onUseSample: () => void;
  isLoading: boolean;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  documentText,
  setDocumentText,
  documentName,
  setDocumentName,
  onAnalyze,
  onUseSample,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        if (!documentName) {
          setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Use filename as name if empty
        }
      };
      reader.readAsText(file);
    }
  }, [setDocumentText, documentName, setDocumentName]);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
      <div>
        <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
          Document Name
        </label>
        <input
            type="text"
            id="documentName"
            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            placeholder="e.g., 'Apartment Lease Agreement'"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            disabled={isLoading}
        />
      </div>
       <div>
        <label htmlFor="documentText" className="block text-sm font-medium text-gray-700 mb-1">
          Document Content
        </label>
        <textarea
          id="documentText"
          className="w-full h-64 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y"
          placeholder="Paste your legal agreement, terms of service, or contract here..."
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
        <Button onClick={onAnalyze} isLoading={isLoading} className="w-full sm:w-auto py-3">
          {isLoading ? 'Analyzing...' : 'Analyze Document'}
        </Button>
        <div className="flex gap-4 sm:ml-auto">
          <Button onClick={handleUploadClick} variant="secondary" disabled={isLoading}>
            Upload File
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.rtf" />
          <Button onClick={onUseSample} variant="secondary" disabled={isLoading}>
            Use Sample
          </Button>
        </div>
      </div>
    </div>
  );
};