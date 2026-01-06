import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Get all cards for a user
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL!);

  try {
    const { clerkId } = await req.json();

    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = await sql`
      SELECT * FROM cards
      WHERE clerk_id = ${clerkId}
        AND active = TRUE
      ORDER BY timestamp DESC
    `;

    const cards = rows.map(row => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      imageUrl: row.image_url,
      theme: row.theme,
      alignment: row.alignment,
      userName: row.user_name,
      public: row.public,
      active: row.active,
      saveCount: row.save_count,
      ownerClerkId: row.clerk_id,
    }));

    return new Response(
      JSON.stringify({ cards }),
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
