/**
 * Cloudinary upload service for selfie images
 * Uploads base64 images to Cloudinary via Netlify Function
 */

/**
 * Uploads a base64 selfie image to Cloudinary
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param userId - Clerk user ID for file naming
 * @returns Cloudinary public URL
 */
export const uploadSelfie = async (
  base64Image: string,
  userId: string
): Promise<string> => {
  try {
    // Clean base64 string (remove data URI prefix if present)
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    // Call Netlify Function to upload server-side
    const response = await fetch('/.netlify/functions/upload-selfie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: cleanBase64,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url; // Cloudinary public URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload selfie to cloud storage');
  }
};
