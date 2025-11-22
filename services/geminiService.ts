import { GoogleGenAI } from "@google/genai";
import { AIReportAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamGeminiResponse = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[] = []
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are ArogyaPlus Assistant, an advanced medical AI. Your voice is professional, futuristic, and empathetic. Keep answers concise. Use medical terminology but explain it simply."
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessageStream({ message: prompt });
    return result;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};

export const analyzeMedicalReport = async (reportText: string): Promise<AIReportAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this medical text and return a JSON object.
      Text: "${reportText}"
      
      Schema required:
      {
        "summary": "Brief 2 sentence summary",
        "findings": [{"severity": "high" | "medium" | "low", "text": "Finding description"}],
        "recommendations": ["Actionable advice 1", "Actionable advice 2"],
        "medicalTerms": [{"term": "Complex Term", "definition": "Simple definition"}]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing report:", error);
    // Fallback structure
    return {
      summary: "Unable to process report details at this time.",
      findings: [],
      recommendations: ["Consult your doctor for interpretation."],
      medicalTerms: []
    };
  }
};

export const generatePredictiveInsights = async (vitalStats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on mock vitals (HR ${vitalStats.hr}, Sleep ${vitalStats.sleep}h), generate 2 futuristic insights JSON: [{"type": "warning"|"success", "title": "", "description": ""}]`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [{ type: "info", title: "System Calibrating", description: "Gathering more biometric data." }];
  }
};

export const identifyMedicine = async (medicineName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify medicine "${medicineName}". Return JSON: { "name": "${medicineName}", "usage": "Short usage", "sideEffects": "Common side effects", "confidence": 0.95 }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { name: medicineName, usage: "Consult doctor", sideEffects: "Unknown", confidence: 0 };
  }
};