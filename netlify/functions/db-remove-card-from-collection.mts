import type { Context } from '@netlify/functions';
import { getDb } from './_shared/db.mts';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { userClerkId, cardId } = body;

    if (!userClerkId || !cardId) {
      return new Response(JSON.stringify({ error: 'Missing userClerkId or cardId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getDb();

    // Delete from saved_cards
    const result = await sql`
      DELETE FROM saved_cards
      WHERE user_clerk_id = ${userClerkId} AND card_id = ${cardId}
      RETURNING card_id
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: 'Card not found in collection' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Decrement save_count (but not below 0)
    await sql`
      UPDATE cards
      SET save_count = GREATEST(0, save_count - 1)
      WHERE id = ${cardId}
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Remove card from collection error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
