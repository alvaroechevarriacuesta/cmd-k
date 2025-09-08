import { EchoClient, type SupportedModel } from '@merit-systems/echo-typescript-sdk';
import { useEcho } from './useEcho';
import { useState, useEffect } from 'react';

export function useEchoModels() {
    const { echoClient } = useEcho();
    const [models, setModels] = useState<SupportedModel[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!echoClient) {
            return;
        }
        const getModels = async (echoClient: EchoClient) => {
            try {
            setLoading(true);
                const models = await echoClient.models.listSupportedChatModels();
                setModels(models);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        getModels(echoClient);

    }, [echoClient]);

    return { models, loading, error };
}