import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  Rocket,
  Zap,
  Mail,
  Phone,
  Calendar,
  Users,
  Shield,
  Download,
  Archive,
  MessageSquare,
  CheckSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Gift,
  Sparkles,
  CalendarDays,
  BarChart3,
  Bot,
  Smartphone,
  Timer,
  Megaphone,
  Heart,
  Flame,
  Brain,
  Grid,
} from "lucide-react";
import {
  FEATURES,
  getFeaturesByVersion,
  getFeaturesByCategory,
  getFeaturesByWeek,
  getThisWeekFeatures,
  getNextWeekFeatures,
  getMarketingHighlights,
  getNextFeatureCountdown,
} from "@/config/features";

// Icon mapping for features
const getFeatureIcon = (featureId) => {
  const iconMap = {
    "communication.phone": Phone,
    "communication.dialer": Phone,
    "communication.outcomes": Target,
    "communication.notetaker": MessageSquare,
    "communication.email": Mail,
    "communication.templates": Mail,
    "communication.sendAs": Mail,
    "customization.aiKnowledge": Brain,
    "account.appearance": Sparkles,
    "account.twoFactor": Shield,
    "account.calendarSync": Calendar,
    "billing.usage": BarChart3,
    "userMenu.importData": Download,
    "userMenu.automations": Zap,
    "userMenu.trash": Archive,
    "userMenu.archive": Archive,
    "v12.teams": Users,
    "v12.mobile": Smartphone,
    "v12.analytics": BarChart3,
    "secondBrain.chat": Bot,
    "secondBrain.tasks": CheckSquare,
  };
  return iconMap[featureId] || Zap;
};

// Get status styling
const getFeatureStatus = (feature) => {
  const today = new Date();
  const releaseDate = new Date(feature.releaseDate);

  if (!feature.locked) {
    return {
      status: "released",
      label: "Released",
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    };
  }

  if (releaseDate <= today) {
    return {
      status: "ready",
      label: "Ready Now",
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    };
  }

  const daysUntil = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 7) {
    return {
      status: "soon",
      label: `${daysUntil} days`,
      color: "red",
      bgColor: "bg-[#E92C92]/10 dark:bg-[#E92C92]/30",
      textColor: "text-[#E92C92] dark:text-[#E92C92]",
      borderColor: "border-[#E92C92]/30 dark:border-[#E92C92]/50",
    };
  }

  return {
    status: "planned",
    label: "Planned",
    color: "pink",
    bgColor: "bg-[#E92C92]/10 dark:bg-[#E92C92]/20",
    textColor: "text-[#E92C92] dark:text-[#ff85c8]",
    borderColor: "border-[#E92C92]/30 dark:border-[#E92C92]/50",
  };
};

