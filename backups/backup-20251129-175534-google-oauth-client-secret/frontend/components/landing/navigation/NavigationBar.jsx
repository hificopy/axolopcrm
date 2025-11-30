import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductDropdown from "./ProductDropdown";
import PartnerDropdown from "./PartnerDropdown";
import MobileNav from "./MobileNav";

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
      "px-3 py-2 rounded-lg",
      "text-base font-medium text-gray-300",
      "hover:text-white transition-colors duration-200",
      className,
    )}
  >
    {children}
  </Link>
);

/**
 * NavigationBar - Main navigation component for landing pages
 */
const NavigationBar = ({ transparent = false, className }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Affiliate tracking
  const affiliateRef = searchParams.get("ref");
  const affiliateName = searchParams.get("name");

  // Handle mounting to prevent flash
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle CTA click
  const handleGetStarted = () => {
    if (affiliateRef) {
      navigate(`/signup?ref=${affiliateRef}`);
    } else {
      navigate("/signup");
    }
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: "#0F0510",
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "backdrop-blur-xl",
          "transition-all duration-300",
          isScrolled && "shadow-2xl shadow-black/40",
          className,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <AxolopLogo className="w-10 h-10" />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-[#E92C92]/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">
                Axolop
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-1 items-center justify-center space-x-2">
              <ProductDropdown />
              <PartnerDropdown />
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <button
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </button>
              <button
                onClick={handleGetStarted}
                className="relative group"
              >
                {/* Metallic Button Body */}
                <div
                  className="relative overflow-hidden px-6 py-2.5 rounded-full leading-none flex items-center transition transform group-hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #ff85c8 0%, #E92C92 30%, #c41e78 70%, #ff69b4 100%)',
                    boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.15), 0 6px 20px rgba(233,44,146,0.4), 0 2px 6px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Chrome Text */}
                  <span
                    className="relative z-10 text-xs font-black uppercase tracking-wider"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))',
                    }}
                  >
                    {affiliateRef ? "Try 30 days FREE" : "Get Started Free"}
                  </span>

                  {/* Top metallic shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
                  {/* Animated sheen */}
                  <div className="absolute top-0 -left-[100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out"></div>
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden ml-auto p-2 rounded-lg hover:bg-white/5 transition-colors"
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
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gradient-to-r from-[#E92C92] via-[#5B1046] to-[#E92C92]"
            >
              <div className="max-w-7xl mx-auto px-4 py-2 text-center">
                <p className="text-sm text-white/90">
                  <span className="font-medium">{affiliateName}</span> wants you
                  to try Axolop with{" "}
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
