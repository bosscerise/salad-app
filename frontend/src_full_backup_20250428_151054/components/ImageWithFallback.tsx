import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/default-salad.jpg' 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  
  // Don't modify the source URL, just use it directly or fall back if there's an error
  const imageUrl = error ? fallbackSrc : src;
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
