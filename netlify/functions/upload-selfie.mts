import { v2 as cloudinary } from 'cloudinary';

/**
 * Netlify Function: Upload selfie to Cloudinary
 * Server-side upload keeps API secret secure
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Validate environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const { image, userId } = await req.json();

    if (!image || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing image or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upload to Cloudinary with transformations
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      {
        folder: 'superstaffer/selfies',
        public_id: `user_${userId}_${Date.now()}`,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      }
    );

    return new Response(
      JSON.stringify({ url: uploadResult.secure_url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Upload failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
