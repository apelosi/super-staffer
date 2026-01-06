import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Save a new card
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL!);

  try {
    const { card, clerkId } = await req.json();

    if (!card || !clerkId) {
      return new Response(
        JSON.stringify({ error: 'Missing card or clerkId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sql`
      INSERT INTO cards (
        id, clerk_id, timestamp, image_url, theme, alignment, user_name, public, active, save_count
      )
      VALUES (
        ${card.id},
        ${clerkId},
        ${card.timestamp},
        ${card.imageUrl},
        ${card.theme},
        ${card.alignment},
        ${card.userName},
        ${card.public !== undefined ? card.public : false},
        TRUE,
        0
      )
    `;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('DB error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
