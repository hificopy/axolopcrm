import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { ArrowRight, Clock, User, Tag, Search, Mail } from 'lucide-react';

/**
 * Blog Landing Page - Full placeholder with dummy content
 */

const BLOG_CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Product Updates', slug: 'product-updates' },
  { name: 'Sales Tips', slug: 'sales-tips' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Industry Insights', slug: 'industry' },
  { name: 'Case Studies', slug: 'case-studies' },
];

const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Ways to Close More Deals in 2025",
    excerpt: "Discover proven strategies that top-performing sales teams use to consistently hit their quotas and exceed targets.",
    category: "Sales Tips",
    author: "Sarah Chen",
    date: "Nov 20, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
    featured: true,
  },
  {
    id: 2,
    title: "Introducing AI Lead Scoring: Prioritize What Matters",
    excerpt: "Our new AI-powered lead scoring helps you focus on the prospects most likely to convert. Here's how it works.",
    category: "Product Updates",
    author: "Mike Rodriguez",
    date: "Nov 15, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    featured: true,
  },
  {
    id: 3,
    title: "How Rodriguez Insurance Group Increased Conversions by 40%",
    excerpt: "See how this insurance agency transformed their sales process and dramatically improved their close rate.",
    category: "Case Studies",
    author: "Emily Watson",
    date: "Nov 10, 2025",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Email Marketing Automation: The Complete Guide",
    excerpt: "Everything you need to know about setting up effective email automation that nurtures leads and drives revenue.",
    category: "Marketing",
    author: "Alex Kim",
    date: "Nov 5, 2025",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "The Future of CRM: AI, Automation, and Beyond",
    excerpt: "Explore emerging trends that are reshaping how businesses manage customer relationships in the digital age.",
    category: "Industry Insights",
    author: "Dr. James Foster",
    date: "Oct 28, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "5 Form Design Mistakes That Kill Conversions",
    excerpt: "Your forms might be driving away leads. Learn the common mistakes and how to fix them for better results.",
    category: "Marketing",
    author: "Sarah Chen",
    date: "Oct 20, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop",
  },
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPosts = BLOG_POSTS.filter(post => post.featured);
  const regularPosts = BLOG_POSTS.filter(post => !post.featured);

  const filteredPosts = regularPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase().includes(selectedCategory.replace('-', ' '));
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white" style={{ background: '#0F0510' }}>
      <SEO
        title="Blog - Axolop CRM"
        description="Insights, tips, and updates from the Axolop team. Learn how to grow your business with our CRM platform."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl bg-[#E92C92]/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Axolop Blog</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Insights, tips, and updates to help you grow your business
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/50 hover:border-gray-700/50 transition-colors">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#E92C92]/20 text-[#E92C92] text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#E92C92] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E92C92] to-[#E92C92] flex items-center justify-center text-white text-xs font-bold">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{post.author}</p>
                          <p className="text-gray-500 text-xs">{post.date}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#E92C92] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-8 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-[#E92C92] text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#E92C92]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/50 hover:border-gray-700/50 transition-colors h-full flex flex-col">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E92C92] transition-colors flex-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-gray-500 text-xs">{post.author} · {post.date}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#E92C92]/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Mail className="w-12 h-12 text-[#E92C92] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-400 mb-8">
              Get the latest insights, tips, and product updates delivered to your inbox weekly.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#E92C92] w-full sm:w-80"
              />
              <button
                type="submit"
                className={cn(
                  'px-6 py-3 rounded-xl',
                  'bg-gradient-to-r from-[#E92C92] to-[#E92C92]',
                  'text-white font-semibold',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-4">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
