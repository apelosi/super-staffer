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

        const prompt = `Describe the physical appearance of the person in this photo briefly but precisely (gender, hair color/style, skin tone, facial features, glasses/beard if any). Do not describe the background or clothing.

[Style: Masterpiece Comic Book Art, ${theme} Aesthetic]
[Subject: ${alignment === 'Hero' ? 'Superhero' : 'Supervillain'}]
[Action: Dynamic action pose with dramatic energy effects]
[Character Reference: Match the face of the uploaded image]

Behind the character's torso: A rectangular "window" or portal frame containing Marina Bay Sands hotel in Singapore (three towers with skypark boat on top) as illustrated scenic backdrop.

No text, logos, or symbols on the image.`;

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
