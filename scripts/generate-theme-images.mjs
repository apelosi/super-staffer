import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'High-tech low-life in a neon city.', index: 0 },
  { id: 'mystic', name: 'Ancient Mystic', description: 'Sorcery and ancient ruins.', index: 1 },
  { id: 'space', name: 'Space Opera', description: 'Intergalactic battles and starships.', index: 2 },
  { id: 'steampunk', name: 'Steampunk Gear', description: 'Steam-powered brass machinery.', index: 3 },
  { id: 'ninja', name: 'Ninja Shadow', description: 'Stealth and martial arts in the shadows.', index: 4 },
  { id: 'elemental', name: 'Elemental Nature', description: 'Wielding the forces of nature.', index: 5 },
  { id: 'noir', name: 'Noir Detective', description: 'Gritty mysteries in black and white.', index: 6 },
  { id: 'galactic', name: 'Galactic Guardian', description: 'Defending the galaxy from tyrants.', index: 7 },
  { id: 'medieval', name: 'Medieval Knight', description: 'Swords, shields, and dragons.', index: 8 },
  { id: 'urban', name: 'Urban Vigilante', description: 'Protecting the streets at night.', index: 9 },
  { id: 'mutant', name: 'Mutant X', description: 'Genetic mutations and super powers.', index: 10 },
  { id: 'mecha', name: 'Tech Mecha', description: 'Piloting giant robot suits.', index: 11 },
];

async function generateThemeImage(theme) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  // Odd indices = Hero, Even indices = Villain
  const alignment = theme.index % 2 === 0 ? 'Hero' : 'Villain';

  console.log(`Generating ${alignment} icon for: ${theme.name}`);

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const prompt = `
Create a VERY SIMPLE, FLAT ICON representing the "${theme.name}" theme.

THEME: ${theme.name} - ${theme.description}

CRITICAL REQUIREMENTS:
1. FLAT DESIGN - No 3D effects, no shadows, no gradients, no depth
2. SIMPLE GEOMETRIC SHAPES - Clean, minimal, icon-style design
3. 2-4 COLORS MAXIMUM - Use flat, solid colors from this theme's palette
4. BOLD, CLEAR SILHOUETTE - Recognizable even at small sizes
5. NO TEXT, NO DETAILS, NO TEXTURE - Pure flat icon design
6. Style similar to emoji or simple app icons
7. Clean vector-style appearance
8. Square format, centered icon

THEME COLORS:
${getThemeColors(theme.id)}

ICON SUBJECT:
${getSimpleIconSubject(theme.id)}

Create a MINIMAL, FLAT icon - think emoji or simple app icon style, not detailed illustration.
`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { text: prompt }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      }
    }
  });

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
    throw new Error(`No image data returned from Gemini for ${theme.name}`);
  }

  return generatedImageBase64;
}

function getThemeColors(themeId) {
  const colors = {
    cyberpunk: 'Pink (#ec4899) and Purple (#a855f7)',
    mystic: 'Indigo (#6366f1) and Purple (#9333ea)',
    space: 'Blue (#2563eb) and Cyan (#22d3ee)',
    steampunk: 'Amber (#b45309) and Orange (#f97316)',
    ninja: 'Gray (#1f2937) and Red (#dc2626)',
    elemental: 'Green (#22c55e) and Emerald (#047857)',
    noir: 'Gray (#4b5563) and Dark Gray (#111827)',
    galactic: 'Blue (#3b82f6) and Indigo (#4338ca)',
    medieval: 'Red (#b91c1c) and Amber (#d97706)',
    urban: 'Slate (#334155) and Dark Slate (#0f172a)',
    mutant: 'Lime (#84cc16) and Green (#16a34a)',
    mecha: 'Cyan (#0891b2) and Blue (#1e40af)',
  };
  return colors[themeId] || '';
}

function getSimpleIconSubject(themeId) {
  const subjects = {
    cyberpunk: 'Lightning bolt or circuit board pattern',
    mystic: 'Crystal ball or magic wand',
    space: 'Rocket ship or planet',
    steampunk: 'Single gear or cog wheel',
    ninja: 'Shuriken star or katana sword',
    elemental: 'Leaf or flame',
    noir: 'Magnifying glass or detective hat',
    galactic: 'Shield or star emblem',
    medieval: 'Castle tower or sword',
    urban: 'Building or city skyline',
    mutant: 'DNA helix',
    mecha: 'Robot head or mechanical arm',
  };
  return subjects[themeId] || '';
}

async function generateAllThemeImages() {
  console.log("🎨 Starting theme emblem generation...\n");

  const outputDir = join(__dirname, '..', 'public');
  try {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}\n`);
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}\n`);
  }

  for (const theme of THEMES) {
    try {
      const imageBase64 = await generateThemeImage(theme);
      const filename = `${theme.id}.png`;
      const filepath = join(outputDir, filename);

      const imageBuffer = Buffer.from(imageBase64, 'base64');
      writeFileSync(filepath, imageBuffer);

      console.log(`✅ Saved: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)\n`);

      if (theme.index < THEMES.length - 1) {
        console.log("⏳ Waiting 2 seconds...\n");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${theme.name}:`, error);
      console.log("Continuing...\n");
    }
  }

  console.log("🎉 Theme emblem generation complete!");
}

generateAllThemeImages().catch(console.error);
