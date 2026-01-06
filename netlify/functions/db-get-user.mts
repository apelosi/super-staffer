import { getDb } from './_shared/db.mts';

/**
 * Netlify Function: Get user profile from database
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const sql = getDb();
    const { clerkId } = await req.json();

    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1
    `;

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ user: null }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = {
      clerkId: rows[0].clerk_id,
      name: rows[0].name,
      selfie: rows[0].selfie_url,
      strengths: rows[0].strengths || [],
      story: rows[0].story || '',
    };

    return new Response(
      JSON.stringify({ user }),
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
