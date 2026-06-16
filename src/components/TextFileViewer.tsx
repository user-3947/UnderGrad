import { useState, useEffect, memo } from 'react';

interface TextFileViewerProps {
  fileUrl: string;
  className?: string;
}

/**
 * Component for displaying text file content with loading and error states
 */
const TextFileViewer: React.FC<TextFileViewerProps> = ({ fileUrl, className = '' }) => {
  const [state, setState] = useState<{
    content: string;
    isLoading: boolean;
    error: string | null;
  }>({
    content: '',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchTextContent = async () => {
      if (!fileUrl) return;
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await fetch(fileUrl);
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        
        if (isMounted) {
          setState({ content: text, isLoading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            content: '',
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load text file'
          });
        }
      }
    };

    fetchTextContent();
    
    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  const { content, isLoading, error } = state;

  if (isLoading) {
    return <div className="text-center py-4">Loading text content...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <pre className={`whitespace-pre-wrap font-mono text-sm ${className}`}>{content}</pre>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(TextFileViewer);