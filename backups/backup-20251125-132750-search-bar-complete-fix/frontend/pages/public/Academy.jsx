import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { GraduationCap, BookOpen, Video, Award, Play, Clock, ArrowRight } from 'lucide-react';

const COURSES = [
  { title: 'Getting Started with Axolop', lessons: 8, duration: '45 min', level: 'Beginner', free: true },
  { title: 'Mastering Pipeline Management', lessons: 12, duration: '1.5 hrs', level: 'Intermediate', free: true },
  { title: 'Email Marketing Excellence', lessons: 10, duration: '1 hr', level: 'Intermediate', free: true },
  { title: 'Automation Workflows 101', lessons: 15, duration: '2 hrs', level: 'Advanced', free: true },
  { title: 'AI Second Brain Deep Dive', lessons: 8, duration: '1 hr', level: 'Advanced', free: true },
  { title: 'Agency Growth Blueprint', lessons: 20, duration: '3 hrs', level: 'All Levels', free: true },
];

const Academy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title="Academy - Free Courses | Axolop" description="Learn how to maximize Axolop with free courses, tutorials, and certifications. From beginner to advanced." />
      <NavigationBar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-semibold mb-6">
              Academy
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Master Axolop with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Free Courses
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Learn at your own pace with our comprehensive course library. From basics to advanced strategies, we have you covered.
            </p>
            <Link
              to="/signup"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-purple-500 to-pink-500',
                'text-white font-semibold text-lg',
                'shadow-lg shadow-purple-500/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Start Learning <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Course Catalog</h2>
            <p className="text-gray-400">All courses are completely free for Axolop users</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-gray-800/50 hover:border-purple-500/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-purple-400" />
                  </div>
                  {course.free && (
                    <span className="px-2 py-1 rounded-full bg-[#14787b]/20 text-[#1fb5b9] text-xs font-semibold">
                      Free
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                </div>
                <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-xs">
                  {course.level}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 text-center"
          >
            <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Get Certified</h3>
            <p className="text-gray-400 mb-6">
              Complete our courses and earn official Axolop certifications to showcase your expertise.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              Start your certification journey <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Academy;
