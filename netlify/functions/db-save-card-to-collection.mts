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

    // Check if card exists, is active, and is public
    const [card] = await sql`
      SELECT id, public, active
      FROM cards
      WHERE id = ${cardId}
    `;

    if (!card) {
      return new Response(JSON.stringify({ error: 'Card not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!card.active || !card.public) {
      return new Response(JSON.stringify({ error: 'Card is not available' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert into saved_cards (will fail if already saved due to unique constraint)
    await sql`
      INSERT INTO saved_cards (user_clerk_id, card_id, saved_at)
      VALUES (${userClerkId}, ${cardId}, NOW())
      ON CONFLICT (user_clerk_id, card_id) DO NOTHING
    `;

    // Increment save_count
    await sql`
      UPDATE cards
      SET save_count = save_count + 1
      WHERE id = ${cardId}
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save card to collection error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
