import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TestimonialCardCompact } from '../ui/TestimonialCard';

/**
 * Wall of love testimonials - short quotes for masonry layout
 */
const WALL_OF_LOVE_ITEMS = [
  {
    id: 1,
    name: 'Alex Turner',
    title: 'Agency Owner',
    quote: 'Replaced GoHighLevel and never looked back. The local AI is mind-blowing.',
  },
  {
    id: 2,
    name: 'Jessica Lee',
    title: 'Marketing Director',
    quote: 'Setup took 10 minutes. We were running campaigns the same day.',
  },
  {
    id: 3,
    name: 'Mark Johnson',
    title: 'Founder',
    quote: 'The best CRM decision we ever made. Period.',
  },
  {
    id: 4,
    name: 'Rachel Green',
    title: 'Operations Lead',
    quote: 'Finally unified our sales, marketing, and support in one place.',
  },
  {
    id: 5,
    name: 'Chris Martinez',
    title: 'CEO',
    quote: 'Saved us $1,500/month and countless hours of switching between tools.',
  },
  {
    id: 6,
    name: 'Amanda White',
    title: 'Growth Lead',
    quote: 'The automation workflows are incredibly powerful yet simple to set up.',
  },
  {
    id: 7,
    name: 'Tom Baker',
    title: 'Agency Partner',
    quote: 'Client onboarding went from 2 weeks to 2 days with Axolop.',
  },
  {
    id: 8,
    name: 'Nina Patel',
    title: 'VP Sales',
    quote: 'Pipeline visibility transformed how we forecast and close deals.',
  },
  {
    id: 9,
    name: 'Daniel Wright',
    title: 'Tech Lead',
    quote: 'Finally a CRM with a modern tech stack. The API is a dream.',
  },
  {
    id: 10,
    name: 'Sophie Chen',
    title: 'CMO',
    quote: 'Form builder rivals Typeform. Email automation rivals ActiveCampaign.',
  },
  {
    id: 11,
    name: 'Ryan Cooper',
    title: 'Sales Manager',
    quote: 'Our team adoption was 100% in the first week. That says it all.',
  },
  {
    id: 12,
    name: 'Laura Kim',
    title: 'Customer Success',
    quote: 'Support tickets resolved faster with the knowledge base integration.',
  },
];

/**
 * WallOfLoveSection - Masonry grid of short testimonials
 */
const WallOfLoveSection = ({ className }) => {
  // Split into columns for masonry effect
  const columns = [
    WALL_OF_LOVE_ITEMS.filter((_, i) => i % 3 === 0),
    WALL_OF_LOVE_ITEMS.filter((_, i) => i % 3 === 1),
    WALL_OF_LOVE_ITEMS.filter((_, i) => i % 3 === 2),
  ];

  return (
    <section
      className={cn(
        'relative py-20 overflow-hidden',
        className
      )}
      style={{ background: '#0F0510' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#E92C92]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Axolop Effect
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Real results from real agency owners using Axolop
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(colIndex * 0.05 + index * 0.03, 0.25),
                    ease: 'easeOut'
                  }}
                  className="will-change-transform"
                >
                  <TestimonialCardCompact
                    name={item.name}
                    title={item.title}
                    quote={item.quote}
                    avatar={item.avatar}
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Load more / See all */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button>
            {/* Metallic Button Body */}
            <div
              className="relative overflow-hidden px-6 py-3 rounded-full inline-flex items-center"
              style={{
                background: 'linear-gradient(180deg, #ff85c8 0%, #E92C92 30%, #c41e78 70%, #ff69b4 100%)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {/* Chrome Text */}
              <span
                className="relative z-10 font-black tracking-wide text-base"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))',
                }}
              >
                See More Reviews
              </span>

              {/* Top metallic shine band */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WallOfLoveSection;
