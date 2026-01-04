import { Alignment, ThemeName } from "../types";

export const generateCardImage = async (
  selfieBase64: string,
  theme: ThemeName,
  alignment: Alignment
): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/generate-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: selfieBase64,
        theme,
        alignment,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;

  } catch (error) {
    console.error("Card Generation Error:", error);
    throw error;
  }
};