import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsX,
  BsChevronLeft,
  BsChevronRight,
  BsZoomIn,
  BsZoomOut,
  BsArrowsAngleContract,
  BsDownload
} from "react-icons/bs";

/**
 * Reusable full-featured Image Lightbox Modal
 * Supports:
 * - Single image or multi-image gallery
 * - Zoom in / zoom out / 1:1 reset
 * - Keyboard navigation (Esc, ArrowLeft, ArrowRight)
 * - Next / Previous buttons
 * - Thumbnail strip
 * - Image counter & title
 */
const ImageLightbox = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
  title = "Product Image Gallery"
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const activeIndex = currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;
  const currentImage = images[activeIndex] || "";

  // Reset zoom on image change or modal open
  useEffect(() => {
    setZoomLevel(1);
  }, [activeIndex, isOpen]);

  // Next / Previous helpers
  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    const nextIdx = (activeIndex - 1 + images.length) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [activeIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIdx = (activeIndex + 1) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [activeIndex, images.length, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(prev + 0.3, 3));
      } else if (e.key === "-") {
        setZoomLevel((prev) => Math.max(prev - 0.3, 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 1));
  const handleResetZoom = () => setZoomLevel(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col justify-between select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 text-white/90 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide truncate max-w-xs sm:max-w-md">
              {title}
            </span>
            {images.length > 1 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                {activeIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors disabled:opacity-30 cursor-pointer"
              title="Zoom In (+)"
            >
              <BsZoomIn className="text-lg" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors disabled:opacity-30 cursor-pointer"
              title="Zoom Out (-)"
            >
              <BsZoomOut className="text-lg" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <BsArrowsAngleContract className="text-base" />
              </button>
            )}

            {/* Download Image Button */}
            {currentImage && (
              <a
                href={currentImage}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Open / Download Full Image"
              >
                <BsDownload className="text-base" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 ml-1 rounded-lg bg-white/10 hover:bg-[#F88897] text-white transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <BsX className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#6C2C12] text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-white/15 hover:scale-105"
              title="Previous (Left Arrow)"
            >
              <BsChevronLeft className="text-lg -ml-0.5" />
            </button>
          )}

          {/* Active Image */}
          <div
            className="w-full h-full flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.img
              key={`${activeIndex}-${currentImage}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: zoomLevel }}
              transition={{ duration: 0.2 }}
              src={currentImage}
              alt={title}
              className="max-h-[75vh] max-w-[90vw] sm:max-w-[85vw] object-contain rounded-lg shadow-2xl transition-transform duration-200"
              style={{
                transformOrigin: "center center"
              }}
              draggable={false}
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#6C2C12] text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-white/15 hover:scale-105"
              title="Next (Right Arrow)"
            >
              <BsChevronRight className="text-lg -mr-0.5" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip (if multiple images) */}
        {images.length > 1 && (
          <div className="px-4 py-3 bg-black/60 border-t border-white/10 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange && onIndexChange(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeIndex === idx
                    ? "border-[#F88897] scale-105 shadow-md shadow-[#F88897]/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-white/40"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;

