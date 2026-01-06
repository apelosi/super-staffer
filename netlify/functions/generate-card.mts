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
      Create a dynamic digital superhero trading card artwork in the classic 1990s comic book style (specifically Marvel Universe Series III 1992).

      SUBJECT: The person in the input image depicted as a powerful ${alignment} with a "${theme}" theme. The face must remain true to the input photo.

      CRITICAL - ARTISTIC STYLE (MUST BE CONSISTENT):
      - This MUST be illustrated comic book art, NOT a photograph or photorealistic rendering
      - Use bold, clean ink outlines on all elements (character, costume, background)
      - Apply traditional comic book cell-shading with distinct color zones (no photo-realistic gradients or soft blending)
      - Vibrant, saturated comic book colors throughout (bright, punchy palette)
      - The entire image should look hand-drawn/illustrated, like a 1990s comic book panel
      - Face should be comic-illustrated (not a photo composite or photorealistic face)
      - Think Alex Ross meets Jim Lee - illustrated superhero art, not photography

      CRITICAL - FACIAL LIKENESS REQUIREMENTS (HIGHEST PRIORITY):
      - The character's face MUST be immediately recognizable as the person in the input photo
      - Preserve the EXACT face shape, bone structure, and facial geometry from the input image
      - Maintain ACCURATE eye shape, eye color, nose shape, lip shape, and facial proportions
      - Keep all distinctive facial features, beauty marks, or characteristics visible in the input
      - Preserve the natural skin tone and complexion accurately
      - Hair color and hairstyle should closely match the input photo (can be enhanced with superhero elements but must remain recognizable)
      - The person's warm smile and expression characteristics should be preserved
      - Even with costume and powers, someone who knows this person should INSTANTLY recognize their face
      - Render the face in comic book illustration style (with clean lines and cell-shading), NOT photorealistic
      - IMPORTANT: Facial accuracy is MORE IMPORTANT than perfect theme adherence
      - If there is any conflict between likeness and theme, prioritize likeness

      COMPOSITION:
      1. The character should be in a dramatic action pose. Ensure the face is clearly visible and facing forward or at a 3/4 angle for maximum recognizability.
      2. BACKGROUND: A deep cosmic space/nebula texture with stars, typical of 90s cosmic trading cards. IMPORTANT: The background must be illustrated/stylized, NOT a photograph of space.
      3. IMPORTANT: Behind the character's torso/body, there must be a distinct, rectangular "window" or portal frame. Inside this window, depict the Marina Bay Sands hotel in Singapore (three towers with the skypark boat on top) as a scenic backdrop. The Marina Bay Sands should be illustrated/stylized to match the comic book art style, NOT a photograph. The character should appear to be in front of this window.

      STYLE DETAILS:
      - Vibrant, saturated colors for costume, powers, and background
      - Bold comic book ink outlines on ALL elements (character outline, costume details, background objects)
      - Traditional comic book cell-shading and color blocking (avoid photorealistic lighting/gradients)
      - The costume, powers, and setting should match the ${theme} theme
      - Do NOT include text on the image
      - CRITICAL: The Marina Bay Sands building must be stylized/illustrated, not a real photograph

      CRITICAL - NO BORDERS OR FRAMES:
      - DO NOT add any white border, frame, or edge around the entire image.
      - DO NOT apply any border effect or outline to the outer edges of the image.
      - The image should extend fully to all four edges without any border whatsoever.
      - The artwork should fill the entire canvas edge-to-edge.
      - Do not create a "card-like" border or frame effect on the outer perimeter.
      - The only frame should be the rectangular window behind the character showing Marina Bay Sands - NOT around the entire image.

      FINAL REMINDER:
      1. The entire image must be illustrated comic book art (1990s superhero trading card style) - NO photorealistic elements.
      2. The face must be immediately recognizable as the exact person in the input photo, rendered in comic book illustration style.
      3. Marina Bay Sands must be stylized/illustrated, not a photograph.
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
