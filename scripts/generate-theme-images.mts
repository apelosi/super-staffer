import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

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

async function generateThemeImage(theme: typeof THEMES[0]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  // Odd indices = Hero, Even indices = Villain
  const alignment = theme.index % 2 === 0 ? 'Hero' : 'Villain';

  console.log(`Generating ${alignment} image for: ${theme.name}`);

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const prompt = `
Create a stunning icon/emblem artwork representing the "${theme.name}" superhero theme.

THEME: ${theme.name} - ${theme.description}
ALIGNMENT: ${alignment}

REQUIREMENTS:
1. Create an iconic symbol or emblem that represents this theme
2. Style: Modern superhero logo design with a ${alignment === 'Hero' ? 'heroic, inspiring' : 'dark, menacing'} aesthetic
3. Include visual elements that clearly communicate the theme (${theme.description})
4. Use vibrant, saturated colors appropriate for the theme
5. The design should work as a square icon/emblem
6. Clean, bold design that's recognizable even at small sizes
7. NO TEXT in the image - visual symbol only
8. ${alignment === 'Hero' ? 'Bright, uplifting color palette with inspiring symbolism' : 'Darker, more ominous tones with villainous symbolism'}

SPECIFIC THEME GUIDANCE:
${getThemeSpecificGuidance(theme.id, alignment)}

Create a powerful, iconic emblem that captures the essence of ${theme.name} as a ${alignment}.
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
        aspectRatio: "1:1", // Square for icons
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
    throw new Error(`No image data returned from Gemini for ${theme.name}`);
  }

  return generatedImageBase64;
}

function getThemeSpecificGuidance(themeId: string, alignment: string): string {
  const guidance: Record<string, string> = {
    cyberpunk: `A futuristic cityscape silhouette with neon lights, circuit patterns, and digital elements. ${alignment === 'Hero' ? 'Bright cyan and magenta neon glow' : 'Dark purple and red corrupted data streams'}`,
    mystic: `Ancient mystical symbols, magical runes, and ethereal energy. ${alignment === 'Hero' ? 'Golden divine light and protective symbols' : 'Dark purple necromantic energy and cursed runes'}`,
    space: `Cosmic elements like planets, stars, and spaceships. ${alignment === 'Hero' ? 'Bright stars and hopeful cosmic vistas' : 'Black holes and ominous alien technology'}`,
    steampunk: `Victorian-era brass gears, steam pipes, and clockwork mechanisms. ${alignment === 'Hero' ? 'Polished brass and gleaming copper' : 'Rusty, weaponized industrial machinery'}`,
    ninja: `Traditional ninja weapons, shadows, and martial arts symbols. ${alignment === 'Hero' ? 'Honorable samurai elements with moonlight' : 'Assassin blades dripping with darkness'}`,
    elemental: `Natural elements like water, fire, earth, wind. ${alignment === 'Hero' ? 'Life-giving nature and harmonious elements' : 'Destructive natural disasters and chaos'}`,
    noir: `Detective elements like magnifying glass, fedora, city skyline. ${alignment === 'Hero' ? 'Justice badge and truth-seeking light' : 'Criminal underworld and corruption'}`,
    galactic: `Galactic shields, cosmic energy, space ranger insignia. ${alignment === 'Hero' ? 'Protective energy shields and peace symbols' : 'Conquering empire symbols and dominion'}`,
    medieval: `Knights, castles, swords, and dragon imagery. ${alignment === 'Hero' ? 'Noble coat of arms and holy sword' : 'Dark dragon and cursed blade'}`,
    urban: `City buildings, rooftops, urban landscape. ${alignment === 'Hero' ? 'Protective watch tower and justice symbol' : 'Criminal empire and gang territory markers'}`,
    mutant: `DNA helixes, mutation symbols, evolved powers. ${alignment === 'Hero' ? 'Evolved humanity and genetic perfection' : 'Dangerous mutation and genetic chaos'}`,
    mecha: `Robot suits, mechanical armor, tech interfaces. ${alignment === 'Hero' ? 'Advanced protective mech suit' : 'Weaponized war machine'}`,
  };

  return guidance[themeId] || '';
}

async function generateAllThemeImages() {
  console.log("🎨 Starting theme image generation...\n");

  // Create output directory
  const outputDir = join(process.cwd(), 'public', 'theme-images');
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

      // Convert base64 to buffer and save
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      writeFileSync(filepath, imageBuffer);

      console.log(`✅ Saved: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)\n`);

      // Add delay to avoid rate limiting
      if (theme.index < THEMES.length - 1) {
        console.log("⏳ Waiting 2 seconds before next generation...\n");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${theme.name}:`, error);
      console.log("Continuing with next theme...\n");
    }
  }

  console.log("🎉 Theme image generation complete!");
  console.log(`\n📊 Summary:`);
  console.log(`Total themes: ${THEMES.length}`);
  console.log(`Heroes (even indices): ${THEMES.filter((_, i) => i % 2 === 0).map(t => t.name).join(', ')}`);
  console.log(`Villains (odd indices): ${THEMES.filter((_, i) => i % 2 === 1).map(t => t.name).join(', ')}`);
}

// Run the script
generateAllThemeImages().catch(console.error);
