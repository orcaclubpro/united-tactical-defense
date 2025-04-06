/**
 * Utility functions for optimized image loading
 */

/**
 * Get the most optimized image format based on browser support
 * @param basePath - Base path to the image without extension
 * @param formats - Array of formats to check, in order of preference
 * @param fallback - Fallback format if none are supported
 * @returns The full image path with the best supported format
 */
export const getOptimizedImageFormat = (
  basePath: string,
  formats: string[] = ['avif', 'webp', 'png', 'jpg'],
  fallback: string = 'jpg'
): string => {
  // Check for AVIF support
  const supportsAvif = localStorage.getItem('supportsAvif') === 'true';
  
  // Check for WebP support
  const supportsWebp = localStorage.getItem('supportsWebp') === 'true';
  
  // Return the first supported format
  for (const format of formats) {
    if (format === 'avif' && supportsAvif) {
      return `${basePath}.avif`;
    }
    if (format === 'webp' && supportsWebp) {
      return `${basePath}.webp`;
    }
    if (format !== 'avif' && format !== 'webp') {
      return `${basePath}.${format}`;
    }
  }
  
  // Return fallback format
  return `${basePath}.${fallback}`;
};

/**
 * Detect browser support for image formats and store in localStorage
 * This should be called once when the app loads
 */
export const detectImageSupport = (): void => {
  // Check for WebP support
  const webpCheck = new Image();
  webpCheck.onload = () => {
    localStorage.setItem('supportsWebp', 'true');
  };
  webpCheck.onerror = () => {
    localStorage.setItem('supportsWebp', 'false');
  };
  webpCheck.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  
  // Check for AVIF support
  const avifCheck = new Image();
  avifCheck.onload = () => {
    localStorage.setItem('supportsAvif', 'true');
  };
  avifCheck.onerror = () => {
    localStorage.setItem('supportsAvif', 'false');
  };
  avifCheck.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK';
};

/**
 * Create an IntersectionObserver to lazy load images
 * @param imageSelector - CSS selector for images to lazy load
 * @param rootMargin - Margin around the root (viewport)
 */
export const createLazyImageObserver = (
  imageSelector: string = 'img[data-src]',
  rootMargin: string = '200px 0px'
): void => {
  if (!('IntersectionObserver' in window)) {
    // If IntersectionObserver is not supported, load all images immediately
    document.querySelectorAll(imageSelector).forEach(img => {
      if (img instanceof HTMLImageElement && img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }
  
  const loadImage = (image: HTMLImageElement) => {
    if (image.dataset.src) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    }
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target instanceof HTMLImageElement) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin
  });
  
  document.querySelectorAll(imageSelector).forEach(img => {
    observer.observe(img);
  });
};

export default {
  getOptimizedImageFormat,
  detectImageSupport,
  createLazyImageObserver
}; 