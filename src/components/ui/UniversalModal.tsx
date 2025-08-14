import { memo, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OptimizedGlass } from './OptimizedGlass';

// Lazy load modal content components
const AuthContent = lazy(() => import('../auth/AuthModalContent'));
const BookingContent = lazy(() => import('../booking/BookingModalContent'));
const ExperienceContent = lazy(() => import('../booking/ExperienceModalContent'));
const TourContent = lazy(() => import('../tours/TourModalContent'));
const SuccessContent = lazy(() => import('../booking/SuccessModalContent'));

export type ModalType = 
  | 'auth'
  | 'booking'
  | 'experience'
  | 'tour'
  | 'success'
  | 'admin'
  | 'custom';

interface UniversalModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  customContent?: React.ReactNode;
}

// Modal size configurations
const sizeClasses = {
  small: 'max-w-md',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
  fullscreen: 'max-w-7xl'
};

// Animation variants for performance
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const
    }
  }
};

// Enhanced loading spinner
const ModalLoader = memo(() => (
  <div className="flex items-center justify-center p-12">
    <OptimizedGlass intensity="medium" className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </OptimizedGlass>
  </div>
));

ModalLoader.displayName = 'ModalLoader';

// Render modal content based on type
const renderModalContent = (type: ModalType, data: any, customContent?: React.ReactNode, onClose?: () => void) => {
  if (customContent) {
    return customContent;
  }

  switch (type) {
    case 'auth':
      return (
        <Suspense fallback={<ModalLoader />}>
          <AuthContent {...data} />
        </Suspense>
      );
    case 'booking':
      return (
        <Suspense fallback={<ModalLoader />}>
          <BookingContent {...data} />
        </Suspense>
      );
    case 'experience':
      return (
        <Suspense fallback={<ModalLoader />}>
          <ExperienceContent {...data} />
        </Suspense>
      );
    case 'tour':
      return (
        <Suspense fallback={<ModalLoader />}>
          <TourContent {...data} />
        </Suspense>
      );
    case 'success':
      return (
        <Suspense fallback={<ModalLoader />}>
          <SuccessContent bookingData={data} onClose={onClose} />
        </Suspense>
      );
    default:
      return (
        <div className="p-6 text-center">
          <p className="text-white">Modal content not found</p>
        </div>
      );
  }
};

export const UniversalModal = memo<UniversalModalProps>(({
  type,
  isOpen,
  onClose,
  data = {},
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  customContent
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose, closeOnBackdrop]);

  // Prevent modal content click from closing
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Optimized close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          style={{ 
            willChange: 'opacity',
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleContentClick}
            style={{ 
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            <OptimizedGlass 
              intensity="heavy" 
              className="w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-2 text-white hover:text-purple-300 transition-colors duration-200 hover:bg-white/10 rounded-full"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              )}

              {/* Modal Content */}
              <div className="relative">
                {renderModalContent(type, data, customContent, onClose)}
              </div>
            </OptimizedGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

UniversalModal.displayName = 'UniversalModal';

export default UniversalModal;
