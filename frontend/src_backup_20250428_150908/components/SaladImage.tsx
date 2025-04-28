import { useState } from 'react';

interface SaladImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function SaladImage({ src, alt, className = '', fallbackSrc = '/images/default-salad.jpg' }: SaladImageProps) {
  const [error, setError] = useState(false);
  
  // Helper to correctly format image URLs
  const formatImageUrl = (url: string): string => {
    // If it's already a full URL or the fallback is being used due to an error
    if (error || url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Otherwise treat as a relative path to the images folder
    return `/images/${url}`;
  };
  
  return (
    <img
      src={error ? fallbackSrc : formatImageUrl(src)}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
