import { Lock, CalendarDays, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getFeatureDetails,
  getFeatureVersion,
  isFeatureLocked,
  getNextFeatureCountdown,
} from "@/config/features";

/**
 * LockedTooltip - A tooltip that shows when a feature is locked
 * Used for hover tooltips on locked navigation items
 * Positioned above the element to avoid being cut off by adjacent elements
 */
export const LockedTooltip = ({ category, feature, className = "" }) => {
  const details = getFeatureDetails(category, feature);
  const version = getFeatureVersion(category, feature);

  // Calculate days until release if we have a release date
  let daysUntil = null;
  let releaseText = "";

  if (details?.releaseDate) {
    const today = new Date();
    const releaseDate = new Date(details.releaseDate);
    daysUntil = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 0) {
      releaseText = "Coming very soon!";
    } else if (daysUntil <= 7) {
      releaseText = `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
    } else if (daysUntil <= 30) {
      const weeks = Math.ceil(daysUntil / 7);
      releaseText = `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else {
      releaseText = `Week ${details.weekNumber || "TBD"}`;
    }
  } else {
    releaseText = version || "a future update";
  }

  return (
    <div
      className={`absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] ${className}`}
    >
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          {daysUntil !== null && daysUntil <= 7 && (
            <Clock className="h-3 w-3 text-gray-300" />
          )}
          <span className="font-medium">{releaseText}</span>
        </div>
        {details?.tagline && (
          <div className="text-gray-300 text-xs mb-1 italic">
            "{details.tagline}"
          </div>
        )}
        <Link
          to="/roadmap"
          className="text-gray-300 hover:text-white pointer-events-auto underline inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarDays className="h-3 w-3" />
          View roadmap
        </Link>
        {/* Arrow pointing down */}
        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

/**
 * LockedNavItem - A navigation item that is locked/disabled
 * Used in settings sidebars and navigation menus
 */
export const LockedNavItem = ({
  category,
  feature,
  icon: Icon,
  children,
  className = "",
}) => {
  const details = getFeatureDetails(category, feature);
  const name = details?.name || children;

  return (
    <div className={`relative group overflow-visible ${className}`}>
      <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="text-gray-400">{name}</span>
        <Lock className="h-3 w-3 ml-auto text-gray-400" />
      </div>
      <LockedTooltip category={category} feature={feature} />
    </div>
  );
};

/**
 * LockedMenuItem - A dropdown menu item that is locked
 * Used in dropdown menus like user profile menu
 */
export const LockedMenuItem = ({
  category,
  feature,
  icon: Icon,
  children,
  className = "",
}) => {
  const details = getFeatureDetails(category, feature);
  const name = details?.name || children;

  return (
    <div className={`relative group overflow-visible ${className}`}>
      <div className="flex items-center px-4 py-2.5 cursor-not-allowed opacity-50">
        {Icon && <Icon className="h-4 w-4 mr-3 text-gray-400" />}
        <span className="text-gray-400">{name}</span>
        <Lock className="h-3 w-3 ml-auto text-gray-400" />
      </div>
      <LockedTooltip category={category} feature={feature} />
    </div>
  );
};

/**
 * LockedOverlay - A full overlay for locked features/pages
 * Used when an entire section is locked
 */
export const LockedOverlay = ({
  category,
  feature,
  title,
  description,
  className = "",
}) => {
  const details = getFeatureDetails(category, feature);
  const version = details?.version || "a future update";
  const displayTitle = title || details?.name || "Feature Locked";
  const displayDesc =
    description ||
    details?.description ||
    "This feature is currently under development.";

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-full p-6 mb-4">
        <Lock className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-crm-text-primary mb-2">
        {displayTitle}
      </h2>
      <p className="text-crm-text-secondary text-center max-w-md mb-6">
        {displayDesc}
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md">
        <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
          <span className="font-semibold">Coming in {version}:</span> This
          feature will be available soon!
          <Link
            to="/roadmap"
            className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            View our roadmap
          </Link>
        </p>
      </div>
    </div>
  );
};

/**
 * LockedBadge - A small badge indicating a feature is locked
 * Used next to feature names in lists
 */
export const LockedBadge = ({ version, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded ${className}`}
    >
      <Lock className="h-3 w-3" />
      {version || "Coming Soon"}
    </span>
  );
};

/**
 * LockedButton - A disabled button for locked features
 */
export const LockedButton = ({
  category,
  feature,
  children,
  className = "",
}) => {
  const version = getFeatureVersion(category, feature);

  return (
    <div className="relative group inline-block overflow-visible">
      <button
        disabled
        className={`px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg cursor-not-allowed flex items-center gap-2 ${className}`}
      >
        <Lock className="h-4 w-4" />
        {children}
      </button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
          Coming in {version || "a future update"}
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
};

/**
 * LockedCard - A card component for locked features
 * Used in settings pages to show upcoming features
 */
export const LockedCard = ({
  category,
  feature,
  icon: Icon,
  className = "",
}) => {
  const details = getFeatureDetails(category, feature);

  if (!details) return null;

  return (
    <div
      className={`relative p-4 bg-gray-50 dark:bg-gray-800/30 border border-crm-border rounded-lg opacity-75 ${className}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-crm-text-primary">
              {details.name}
            </h3>
            <LockedBadge version={details.version} />
          </div>
          <p className="text-sm text-crm-text-secondary mt-1">
            {details.description}
          </p>
        </div>
        <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
};

/**
 * Helper hook to check if feature is locked
 */
export const useFeatureLock = (category, feature) => {
  const locked = isFeatureLocked(category, feature);
  const details = getFeatureDetails(category, feature);
  const version = getFeatureVersion(category, feature);

  return {
    locked,
    details,
    version,
  };
};

export default {
  LockedTooltip,
  LockedNavItem,
  LockedMenuItem,
  LockedOverlay,
  LockedBadge,
  LockedButton,
  LockedCard,
  useFeatureLock,
};
