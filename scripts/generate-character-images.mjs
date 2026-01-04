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

function getGenderForIndex(index) {
  // Alternate between male and female for variety
  const pattern = [0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1]; // 0 = male, 1 = female
  return pattern[index] === 0 ? 'male' : 'female';
}

async function generateCharacterImage(theme) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  // Odd indices = Hero, Even indices = Villain
  const alignment = theme.index % 2 === 0 ? 'hero' : 'villain';
  const gender = getGenderForIndex(theme.index);
  const pronoun = gender === 'male' ? 'he' : 'she';

  console.log(`Generating ${gender} ${alignment} character for: ${theme.name}`);

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const prompt = `
Create a dynamic superhero character artwork in comic book style.

CHARACTER: A ${gender} ${alignment} with a "${theme.name}" theme - ${theme.description}

CRITICAL REQUIREMENTS:
1. TRANSPARENT BACKGROUND - The background must be completely transparent/alpha channel
2. NO card elements, NO frames, NO borders, NO rectangular windows
3. NO Singapore landmarks or any background scenery
4. ONLY the character should be visible on a transparent background

COMPOSITION:
1. FULL-BODY character in a dramatic action pose
2. The character should be in mid-action - jumping, fighting, using powers, etc.
3. Dynamic, energetic pose showing movement
4. Character isolated on transparent background

FACE & BODY:
- Generic, attractive ${gender} face - NOT a specific person
- Professional superhero costume design
- Heroic proportions and physique
- Face should be clearly visible but stylized/generic

THEME DETAILS:
${getThemeSpecificDetails(theme.id, alignment, pronoun)}

STYLE:
- Vibrant, saturated colors matching the theme
- Comic book style shading
- Dynamic lighting and dramatic shadows
- NO TEXT on the image
- High energy, action-packed composition
- TRANSPARENT BACKGROUND (no sky, no ground, no scenery)

Create ONLY the superhero character in action with a completely transparent background.
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
        aspectRatio: "3:4", // Trading card aspect ratio
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

function getThemeSpecificDetails(themeId, alignment, pronoun) {
  const details = {
    cyberpunk: `${alignment === 'hero' ? 'Sleek cybernetic enhancements, neon-lit armor, digital interface elements. Bright cyan and magenta lighting.' : 'Dark tech armor, corrupted data streams, menacing cybernetic weapons. Red and purple ominous glow.'}`,
    mystic: `${alignment === 'hero' ? 'Flowing robes with golden mystical symbols, casting protective magic, divine aura of light' : 'Dark sorcerer robes with purple necromantic energy, cursed runes, shadowy magic'}`,
    space: `${alignment === 'hero' ? 'Space ranger uniform, energy weapons, heroic space captain look, bright stars around' : 'Alien conqueror armor, advanced alien tech, dark space background with ominous ships'}`,
    steampunk: `${alignment === 'hero' ? 'Victorian gentleman/lady outfit with brass mechanical enhancements, polished copper gears, steam-powered gadgets' : 'Rusty weaponized industrial suit, dark brass, menacing steam-powered weapons'}`,
    ninja: `${alignment === 'hero' ? 'Traditional ninja outfit with honorable samurai elements, katana, moonlight, disciplined stance' : 'Shadow assassin outfit, multiple blades, dark aura, deadly stealth pose'}`,
    elemental: `${alignment === 'hero' ? 'Nature-inspired costume, controlling life-giving elements (water, wind, plants), harmonious energy' : 'Dark elemental powers, summoning destructive natural disasters, chaotic storm effects'}`,
    noir: `${alignment === 'hero' ? 'Detective trench coat, fedora, justice badge visible, dramatic noir lighting, seeking truth' : 'Criminal mastermind suit, dark fedora, shadows of corruption, underworld boss aesthetic'}`,
    galactic: `${alignment === 'hero' ? 'Cosmic armor with protective energy shields, space ranger insignia, defending planets, bright cosmic energy' : 'Dark empire armor, conquering fleet symbols, domination pose, ominous cosmic power'}`,
    medieval: `${alignment === 'hero' ? 'Shining knight armor, holy sword, noble crest, dragon companion, righteous stance' : 'Dark knight armor, cursed blade, evil dragon, ominous castle background'}`,
    urban: `${alignment === 'hero' ? 'Modern tactical suit, protective watch tower symbolism, rooftop guardian, city lights' : 'Criminal empire outfit, gang insignia, dark urban aesthetic, street dominance'}`,
    mutant: `${alignment === 'hero' ? 'Evolved human form showing genetic perfection, bright DNA energy patterns, advanced powers' : 'Dangerous mutation visible, chaotic genetic energy, unstable powers, menacing'}`,
    mecha: `${alignment === 'hero' ? 'Piloting/wearing advanced protective mech suit, heroic robot design, bright tech interface' : 'Dark weaponized war mech, ominous robot armor, destructive weapon systems'}`,
  };

  return details[themeId] || '';
}

async function generateAllCharacterImages() {
  console.log("🦸 Starting superhero character image generation...\n");

  // Create output directory
  const outputDir = join(__dirname, '..', 'public');
  try {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}\n`);
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}\n`);
  }

  for (const theme of THEMES) {
    try {
      const imageBase64 = await generateCharacterImage(theme);
      const alignment = theme.index % 2 === 0 ? 'hero' : 'villain';
      const filename = `ss-${theme.id}-${alignment}.png`;
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

  console.log("🎉 Superhero character image generation complete!");
  console.log(`\n📊 Summary:`);
  console.log(`Total characters: ${THEMES.length}`);
  console.log(`Heroes (even indices): ${THEMES.filter((_, i) => i % 2 === 0).map(t => t.name).join(', ')}`);
  console.log(`Villains (odd indices): ${THEMES.filter((_, i) => i % 2 === 1).map(t => t.name).join(', ')}`);
}

// Run the script
generateAllCharacterImages().catch(console.error);
