import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, X, Star, Quote } from 'lucide-react';

/**
 * TestimonialCard - Card for displaying customer testimonials
 * Supports both text and video testimonials
 */
const TestimonialCard = ({
  name,
  title,
  company,
  quote,
  avatar,
  rating,
  videoId, // YouTube video ID
  thumbnail,
  platform, // 'youtube' | 'twitter' | 'linkedin'
  className,
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const hasVideo = !!videoId;

  return (
    <>
      <motion.div
        className={cn(
          'group relative overflow-hidden rounded-2xl',
          'backdrop-blur-xl bg-white/5',
          'border border-gray-800/50',
          'p-6',
          'transition-all duration-300',
          'hover:bg-white/[0.07]',
          'hover:border-gray-700/50',
          hasVideo && 'cursor-pointer',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        onClick={hasVideo ? () => setIsVideoOpen(true) : undefined}
      >
        {/* Video thumbnail overlay */}
        {hasVideo && thumbnail && (
          <div className="relative mb-4 rounded-xl overflow-hidden">
            <img
              src={thumbnail}
              alt={`${name} testimonial`}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Quote icon */}
        {!hasVideo && (
          <Quote className="w-8 h-8 text-[#E92C92]/30 mb-4" />
        )}

        {/* Quote text */}
        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-4">
          "{quote}"
        </p>

        {/* Rating */}
        {rating && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                )}
              />
            ))}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-center gap-3">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-gray-700"
            />
          )}
          <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-sm text-gray-400">
              {title}{company && ` at ${company}`}
            </p>
          </div>

          {/* Platform icon */}
          {platform && (
            <div className="ml-auto">
              {platform === 'youtube' && (
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              )}
              {platform === 'twitter' && (
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
              )}
              {platform === 'linkedin' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && videoId && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsVideoOpen(false)}
            />

            {/* Modal content */}
            <motion.div
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* YouTube iframe */}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${name} testimonial video`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * TestimonialCardCompact - Smaller version for wall of love
 */
const TestimonialCardCompact = ({
  name,
  title,
  quote,
  avatar,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'backdrop-blur-xl bg-white/5',
        'border border-gray-800/50',
        'p-4',
        'transition-all duration-300',
        'hover:bg-white/[0.07]',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <p className="text-gray-300 text-sm mb-3 line-clamp-3">
        "{quote}"
      </p>
      <div className="flex items-center gap-2">
        {avatar && (
          <img
            src={avatar}
            alt={name}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-xs font-medium text-white">{name}</p>
          {title && <p className="text-xs text-gray-500">{title}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export { TestimonialCard, TestimonialCardCompact };
export default TestimonialCard;
