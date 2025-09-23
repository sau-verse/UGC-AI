import { useEffect, lazy, Suspense } from "react";
import { createPortal } from "react-dom";

// Lazy load framer-motion for better performance
const MotionDiv = lazy(() => import("framer-motion").then(module => ({ default: module.motion.div })));
const MotionImg = lazy(() => import("framer-motion").then(module => ({ default: module.motion.img })));
const AnimatePresence = lazy(() => import("framer-motion").then(module => ({ default: module.AnimatePresence })));

interface LightboxProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Lightbox({ imageUrl, isOpen, onClose }: LightboxProps) {
  // Disable background scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <Suspense fallback={
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <MotionImg
              src={imageUrl}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // prevent close when clicking image
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </Suspense>,
    document.body
  );
}