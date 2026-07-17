'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
   images: string[];
   initialIndex: number;
   onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const [touchStart, setTouchStart] = useState<number | null>(null);
   const [touchEnd, setTouchEnd] = useState<number | null>(null);

   const minSwipeDistance = 50;

   const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
   };

   const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
   };

   const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe) {
         handleNext();
      }
      if (isRightSwipe) {
         handlePrev();
      }
   };

   const handleNext = useCallback(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
   }, [images.length]);

   const handlePrev = useCallback(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
   }, [images.length]);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
         if (e.key === 'ArrowRight') handleNext();
         if (e.key === 'ArrowLeft') handlePrev();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleNext, handlePrev, onClose]);

   // Lock body scroll
   useEffect(() => {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
         document.body.style.overflow = originalOverflow;
      };
   }, []);

   if (!images || images.length === 0) return null;

   return (
      <div 
         className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
         onTouchStart={onTouchStart}
         onTouchMove={onTouchMove}
         onTouchEnd={onTouchEnd}
         onClick={onClose}
      >
         <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
            aria-label="Close"
         >
            <X className="w-8 h-8" />
         </button>

         {images.length > 1 && (
            <>
               <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 hidden sm:block"
                  aria-label="Previous image"
               >
                  <ChevronLeft className="w-8 h-8" />
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 hidden sm:block"
                  aria-label="Next image"
               >
                  <ChevronRight className="w-8 h-8" />
               </button>
            </>
         )}

         <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
               src={images[currentIndex]} 
               alt={`Gallery image ${currentIndex + 1}`} 
               className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in-95 duration-300" 
               onClick={(e) => e.stopPropagation()}
            />
         </div>

         {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none">
               {currentIndex + 1} / {images.length}
            </div>
         )}
      </div>
   );
}