// Countdown Timer Component
const CountdownTimer = ({ nextFeature }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextFeature) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const release = new Date(nextFeature.releaseDate).getTime();
      const difference = release - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextFeature]);

  if (!nextFeature) return null;

  return (
    <div className="bg-gradient-to-r from-[#E92C92] to-[#C81E78] rounded-xl p-6 text-white shadow-[0_0_40px_rgba(233,44,146,0.6),_inset_0_1px_0_rgba(255,255,255,0.1)]">
      <div className="flex items-center gap-3 mb-4">
        <Timer className="h-6 w-6" />
        <h3 className="text-lg font-bold">Next Feature Drops In:</h3>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs opacity-80">Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs opacity-80">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs opacity-80">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs opacity-80">Seconds</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">{nextFeature.name}</span>
        <span className="text-sm opacity-80">- {nextFeature.tagline}</span>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, showWeek = false }) => {
  const Icon = getFeatureIcon(feature.id);
  const status = getFeatureStatus(feature);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/50 backdrop-blur-xl border ${status.borderColor} rounded-xl p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl ${status.bgColor} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`h-6 w-6 ${status.textColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-lg">{feature.name}</h3>
              {feature.tagline && (
                <p className="text-sm text-[#E92C92] font-medium mt-1">
                  {feature.tagline}
                </p>
              )}
            </div>
            {feature.marketingHighlight && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#E92C92] to-[#C81E78] rounded-full">
                <Star className="h-3 w-3 text-white fill-white" />
                <span className="text-xs text-white font-medium">
                  Highlight
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-400 mb-3 leading-relaxed">
            {feature.description}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${status.bgColor} ${status.textColor}`}
            >
              {status.label}
            </span>
            <span className="text-sm text-gray-500">{feature.category}</span>
            {showWeek && feature.weekNumber && (
              <span className="text-sm text-gray-500">
                Week {feature.weekNumber}
              </span>
            )}
            {feature.releaseDate && (
              <span className="text-sm text-gray-500">
                {new Date(feature.releaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Week Section Component
const WeekSection = ({ weekNumber, features, isExpanded, onToggle }) => {
  const weekDate = new Date(FEATURES.weeklyRollout.startDate);
  weekDate.setDate(weekDate.getDate() + (weekNumber - 1) * 7);

  const weekEndDate = new Date(weekDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const isThisWeek = () => {
    const today = new Date();
    return today >= weekDate && today <= weekEndDate;
  };

  const isPastWeek = () => {
    const today = new Date();
    return weekEndDate < today;
  };

  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${
          isThisWeek()
            ? "bg-gradient-to-r from-[#E92C92]/10 to-[#C81E78]/20 border-[#F472B6]/30 shadow-lg backdrop-blur-xl"
            : isPastWeek()
              ? "bg-gray-900/30 border-gray-700/50 backdrop-blur-xl"
              : "bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              isThisWeek()
                ? "bg-gradient-to-br from-[#E92C92] to-[#C81E78]"
                : isPastWeek()
                  ? "bg-green-900/30"
                  : "bg-[#E92C92]/20"
            }`}
          >
            {isPastWeek() ? (
              <Check className="h-6 w-6 text-green-400" />
            ) : isThisWeek() ? (
              <Flame className="h-6 w-6 text-white" />
            ) : (
              <CalendarDays className="h-6 w-6 text-[#E92C92]" />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Week {weekNumber}
              {isThisWeek() && (
                <span className="px-2 py-1 bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white text-xs font-bold rounded-full">
                  THIS WEEK
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-400">
              {weekDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekEndDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {features.length > 0 &&
                ` • ${features.length} feature${features.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {features.length > 0 && (
            <div className="flex items-center gap-1">
              {features.slice(0, 3).map((feature, idx) => {
                const Icon = getFeatureIcon(feature.id);
                return (
                  <div
                    key={idx}
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <Icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                );
              })}
              {features.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  +{features.length - 3}
                </span>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                showWeek={false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Roadmap() {
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [viewMode, setViewMode] = useState("weekly"); // 'weekly', 'version', 'category'
  const [nextFeature, setNextFeature] = useState(null);

  const featuresByWeek = getFeaturesByWeek();
  const featuresByVersion = getFeaturesByVersion();
  const featuresByCategory = getFeaturesByCategory();
  const thisWeekFeatures = getThisWeekFeatures();
  const nextWeekFeatures = getNextWeekFeatures();
  const marketingHighlights = getMarketingHighlights();

  useEffect(() => {
    setNextFeature(getNextFeatureCountdown());

    // Auto-expand this week and next week
    const expanded = {};
    Object.keys(featuresByWeek).forEach((week) => {
      const weekNum = parseInt(week);
      const weekDate = new Date(FEATURES.weeklyRollout.startDate);
      weekDate.setDate(weekDate.getDate() + (weekNum - 1) * 7);
      const weekEndDate = new Date(weekDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      const today = new Date();

      // Expand this week, next week, and past weeks with features
      if (
        (today >= weekDate && today <= weekEndDate) ||
        (today > weekEndDate && featuresByWeek[week].length > 0)
      ) {
        expanded[week] = true;
      }
    });
    setExpandedWeeks(expanded);
  }, []);

  const toggleWeek = (week) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  const sortedWeeks = Object.keys(featuresByWeek)
    .map((week) => parseInt(week))
    .sort((a, b) => a - b);

  return (
    <div className="relative min-h-screen bg-[#140516] text-white">
      {/* Background Effects - Matching Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E92C92]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E92C92]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-40 border-b border-gray-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E92C92] to-[#C81E78] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Axolop</span>
                <div className="text-xs text-[#E92C92] font-medium">
                  Roadmap
                </div>
              </div>
            </Link>
            <Link
              to="/signin"
              className="px-6 py-2.5 bg-gradient-to-br from-[#E92C92] to-[#C81E78] hover:from-[#5B1046] hover:to-[#E92C92] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(233,44,146,0.6),_inset_0_1px_0_rgba(255,255,255,0.1)] transform hover:scale-105 hover:shadow-[0_0_50px_rgba(233,44,146,0.7)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Matching Landing Page Style */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#E92C92] to-[#C81E78] rounded-2xl">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#E92C92]/20 to-[#C81E78]/20 rounded-full border border-[#F472B6]/30">
                <span className="text-[#E92C92] font-bold text-sm">
                  WEEKLY ROLLOUTS
                </span>
              </div>
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl"
              style={{
                opacity: 0,
                transform: "translateY(50px)",
              }}
            >
              <span className="block">One New Feature</span>
              <span className="block text-3xl md:text-4xl text-[#E92C92] mt-2">
                Every Single Week
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl text-gray-400 mb-8 max-w-4xl mx-auto font-normal"
              style={{
                opacity: 0,
                transform: "translateY(30px)",
              }}
            >
              We're shipping new features weekly to help agencies save
              $1,375/month by replacing 10+ tools with one unified platform. No
              more waiting for quarterly updates - innovation delivered every
              Monday.
            </p>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                <span className="text-sm font-medium text-gray-300">
                  Released
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E92C92] shadow-lg"></div>
                <span className="text-sm font-medium text-gray-300">
                  This Week
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E92C92] shadow-lg"></div>
                <span className="text-sm font-medium text-gray-300">
                  Planned
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Countdown Timer */}
      {nextFeature && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <CountdownTimer nextFeature={nextFeature} />
        </section>
      )}

      {/* This Week & Next Week Highlights */}
      {(thisWeekFeatures.length > 0 || nextWeekFeatures.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {thisWeekFeatures.length > 0 && (
              <div className="bg-gradient-to-br from-[#E92C92]/10 to-[#C81E78]/20 rounded-xl p-6 border border-[#F472B6]/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="h-6 w-6 text-[#E92C92]" />
                  <h3 className="text-xl font-bold text-white">
                    Dropping This Week
                  </h3>
                </div>
                <div className="space-y-3">
                  {thisWeekFeatures.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
                </div>
              </div>
            )}

            {nextWeekFeatures.length > 0 && (
              <div className="bg-gradient-to-br from-[#E92C92]/20 to-[#E92C92]/10 rounded-xl p-6 border border-[#E92C92]/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarDays className="h-6 w-6 text-[#E92C92]" />
                  <h3 className="text-xl font-bold text-white">
                    Coming Next Week
                  </h3>
                </div>
                <div className="space-y-3">
                  {nextWeekFeatures.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Feature Timeline</h2>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-gray-700/50">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === "weekly"
                  ? "bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CalendarDays className="h-4 w-4 inline mr-2" />
              Weekly
            </button>
            <button
              onClick={() => setViewMode("version")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === "version"
                  ? "bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              By Version
            </button>
            <button
              onClick={() => setViewMode("category")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === "category"
                  ? "bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid className="h-4 w-4 inline mr-2" />
              By Category
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {viewMode === "weekly" && (
          <div>
            {sortedWeeks.map((week) => (
              <WeekSection
                key={week}
                weekNumber={week}
                features={featuresByWeek[week] || []}
                isExpanded={expandedWeeks[week] ?? false}
                onToggle={() => toggleWeek(week)}
              />
            ))}
          </div>
        )}

        {viewMode === "version" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(featuresByVersion).map(([version, features]) => (
              <div key={version} className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    version === 'V1.0' ? 'bg-green-900/30' :
                    version === 'V1.1' ? 'bg-[#E92C92]/20' :
                    'bg-[#E92C92]/20'
                  }`}>
                    {version === 'V1.0' ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : version === 'V1.1' ? (
                      <Rocket className="h-5 w-5 text-[#E92C92]" />
                    ) : (
                      <Clock className="h-5 w-5 text-[#E92C92]" />
                    )}
                  </div>
                  {version}
                </h3>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "category" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(featuresByCategory).map(([category, features]) => (
              <div
                key={category}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#E92C92]" />
                  {category}
                </h3>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Marketing Highlights */}
      {marketingHighlights.length > 0 && (
        <section className="bg-gradient-to-br from-[#E92C92] to-[#C81E78] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Megaphone className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white">
                  Marketing Highlights
                </h2>
              </div>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                These game-changing features are getting the full marketing
                treatment. Watch for announcements, demos, and special events!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingHighlights.map((feature) => {
                const Icon = getFeatureIcon(feature.id);
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{feature.name}</h3>
                        <p className="text-white/80 text-sm">
                          {feature.tagline}
                        </p>
                      </div>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-white/70 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">
                        Week {feature.weekNumber}
                      </span>
                      <span className="text-white/60 text-xs">
                        {new Date(feature.releaseDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Gift className="h-8 w-8 text-[#E92C92] dark:text-[#E92C92]" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Ready to Transform Your Agency?
              </h2>
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of agencies using Axolop to streamline operations
              and save over $1,375/month. New features drop every week!
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-[#E92C92] to-[#C81E78] hover:from-[#5B1046] hover:to-[#E92C92] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(233,44,146,0.3)] hover:shadow-[0_0_30px_rgba(233,44,146,0.4)] text-lg"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-600 text-lg"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E92C92] to-[#C81E78] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold">Axolop CRM</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The New Age CRM with Local AI Second Brain. Helping agencies
                save $1,375/month by replacing 10+ tools with one unified
                platform.
              </p>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span className="text-gray-400 text-sm">
                  Built with love for agency owners
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/roadmap"
                    className="hover:text-white transition-colors"
                  >
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    to="/changelog"
                    className="hover:text-white transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Axolop CRM. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link
                to="/security"
                className="hover:text-white transition-colors"
              >
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
