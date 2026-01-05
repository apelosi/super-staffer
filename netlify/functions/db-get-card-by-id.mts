import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Get a single card by ID (for public viewing)
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL!);

  try {
    const { cardId } = await req.json();

    if (!cardId) {
      return new Response(
        JSON.stringify({ error: 'Missing cardId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = await sql`
      SELECT * FROM cards
      WHERE id = ${cardId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ card: null }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = rows[0];
    const card = {
      id: row.id,
      timestamp: Number(row.timestamp),
      imageUrl: row.image_url,
      theme: row.theme,
      alignment: row.alignment,
      userName: row.user_name,
      isPublic: row.is_public,
    };

    return new Response(
      JSON.stringify({ card }),
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
