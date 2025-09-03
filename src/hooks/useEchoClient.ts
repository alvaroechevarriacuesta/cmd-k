import {
    EchoClient,
    OAuthTokenProvider,
} from '@merit-systems/echo-typescript-sdk';
import { useEffect, useState } from 'react';
import { useEcho } from './useEcho';

interface UseEchoClientOptions {
    apiUrl: string;
}

export function useEchoClient({ apiUrl }: UseEchoClientOptions)  {
    const { token } = useEcho();
    const [client, setClient] = useState<EchoClient | null>(null);

    useEffect(() => {
        if (!token) {
            setClient(null);
            return;
        }
        const tokenProvider = new OAuthTokenProvider({
            getTokenFn: () => Promise.resolve(token || null),
            refreshTokenFn: async (): Promise<string> => {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({ action: 'REFRESH_TOKEN' }, (response) => {
                        if (response.success && response.token) {
                            resolve(response.token);
                        } else {
                            reject(new Error('Failed to refresh token'));
                        }
                    });
                });
            },
            onRefreshErrorFn: (error) => {
                console.error('Error refreshing token:', error);
                setClient(null);
            }
        });

        const echoClient = new EchoClient({ 
            baseUrl: apiUrl,
            tokenProvider,
        });

        setClient(echoClient);

        return () => {
            setClient(null);
        };
        
    }, [token, apiUrl]);

    return client;
}