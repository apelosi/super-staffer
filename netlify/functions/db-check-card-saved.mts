import type { Context } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

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

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    const result = await sql`
      SELECT card_id
      FROM saved_cards
      WHERE user_clerk_id = ${userClerkId} AND card_id = ${cardId}
    `;

    return new Response(JSON.stringify({ isSaved: result.length > 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Check card saved error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
