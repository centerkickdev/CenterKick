/**
 * Utility to fetch a remote file URL and open it via a local Blob object URL (blob:http...)
 * to mask raw Supabase storage bucket URLs in the browser status bar and address bar.
 */
export async function openMaskedBlobUrl(url: string) {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.warn('Fallback opening raw attachment URL:', err);
    window.open(url, '_blank');
  }
}
