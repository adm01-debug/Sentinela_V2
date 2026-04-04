import * as React from 'react';
import { cn } from '@/utils/cn';
import { Lightbox } from './Lightbox';

interface GalleryImage { src: string; alt?: string; title?: string; thumbnail?: string; }

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const columnClasses = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' };
const gapClasses = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };

export function ImageGallery({ images, columns = 4, gap = 'md', className }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const openLightbox = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
        {images.map((image, index) => (
          <button key={index} onClick={() => openLightbox(index)} className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <img src={image.thumbnail || image.src} alt={image.alt || ''} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>
      <Lightbox images={images} initialIndex={selectedIndex} open={lightboxOpen} onOpenChange={setLightboxOpen} />
    </>
  );
}
