import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing server-side API Key");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const { image, theme, alignment } = await req.json();

        if (!image || !theme || !alignment) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Clean the base64 string
        const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash-image"; // Using the flash model as requested

        const prompt = `
      Create a hyper-realistic, dynamic digital trading card artwork in the style of 1990s superhero cards (specifically Marvel Universe Series III 1992).

      SUBJECT: The person in the input image depicted as a powerful ${alignment} with a "${theme}" theme. The face must remain true to the input photo.

      CRITICAL - FACIAL LIKENESS REQUIREMENTS (HIGHEST PRIORITY):
      - The character's face MUST be immediately recognizable as the person in the input photo
      - Preserve the EXACT face shape, bone structure, and facial geometry from the input image
      - Maintain ACCURATE eye shape, eye color, nose shape, lip shape, and facial proportions
      - Keep all distinctive facial features, beauty marks, or characteristics visible in the input
      - Preserve the natural skin tone and complexion accurately
      - Hair color and hairstyle should closely match the input photo (can be enhanced with superhero elements but must remain recognizable)
      - The person's warm smile and expression characteristics should be preserved
      - Even with costume and powers, someone who knows this person should INSTANTLY recognize their face
      - IMPORTANT: Facial accuracy is MORE IMPORTANT than perfect theme adherence
      - If there is any conflict between likeness and theme, prioritize likeness

      COMPOSITION:
      1. The character should be in a dramatic action pose. Ensure the face is clearly visible and facing forward or at a 3/4 angle for maximum recognizability.
      2. BACKGROUND: A deep cosmic space/nebula texture with stars, typical of 90s cosmic trading cards.
      3. IMPORTANT: Behind the character's torso/body, there must be a distinct, rectangular "window" or portal frame. Inside this window, depict the Marina Bay Sands hotel in Singapore (three towers with the skypark boat on top) as a scenic backdrop. The character should appear to be in front of this window.

      STYLE DETAILS:
      - Vibrant, saturated colors for costume, powers, and background
      - Comic book style shading with bold outlines for costume and environment
      - Maintain realistic, recognizable facial features (face should NOT be heavily stylized)
      - The costume, powers, and setting should match the ${theme} theme
      - Do NOT include text on the image

      CRITICAL - NO BORDERS OR FRAMES:
      - DO NOT add any white border, frame, or edge around the entire image.
      - DO NOT apply any border effect or outline to the outer edges of the image.
      - The image should extend fully to all four edges without any border whatsoever.
      - The artwork should fill the entire canvas edge-to-edge.
      - Do not create a "card-like" border or frame effect on the outer perimeter.
      - The only frame should be the rectangular window behind the character showing Marina Bay Sands - NOT around the entire image.

      FINAL REMINDER: The face must be immediately recognizable as the exact person in the input photo. Preserve their unique facial characteristics, expression, and features with high fidelity.
    `;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: cleanBase64,
                        },
                    },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                }
            }
        });

        // Extract image from response
        let generatedImageBase64 = '';
        const parts = response.candidates?.[0]?.content?.parts;

        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    generatedImageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!generatedImageBase64) {
            throw new Error("No image data returned from Gemini");
        }

        return new Response(JSON.stringify({
            imageUrl: `data:image/png;base64,${generatedImageBase64}`
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Gemini Function Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to generate image" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
