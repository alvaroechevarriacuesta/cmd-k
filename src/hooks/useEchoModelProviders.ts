import {
    createEchoAnthropic,
    createEchoGoogle,
    createEchoOpenAI,
  } from '@merit-systems/echo-typescript-sdk';
  import { useMemo } from 'react';
  import { useEcho } from './useEcho';
  
  export const useEchoModelProviders = () => {
    const { token } = useEcho();
  
    return useMemo(() => {
      const baseConfig = {
        appId: "3df07026-b25a-4797-93af-f35bdd3a7c86",
        baseRouterUrl: "https://echo.router.merit.systems",
      };
      const getToken = async () => token;
  
      return {
        openai: createEchoOpenAI(baseConfig, getToken),
        anthropic: createEchoAnthropic(baseConfig, getToken),
        google: createEchoGoogle(baseConfig, getToken),
      };
    }, [token]);
  };