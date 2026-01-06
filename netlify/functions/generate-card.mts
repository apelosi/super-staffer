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

        const prompt = `Describe the person's physical appearance precisely: gender, hair color/style, skin tone, facial features (eye shape, nose shape, lip shape, face shape), glasses/beard if any. Do not describe background or clothing.

Create a 1990s Marvel-style comic book trading card (Marvel Universe Series III 1992 style).

SUBJECT: ${theme}-themed ${alignment} with the EXACT face from the input photo.

STYLE: Illustrated comic book art (Alex Ross meets Jim Lee).
- Bold ink outlines on all elements
- Comic book cell-shading, vibrant saturated colors
- NOT photorealistic - this is illustrated superhero art

FACIAL LIKENESS (CRITICAL):
- Face must be immediately recognizable as the person in the photo
- Preserve exact face shape, bone structure, eye shape, nose shape, lip shape
- Maintain skin tone, hair color/style from input photo
- Keep all distinctive features (beauty marks, expression, smile)
- If conflict between likeness and theme, prioritize likeness
- Render in comic style but facial accuracy is top priority

COMPOSITION:
1. Dynamic action pose, face clearly visible (forward or 3/4 angle)
2. Background: Cosmic space/nebula with stars (illustrated, not photo)
3. Behind character's torso: rectangular "window" or portal frame showing Marina Bay Sands hotel (3 towers with skypark boat). MBS must be illustrated/stylized inside this window frame, appearing as scenic backdrop behind the character.

RULES:
- Costume/powers match ${theme} theme
- No text, logos, or symbols anywhere
- No border on image edges, fills canvas edge-to-edge
- MBS must be illustrated, not a photograph`;

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
