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

        const prompt = `[Style: Masterpiece Comic Book Art, ${theme} Aesthetic, Classic 1990s Trading Card Style (Marvel Universe Series III 1992)]
[Subject: Person from uploaded image in ${alignment} role]
[Action: Dynamic action pose with dramatic energy effects]
[Character Reference: EXACT face from uploaded image - do not idealize or superhero-ize the face]

ARTISTIC STYLE - 1990s Comic Book Illustration:
- Bold, clean ink outlines on all elements (character, costume, background)
- Traditional comic book cell-shading with vibrant, saturated colors
- Comic book illustration style (NOT photorealistic)
- Hand-drawn comic book art aesthetic

THE PERSON'S FACE (CRITICAL - READ CAREFULLY):
- Draw the ACTUAL person's face from the photo in comic book style
- DO NOT make the face look like a generic superhero/supervillain face
- DO NOT idealize, beautify, or alter facial features to look more heroic
- Preserve the REAL nose size and shape from the photo (not a smaller superhero nose)
- Preserve the REAL face shape, bone structure, eye shape, lip shape from the photo
- Keep the person's actual skin tone, hair color, hairstyle, and facial expression
- The face should look like: "This exact person drawn in comic book style" NOT "A superhero who vaguely resembles this person"
- Render face in comic book illustration style while keeping it recognizably this specific person

COMPOSITION:
1. Character in dynamic action pose, face clearly visible (forward or 3/4 angle)
2. Background: Deep cosmic space/nebula with stars (illustrated, not photographic)
3. Behind the character's torso: A rectangular "window" or portal frame containing Marina Bay Sands hotel in Singapore (three towers with skypark boat on top) as illustrated scenic backdrop

COSTUME AND POWERS:
- ${theme} themed costume and powers
- ${alignment} role (heroic or villainous aesthetic)
- Marina Bay Sands must be illustrated/stylized, not a photograph
- No text, logos, or symbols anywhere on the image
- No border or frame on outer image edges - fills canvas edge-to-edge`;

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
