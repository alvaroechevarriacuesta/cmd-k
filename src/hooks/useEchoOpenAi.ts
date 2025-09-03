
import { useState, useEffect, useRef } from 'react';
import { useEcho } from '@/hooks/useEcho';

// Type-only import to avoid runtime dependency
type OpenAI = import('openai').OpenAI;

interface UseEchoOpenAIOptions {
  baseURL?: string;
  enabled?: boolean; // Allow disabling the hook
}

interface UseEchoOpenAIResult {
  openai: OpenAI;
  isReady: boolean;
  error: string | null;
  isLoading: boolean;
}

export function useEchoOpenAI(
  options: UseEchoOpenAIOptions = {}
): UseEchoOpenAIResult {
  const { baseURL = 'https://echo.router.merit.systems', enabled = true } =
    options;

  const { getToken, isAuthenticated } = useEcho();
  
  const [openai, setOpenai] = useState<OpenAI | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use ref to track if we should abort the current load operation
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clean up any previous load operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!enabled || !isAuthenticated) {
      setOpenai(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadOpenAI = async () => {
      // Create new abort controller for this load operation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        // Get token using the getToken method
        const token = await getToken();
        
        // Check if we have a valid token
        if (!token) {
          setError('No authentication token available');
          setIsLoading(false);
          return;
        }

        // Check if operation was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Dynamic import to only load OpenAI when needed
        const { default: OpenAI } = await import('openai');

        // Check again after async import
        if (abortController.signal.aborted) {
          return;
        }

        const client = new OpenAI({
          apiKey: token,
          baseURL,
          dangerouslyAllowBrowser: true,
        });

        // Only set state if not aborted
        if (!abortController.signal.aborted) {
          setOpenai(client);
        }
      } catch (err) {
        // Only handle error if not aborted
        if (!abortController.signal.aborted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load OpenAI';

          // Check if it's a module not found error
          if (
            errorMessage.includes('Cannot resolve module') ||
            errorMessage.includes('Module not found') ||
            errorMessage.includes('openai')
          ) {
            setError(
              'OpenAI package not found. Please install it with: pnpm add openai'
            );
          } else {
            setError(`Failed to initialize OpenAI client: ${errorMessage}`);
          }

          console.error('Error loading OpenAI:', err);
          setOpenai(undefined);
        }
      } finally {
        // Only update loading state if not aborted
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadOpenAI();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getToken, isAuthenticated, baseURL, enabled]);

  return {
    openai: openai as OpenAI,
    isReady: openai !== undefined && !isLoading,
    error,
    isLoading,
  };
}
