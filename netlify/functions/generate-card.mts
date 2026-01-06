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
      Describe the physical appearance of the person in this photo briefly but precisely (gender, hair color/style, skin tone, facial features, glasses/beard if any). Do not describe the background or clothing.

      [Style: Masterpiece Comic Book Art, ${theme} Aesthetic, Classic 1990s Trading Card Style (Marvel Universe Series III 1992)]
      [Subject: ${alignment === 'Hero' ? 'Superhero' : 'Supervillain'}]
      [Action: Dynamic superhero action pose with dramatic energy effects]
      [Character Reference: Match the face of the uploaded image]

      Create a ${theme}-themed ${alignment} character with the EXACT facial features, hair, and characteristics of the person described above, rendered in comic book illustration style

      COMPOSITION:
      1. The character should be in a dramatic action pose. Ensure the face is clearly visible and facing forward or at a 3/4 angle for maximum recognizability.
      2. BACKGROUND: A deep cosmic space/nebula texture with stars, typical of 90s cosmic trading cards. IMPORTANT: The background must be illustrated/stylized, NOT a photograph of space.
      3. CRITICAL - MARINA BAY SANDS PLACEMENT: Behind the character's torso/body (in the BACKGROUND, not foreground), there must be a distinct, rectangular "window" or portal frame. Inside this window ONLY, depict the Marina Bay Sands hotel in Singapore (three towers with the skypark boat on top) as a scenic backdrop. The Marina Bay Sands should be illustrated/stylized to match the comic book art style, NOT a photograph. The character should appear to be in FRONT of this window. Marina Bay Sands must NEVER appear in the foreground or anywhere except inside that background window.

      STYLE DETAILS:
      - Vibrant, saturated colors for costume, powers, and background
      - Bold comic book ink outlines on ALL elements (character outline, costume details, background objects)
      - Traditional comic book cell-shading and color blocking (avoid photorealistic lighting/gradients)
      - The costume, powers, and setting should match the ${theme} theme
      - CRITICAL: Do NOT include ANY text, logos, symbols, emblems, or branding ANYWHERE on the image
      - CRITICAL: Do NOT add any logos, icons, or symbols in the corners or any part of the card
      - CRITICAL: The image should contain ONLY the character, background, and the Marina Bay Sands window - NO logos
      - CRITICAL: The Marina Bay Sands building must be stylized/illustrated, not a real photograph, and ONLY in the background window

      CRITICAL - NO BORDERS OR FRAMES:
      - DO NOT add any white border, frame, or edge around the entire image.
      - DO NOT apply any border effect or outline to the outer edges of the image.
      - The image should extend fully to all four edges without any border whatsoever.
      - The artwork should fill the entire canvas edge-to-edge.
      - Do not create a "card-like" border or frame effect on the outer perimeter.
      - The only frame should be the rectangular window behind the character showing Marina Bay Sands - NOT around the entire image.

      FINAL REMINDER:
      1. COMIC BOOK DRAWING FIDELITY is the top priority - this must look like a 1990s illustrated trading card.
      2. Within that comic book style, make the facial features recognizable as the person in the input photo.
      3. Marina Bay Sands must be stylized/illustrated, NOT a photograph, and ONLY in the background window BEHIND the character.
      4. DO NOT add ANY logos, symbols, or branding ANYWHERE on the image - the image must be clean with no logos.
      5. The result should be: "This is a comic book character that looks like [person's name]" - NOT "This is a photo of [person's name]".
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
