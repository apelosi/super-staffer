import { neon } from '@neondatabase/serverless';

/**
 * Netlify Function: Save or update user profile
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL!);

  try {
    const body = await req.json();
    const { clerkId, name, selfieUrl, strengths, story } = body;

    console.log('Saving user:', { clerkId, name, selfieLength: selfieUrl?.length, strengths, storyLength: story?.length });

    if (!clerkId || !name || !selfieUrl) {
      console.error('Missing fields:', { hasClerkId: !!clerkId, hasName: !!name, hasSelfie: !!selfieUrl });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upsert: Insert or update on conflict
    await sql`
      INSERT INTO users (clerk_id, name, selfie_url, strengths, story, updated_at)
      VALUES (${clerkId}, ${name}, ${selfieUrl}, ${strengths || []}, ${story || ''}, NOW())
      ON CONFLICT (clerk_id)
      DO UPDATE SET
        name = ${name},
        selfie_url = ${selfieUrl},
        strengths = ${strengths || []},
        story = ${story || ''},
        updated_at = NOW()
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
