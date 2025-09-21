import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, ComparisonResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, plain-English summary of the entire document's purpose and key outcomes for the user."
    },
    keyClauses: {
      type: Type.ARRAY,
      description: "An array of important clauses found in the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          clauseTitle: { 
            type: Type.STRING, 
            description: "A clear, simple title for the clause (e.g., 'Lease Duration & Renewal', 'Payment Terms')." 
          },
          explanation: { 
            type: Type.STRING, 
            description: "A simple explanation of what this clause means for the person signing it." 
          },
          originalTextSnippet: {
            type: Type.STRING,
            description: "A short, relevant snippet of the original legal text this explanation refers to."
          }
        },
        required: ["clauseTitle", "explanation", "originalTextSnippet"]
      }
    },
    potentialRisks: {
      type: Type.ARRAY,
      description: "An array of potential risks or unfavorable terms for the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          riskTitle: { 
            type: Type.STRING, 
            description: "A brief, attention-grabbing title for the potential risk (e.g., 'Automatic Renewal Clause', 'High Late Fees')." 
          },
          riskDescription: { 
            type: Type.STRING, 
            description: "A simple explanation of the risk and why it's important to be aware of." 
          },
          severity: { 
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
            description: "A severity level for the risk: 'High', 'Medium', or 'Low'."
          }
        },
        required: ["riskTitle", "riskDescription", "severity"]
      }
    },
    keyDates: {
        type: Type.ARRAY,
        description: "An array of important dates or deadlines mentioned in the document.",
        items: {
            type: Type.OBJECT,
            properties: {
                eventName: {
                    type: Type.STRING,
                    description: "A short description of the event related to the date (e.g., 'Lease End Date', 'Notice Period Deadline')."
                },
                date: {
                    type: Type.STRING,
                    description: "The specific date in YYYY-MM-DD format."
                },
                originalTextSnippet: {
                    type: Type.STRING,
                    description: "The snippet of text from the document where this date was found."
                }
            },
            required: ["eventName", "date", "originalTextSnippet"]
        }
    },
    counterparties: {
      type: Type.ARRAY,
      description: "An array of the names of the parties, companies, or individuals involved in the agreement (e.g., 'John Smith', 'Innovate Corp.').",
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["summary", "keyClauses", "potentialRisks", "keyDates", "counterparties"]
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A high-level summary of the key differences between the two documents."
        },
        clauseComparisons: {
            type: Type.ARRAY,
            description: "A list of specific clauses that differ between the two documents.",
            items: {
                type: Type.OBJECT,
                properties: {
                    clauseTitle: { type: Type.STRING, description: "The title of the clause being compared (e.g., 'Termination Clause')." },
                    summaryOfDifference: { type: Type.STRING, description: "A concise explanation of how this clause differs between the documents." },
                    detailsDoc1: { type: Type.STRING, description: "Details of the clause as found in Document 1." },
                    detailsDoc2: { type: Type.STRING, description: "Details of the clause as found in Document 2." }
                },
                required: ["clauseTitle", "summaryOfDifference", "detailsDoc1", "detailsDoc2"]
            }
        },
        riskProfileDifferences: {
            type: Type.ARRAY,
            description: "A list of differences in the potential risks identified in each document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    riskTitle: { type: Type.STRING, description: "The title of the risk being compared." },
                    summaryOfDifference: { type: Type.STRING, description: "A concise explanation of how this risk differs." },
                    riskInDoc1: { type: Type.STRING, description: "The risk level or status in Document 1 (e.g., 'High', 'Not Present')." },
                    riskInDoc2: { type: Type.STRING, description: "The risk level or status in Document 2 (e.g., 'Medium', 'Present')." }
                },
                required: ["riskTitle", "summaryOfDifference", "riskInDoc1", "riskInDoc2"]
            }
        }
    },
    required: ["overallSummary", "clauseComparisons", "riskProfileDifferences"]
};

export const analyzeLegalDocument = async (documentText: string): Promise<AnalysisResult> => {
  const prompt = `
Analyze the following legal document. Your task is to:
1.  Summarize the document's purpose in plain English.
2.  Identify and explain the key clauses.
3.  Flag any potential risks or unfavorable terms.
4.  Extract any key dates or deadlines, such as contract end dates, notice periods, or payment due dates. Format all dates as YYYY-MM-DD.
5.  List the names of all parties (counterparties) involved in the document.

Do not provide legal advice. Your analysis is for informational purposes only.

Here is the document:
---
${documentText}
---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: AnalysisResult = JSON.parse(jsonText);
    // Ensure counterparties is always an array
    if (!parsedData.counterparties) {
      parsedData.counterparties = [];
    }
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    throw new Error("Failed to get a valid analysis from the AI model.");
  }
};


export const compareLegalDocuments = async (doc1Text: string, doc2Text: string): Promise<ComparisonResult> => {
    const prompt = `
As a legal analyst, compare the two legal documents provided below. Identify the key differences in clauses, terms, obligations, and potential risks.
Provide a summary of the main differences, a clause-by-clause comparison for significant changes, and an overview of how the risk profiles differ.

Document 1:
---
${doc1Text}
---

Document 2:
---
${doc2Text}
---
  `;

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: comparisonSchema,
            temperature: 0.3,
          },
        });

        const jsonText = response.text.trim();
        const parsedData: ComparisonResult = JSON.parse(jsonText);
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for comparison:", error);
        throw new Error("Failed to get a valid comparison from the AI model.");
    }
};

export const suggestDocumentTitle = async (documentText: string): Promise<string> => {
  // Use only the first 300 words for a quick suggestion
  const textSnippet = documentText.split(' ').slice(0, 300).join(' ');
  if (!textSnippet.trim()) return "";

  const prompt = `Based on the following text snippet, suggest a short, descriptive document title (e.g., "Lease Agreement - 123 Main St" or "NDA for Project X"). Return only the title text, with no quotation marks or extra words.

Snippet:
---
${textSnippet}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 20, // Keep it short
        thinkingConfig: { thinkingBudget: 0 } // faster response
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for title suggestion:", error);
    return "Untitled Document"; // Fallback
  }
};
