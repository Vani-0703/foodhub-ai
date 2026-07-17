const LoadingSpinner = ({ fullScreen = false, size = "md" }) => {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-14 w-14" };
  const spinner = (
    <div
      className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}
    />
  );
  if (!fullScreen) return spinner;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
