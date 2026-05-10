'use client';

import { useEffect, useState } from "react";
import Image from "next/image";

interface FlashImageGalleryProps {
  images: string[];
  /** 
   * How fast the images switch in milliseconds. 
   * Smaller = faster flashing.
   */
  speedMs?: number; 
  /**
   * The duration of the fade transition. 
   * Making this larger than speedMs creates an overlapping effect where multiple images are visible at once.
   */
  transitionDurationMs?: number;
}

export default function FlashImageGallery({ 
  images, 
  speedMs = 300, 
  transitionDurationMs = 1000 
}: FlashImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, speedMs);

    return () => clearInterval(interval);
  }, [images.length, speedMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: "inherit" }}>
      {images.map((src, index) => {
        // Calculate a slight scale based on distance to current index for a deeper overlapping effect
        const isActive = index === currentIndex;
        
        return (
          <div
            key={`${src}-${index}`}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 1,
              transition: `opacity ${transitionDurationMs}ms ease-in-out, transform ${transitionDurationMs * 1.5}ms ease-out`,
              transform: isActive ? 'scale(1)' : 'scale(1.1)',
            }}
          >
            <img
              src={src}
              alt={`Gallery image ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        );
      })}
    </div>
  );
}
