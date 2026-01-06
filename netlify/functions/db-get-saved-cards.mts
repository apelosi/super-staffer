import type { Context } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { clerkId } = body;

    console.log('[db-get-saved-cards] Received clerkId:', clerkId, 'Type:', typeof clerkId);

    if (!clerkId || typeof clerkId !== 'string' || clerkId === 'undefined' || clerkId === 'null') {
      console.error('[db-get-saved-cards] Invalid clerkId:', clerkId);
      return new Response(JSON.stringify({ error: 'Missing or invalid clerkId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    // Get saved cards (only those that are active and public)
    const rows = await sql`
      SELECT
        c.id,
        c.timestamp,
        c.image_url as "imageUrl",
        c.theme,
        c.alignment,
        c.user_name as "userName",
        c.public,
        c.active,
        c.save_count as "saveCount",
        c.clerk_id as "ownerClerkId",
        sc.saved_at as "savedAt"
      FROM saved_cards sc
      JOIN cards c ON sc.card_id = c.id
      WHERE sc.user_clerk_id = ${clerkId}
        AND c.active = TRUE
        AND c.public = TRUE
      ORDER BY sc.saved_at DESC
    `;

    const cards = rows.map((row: any) => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      imageUrl: row.imageUrl,
      theme: row.theme,
      alignment: row.alignment,
      userName: row.userName,
      public: row.public,
      active: row.active,
      saveCount: row.saveCount,
      ownerClerkId: row.ownerClerkId,
      savedAt: new Date(row.savedAt).getTime(),
    }));

    return new Response(JSON.stringify({ cards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get saved cards error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
