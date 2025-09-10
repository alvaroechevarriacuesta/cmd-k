import React from 'react';
import type { SupportedModel } from '@merit-systems/echo-typescript-sdk';
import { Button } from '@/components/ui/button';

export const ContextInfo: React.FC<{model: SupportedModel}> = ({ model }) => {
    return (
        <div className="h-[40px] mt-2 rounded-md text-white flex items-center justify-start text-sm">
            <ProviderInfo {...model} />
        </div>
    )
}

const ProviderInfo: React.FC<SupportedModel> = ({ provider, model_id }) => {
    const getProviderIcon = () => {
        switch (provider.toLowerCase()) {
            case 'openai':
                return '/openai.png';
            case 'anthropic':
                return '/anthropic.png';
            case 'google':
                return '/google.png';
            default:
                return '/openrouter.png';
        }
    };

    const iconSrc = getProviderIcon();
    
    return (
        <Button variant="default" className="text-black px-3 py-1 rounded-md text-xs flex items-center gap-2 w-32 h-6 justify-start hover:bg-gray-200 hover:border-gray-200 ">
            <img 
                src={iconSrc} 
                alt={`${provider} icon`} 
                className="w-3 h-3 flex-shrink-0"
            />
            <span className="truncate">{model_id}</span>
        </Button>
    )
}