import { getDb } from './_shared/db.mts';

/**
 * Netlify Function: Get global statistics for all users
 * Used for rankings and comparisons in Stats tab
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = getDb();

  try {
    const { clerkId } = await req.json();

    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all users' total adds (sum of save_count for all their active public cards)
    const userAddRankings = await sql`
      SELECT
        clerk_id,
        SUM(save_count) as total_adds
      FROM cards
      WHERE active = TRUE AND public = TRUE
      GROUP BY clerk_id
      ORDER BY total_adds DESC
    `;

    // Get all users' most popular card
    const userTopCardRankings = await sql`
      WITH user_top_cards AS (
        SELECT
          clerk_id,
          MAX(save_count) as top_card_saves
        FROM cards
        WHERE active = TRUE AND public = TRUE
        GROUP BY clerk_id
      )
      SELECT
        clerk_id,
        top_card_saves
      FROM user_top_cards
      ORDER BY top_card_saves DESC
    `;

    // Get unique users who saved this user's cards
    const uniqueSavers = await sql`
      SELECT DISTINCT sc.user_clerk_id
      FROM saved_cards sc
      JOIN cards c ON sc.card_id = c.id
      WHERE c.clerk_id = ${clerkId}
        AND c.active = TRUE
        AND c.public = TRUE
    `;

    // Find current user's rank by total adds
    const totalAddsRank = userAddRankings.findIndex(u => u.clerk_id === clerkId) + 1;
    const totalUsers = userAddRankings.length;

    // Find current user's rank by top card popularity
    const topCardRank = userTopCardRankings.findIndex(u => u.clerk_id === clerkId) + 1;

    return new Response(
      JSON.stringify({
        totalAddsRank,
        topCardRank,
        totalUsers,
        uniqueSavers: uniqueSavers.length,
      }),
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
