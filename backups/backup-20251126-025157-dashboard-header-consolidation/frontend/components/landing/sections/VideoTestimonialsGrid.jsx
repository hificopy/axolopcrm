import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TestimonialCard } from '../ui/TestimonialCard';

/**
 * Video testimonials data
 * Replace YouTube IDs and thumbnails with actual content
 */
const VIDEO_TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'CEO',
    company: 'Digital First Agency',
    quote: 'Axolop helped us consolidate 8 different tools into one platform. We saved over $1,200/month and our team productivity increased by 40%.',
    // videoId: 'YOUR_YOUTUBE_VIDEO_ID', // Uncomment when video is available
    thumbnail: null,
    platform: 'youtube',
    avatar: null,
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'Founder',
    company: 'Growth Marketing Co',
    quote: 'The AI Second Brain feature is a game-changer. It learns from all our client interactions and helps us provide better, faster service.',
    // videoId: 'YOUR_YOUTUBE_VIDEO_ID',
    thumbnail: null,
    platform: 'youtube',
    avatar: null,
  },
  {
    id: 3,
    name: 'Emily Watson',
    title: 'Operations Director',
    company: 'Scale Agency',
    quote: 'We went from chaos to clarity in just 2 weeks. The onboarding was seamless and the support team is incredible.',
    // videoId: 'YOUR_YOUTUBE_VIDEO_ID',
    thumbnail: null,
    platform: 'youtube',
    avatar: null,
  },
];

/**
 * Text testimonials with ratings
 */
const TEXT_TESTIMONIALS = [
  {
    id: 4,
    name: 'James Park',
    title: 'Agency Owner',
    company: 'Park Digital',
    quote: 'Finally, a CRM that understands agency workflows. The pipeline visualization alone is worth the switch.',
    rating: 5,
    avatar: null,
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    title: 'Marketing Director',
    company: 'Elevate Marketing',
    quote: 'The form builder replaced Typeform for us, and the email automation is just as powerful as ActiveCampaign.',
    rating: 5,
    avatar: null,
  },
  {
    id: 6,
    name: 'David Kim',
    title: 'Founder',
    company: 'KimCo Solutions',
    quote: 'Best decision we made this year. Our profit margins increased by 15% just from the tool consolidation savings.',
    rating: 5,
    avatar: null,
  },
];

/**
 * VideoTestimonialsGrid - Grid of customer testimonials with video and text
 */
const VideoTestimonialsGrid = ({ className }) => {
  return (
    <section
      className={cn(
        'relative py-20 md:py-28 overflow-hidden',
        'bg-gradient-to-b from-gray-900/30 via-black to-black',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#14787b]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Hear From Our Customers
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Agency owners share their experience transforming their business with Axolop
          </p>
        </motion.div>

        {/* Video testimonials row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {VIDEO_TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <TestimonialCard
                name={testimonial.name}
                title={testimonial.title}
                company={testimonial.company}
                quote={testimonial.quote}
                videoId={testimonial.videoId}
                thumbnail={testimonial.thumbnail}
                platform={testimonial.platform}
                avatar={testimonial.avatar}
              />
            </motion.div>
          ))}
        </div>

        {/* Text testimonials row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEXT_TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <TestimonialCard
                name={testimonial.name}
                title={testimonial.title}
                company={testimonial.company}
                quote={testimonial.quote}
                rating={testimonial.rating}
                avatar={testimonial.avatar}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="/wall-of-love"
            className="inline-flex items-center gap-2 text-[#1fb5b9] hover:text-white transition-colors font-medium"
          >
            <span>Discover Wall of Love</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTestimonialsGrid;
