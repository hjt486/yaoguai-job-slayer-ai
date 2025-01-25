import { useState } from 'react';

export const LoadingButton = ({ 
  onClick, 
  children, 
  className = '', 
  timeout = 20000,
  loadingText = 'Processing...',
  minLoadingTime = 1000, // Minimum loading time in milliseconds
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    try {
      await Promise.race([onClick(e), timeoutPromise]);
      
      // Add artificial delay if needed
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      {...props}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;