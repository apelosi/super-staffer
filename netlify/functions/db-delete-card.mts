import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Soft delete a card (sets active = FALSE)
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

    // Soft delete: set active = FALSE instead of hard delete
    await sql`
      UPDATE cards
      SET active = FALSE
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
