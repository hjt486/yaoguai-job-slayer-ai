import { useState } from 'react';

export const LoadingButton = ({ 
  onClick, 
  children, 
  className = '', 
  timeout = 20000, // 10s default timeout
  loadingText = 'Processing...',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    setIsLoading(true);
    
    // Setup timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    try {
      // Race between the actual operation and timeout
      await Promise.race([onClick(e), timeoutPromise]);
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