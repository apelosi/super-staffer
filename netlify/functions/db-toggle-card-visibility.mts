import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Toggle card public/private visibility
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL!);

  try {
    const { cardId, public: publicValue } = await req.json();

    if (!cardId || typeof publicValue !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Missing cardId or public' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sql`
      UPDATE cards
      SET public = ${publicValue}
      WHERE id = ${cardId}
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
