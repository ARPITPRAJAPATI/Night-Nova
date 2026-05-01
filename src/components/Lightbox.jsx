import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10 z-50"
        >
          <X size={24} />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev() }}
              className="absolute left-6 w-14 h-14 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10 z-50 hover:bg-white/10"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onNext() }}
              className="absolute right-6 w-14 h-14 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10 z-50 hover:bg-white/10"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <motion.img
          key={currentIndex} // forces re-animation when index changes
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-lg"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
        />

        <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 font-mono text-sm tracking-widest">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
