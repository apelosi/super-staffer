import { GoogleGenAI } from "@google/genai";
import { Alignment, ThemeName } from "../types";

// Using gemini-2.5-flash-image as mapped from "Gemini 3 nano banana" in system instructions
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateCardImage = async (
  selfieBase64: string,
  theme: ThemeName,
  alignment: Alignment
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean the base64 string if it includes the header
  const cleanBase64 = selfieBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const prompt = `
    Create a hyper-realistic, dynamic digital trading card artwork in the style of 1990s superhero cards (specifically Marvel Universe Series III 1992).
    
    SUBJECT: The person in the input image, transformed into a powerful ${alignment} with a "${theme}" theme.
    
    COMPOSITION:
    1. The character should be in a dramatic action pose, breaking the frame or coming towards the viewer.
    2. BACKGROUND: A deep cosmic space/nebula texture with stars, typical of 90s cosmic trading cards.
    3. IMPORTANT: Behind the character's torso/body, there must be a distinct, rectangular "window" or portal frame. Inside this window, depict the Marina Bay Sands hotel in Singapore (three towers with the skypark boat on top) as a scenic backdrop. The character should appear to be in front of this window.
    
    STYLE DETAILS:
    - Vibrant, saturated colors.
    - Comic book style shading but with realistic textures.
    - Do NOT include text on the image.
    - Focus on the character design matching the theme: ${theme}.
    
    Ensure the face resembles the input photo but stylized to fit the superhero theme.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, API handles standard types
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Close to trading card ratio
        }
      }
    });

    // Extract image
    // The new SDK structure puts the image in parts
    let base64Image = '';
    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      console.error("No image found in response", response);
      throw new Error("Failed to generate image: No image data returned.");
    }

    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};