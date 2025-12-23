
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getNutritionInfo = async (foodName: string) => {
  const prompt = `Provide the nutritional information for "${foodName}" per 100g (or 1 standard serving unit if appropriate). Estimate conservative average values.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Standardized name of the food in Traditional Chinese" },
            calories: { type: Type.NUMBER, description: "Calories (kcal)" },
            protein: { type: Type.NUMBER, description: "Protein (g)" },
            carbs: { type: Type.NUMBER, description: "Carbohydrates (g)" },
            fat: { type: Type.NUMBER, description: "Fat (g)" },
            unit: { type: Type.STRING, description: "Unit used for measurement (e.g., 100g, 1顆)" },
            category: { 
              type: Type.STRING, 
              enum: ['staple', 'meat', 'vegetable', 'fruit', 'dairy', 'fat', 'other'],
              description: "Food category"
            }
          },
          required: ["name", "calories", "protein", "carbs", "fat", "unit", "category"],
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getSubstitutes = async (foodName: string, category: string) => {
  const prompt = `Based on the food "${foodName}" in the category "${category}", suggest 3 healthy alternatives within the same nutritional group. For each, provide a brief reason why it's a good swap and its estimated nutrition per 100g.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING, description: "Why this is a good substitute (e.g., lower GI, more fiber)" },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              unit: { type: Type.STRING }
            },
            required: ["name", "reason", "calories", "protein", "carbs", "fat", "unit"]
          }
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Substitute API Error:", error);
    return [];
  }
};
