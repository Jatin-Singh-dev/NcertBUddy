import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResponse = async (prompt) => {
  try {
    const ai = getAI();
    const model = "gemini-3-flash-preview";
    
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are NCERT Buddy, a helpful AI tutor for Indian students in Classes 9-12. Answer doubts based on NCERT textbooks. Be concise, accurate, and encouraging. If a question is outside the scope of NCERT or Classes 9-12, politely mention that you specialize in NCERT curriculum.",
      }
    });

    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};
