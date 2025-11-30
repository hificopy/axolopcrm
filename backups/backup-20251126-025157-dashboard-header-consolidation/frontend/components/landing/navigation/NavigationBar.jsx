import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductDropdown from './ProductDropdown';
import PartnerDropdown from './PartnerDropdown';
import MobileNav from './MobileNav';

// Axolop Logo Image
const AxolopLogo = ({ className }) => (
  <img
    src="/LOGO/transparent-logo.png"
    alt="Axolop Logo"
    className={className}
  />
);

/**
 * NavLink - Simple navigation link
 */
const NavLink = ({ href, children, className }) => (
  <Link
    to={href}
    className={cn(
      'px-3 py-2 rounded-lg',
      'text-sm font-medium text-gray-300',
      'hover:text-white transition-colors duration-200',
      className
    )}
  >
    {children}
  </Link>
);

/**
 * NavigationBar - Main navigation component for landing pages
 */
const NavigationBar = ({
  transparent = false,
  className,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Affiliate tracking
  const affiliateRef = searchParams.get('ref');
  const affiliateName = searchParams.get('name');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle CTA click
  const handleGetStarted = () => {
    if (affiliateRef) {
      navigate(`/signup?ref=${affiliateRef}`);
    } else {
      navigate('/signup');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-300',
          // Background styles
          transparent && !isScrolled
            ? 'bg-transparent'
            : 'bg-gradient-to-b from-gray-900/95 via-gray-900/80 to-black backdrop-blur-xl',
          // Border removed for seamless blend
          // Shadow
          isScrolled && 'shadow-2xl shadow-black/20',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <AxolopLogo className="w-10 h-10" />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-[#4A1515]/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">
                Axolop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <ProductDropdown />
              <PartnerDropdown />
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/5"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
              <Button
                className={cn(
                  'bg-gradient-to-br from-[#4A1515] to-[#3D1212]',
                  'hover:from-[#5C1E1E] hover:to-[#4A1515]',
                  'text-white font-medium',
                  'shadow-[0_0_25px_rgba(74,21,21,0.5)]',
                  'hover:shadow-[0_0_35px_rgba(74,21,21,0.6)]',
                  'border border-[#6A2424]/20 rounded-full'
                )}
                onClick={handleGetStarted}
              >
                {affiliateRef ? 'Try 30 days FREE' : 'Get Started Free'}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Affiliate Banner */}
        <AnimatePresence>
          {affiliateName && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515]"
            >
              <div className="max-w-7xl mx-auto px-4 py-2 text-center">
                <p className="text-sm text-white/90">
                  <span className="font-medium">{affiliateName}</span> wants you to try Axolop with{' '}
                  <span className="font-bold text-white">30 days FREE</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        affiliateRef={affiliateRef}
      />
    </>
  );
};

export default NavigationBar;
