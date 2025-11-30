/**
 * Loading State Components
 * Provides consistent loading states across the application
 */

import { motion } from "framer-motion";

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="inline-flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 text-sm">Loading...</span>
      </div>
    </motion.div>
  </div>
);

export const CardLoader = () => (
  <div className="animate-pulse bg-gray-200 h-24 rounded-lg mb-4"></div>
);

export const TableLoader = ({ rows = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="animate-pulse bg-gray-200 h-12 rounded"></div>
    ))}
  </div>
);

export const ButtonLoader = ({ text = "Loading..." }) => (
  <div className="inline-flex items-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    <span className="text-gray-600 text-sm">{text}</span>
  </div>
);

export const SkeletonText = ({ width = "w-full", height = "h-4" }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

export const SkeletonAvatar = () => (
  <div className="flex items-center space-x-4">
    <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
    <div className="space-y-2">
      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
      <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
    </div>
  </div>
);

export const withLoadingState = (Component) => {
  return function WithLoadingState({ isLoading, ...props }) {
    if (isLoading) {
      return <FullPageLoader />;
    }
    return <Component {...props} />;
  };
};

export default {
  FullPageLoader,
  CardLoader,
  TableLoader,
  ButtonLoader,
  SkeletonText,
  SkeletonAvatar,
  withLoadingState,
};
