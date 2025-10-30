/**
 * Image optimization utilities for better performance
 * Provides WebP support detection and responsive image helpers
 */

export const supportsWebP = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/webp').includes('webp');
  } catch {
    return false;
  }
};

/**
 * Generate responsive image srcSet for different screen sizes
 * @param imagePath - Base image path without extension
 * @param extension - Image extension (jpg, png, etc)
 * @returns srcSet string for img element
 */
export const generateResponsiveSrcSet = (
  imagePath: string,
  extension: string = 'jpg'
): string => {
  return `
    ${imagePath}-sm.${extension} 480w,
    ${imagePath}-md.${extension} 1024w,
    ${imagePath}-lg.${extension} 1920w
  `.trim();
};

/**
 * Get WebP or fallback image URL
 * @param jpgUrl - JPEG image URL
 * @param webpUrl - WebP image URL
 * @returns WebP URL if supported, otherwise JPEG URL
 */
export const getOptimizedImageUrl = (
  jpgUrl: string,
  webpUrl?: string
): string => {
  if (webpUrl && supportsWebP()) {
    return webpUrl;
  }
  return jpgUrl;
};

/**
 * Generate lazy loading image config
 * @param src - Image source
 * @param alt - Alt text
 * @param width - Image width
 * @param height - Image height
 * @param priority - Load eagerly if true
 * @returns Image configuration object
 */
export const createImageConfig = (
  src: string,
  alt: string,
  width: number,
  height: number,
  priority: boolean = false
) => ({
  src,
  alt,
  width,
  height,
  loading: priority ? ('eager' as const) : ('lazy' as const),
  decoding: 'async' as const,
});
