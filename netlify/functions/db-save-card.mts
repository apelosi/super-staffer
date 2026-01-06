import { getDb } from './_shared/db.mts';

/**
 * Netlify Function: Save a new card
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = getDb();

  try {
    const { card, clerkId } = await req.json();

    console.log('[db-save-card] Received request:', {
      cardId: card?.id,
      clerkId,
      hasImageUrl: !!card?.imageUrl,
      imageUrlLength: card?.imageUrl?.length
    });

    if (!card || !clerkId) {
      console.error('[db-save-card] Missing required fields:', { hasCard: !!card, hasClerkId: !!clerkId });
      return new Response(
        JSON.stringify({ error: 'Missing card or clerkId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sql`
      INSERT INTO cards (
        id, clerk_id, timestamp, image_url, theme, alignment, user_name, "public", active, save_count
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

    console.log('[db-save-card] Successfully saved card:', card.id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[db-save-card] Database error:', error);
    console.error('[db-save-card] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    return new Response(
      JSON.stringify({ error: error.message, detail: error.detail || 'No additional details' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
