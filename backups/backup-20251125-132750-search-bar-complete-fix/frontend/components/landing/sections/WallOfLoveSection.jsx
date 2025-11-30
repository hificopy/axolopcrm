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
        'bg-black',
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#761B14]/10 to-transparent rounded-full blur-3xl" />
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
            Wall of Love
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            What agency owners are saying about Axolop
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: colIndex * 0.1 + index * 0.05,
                  }}
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
          <button
            className={cn(
              'px-6 py-3 rounded-xl',
              'bg-white/5 hover:bg-white/10',
              'border border-gray-800 hover:border-gray-700',
              'text-white font-medium',
              'transition-all duration-300'
            )}
          >
            See More Reviews
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WallOfLoveSection;
