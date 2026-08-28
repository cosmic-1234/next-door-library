/**
 * Helper to resolve book cover image URLs properly across environments.
 * Handles:
 * - External URLs (https://...)
 * - Local /uploads/ files (proxied via Vite or prepended with backend API URL)
 * - Base64 and Blob preview URLs
 */
export const getCoverUrl = (cover) => {
  if (!cover || typeof cover !== 'string') return '';
  const trimmed = cover.trim();
  if (!trimmed) return '';

  // Already a full or protocol-relative URL, or blob / data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const apiUrl = import.meta.env.VITE_API_URL || '';

  if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
    const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
    return `${backendOrigin}${cleanPath}`;
  }

  return cleanPath;
};
