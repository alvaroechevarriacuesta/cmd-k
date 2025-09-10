import React from "react";
import type { SupportedModel } from "@merit-systems/echo-typescript-sdk";
import { Button } from "@/components/ui/button";
import { useEchoModels } from "@/hooks/useEchoModels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ContextInfo: React.FC<{ model: SupportedModel }> = ({ model }) => {
  return (
    <div className="h-[40px] mt-2 rounded-md text-white flex items-center justify-start text-sm">
      <ProviderInfo {...model} />
    </div>
  );
};

const ProviderInfo: React.FC<SupportedModel> = ({ provider, model_id }) => {
  const { models } = useEchoModels();
  const providers = ["openai", "anthropic", "google", "openrouter"];
  const model = models?.find(
    (m) => m.provider === provider && m.model_id === model_id,
  );
  console.log("model", model);
  console.log("providers", providers);
  const getProviderIcon = () => {
    switch (provider.toLowerCase()) {
      case "openai":
        return "/openai.png";
      case "anthropic":
        return "/anthropic.png";
      case "google":
        return "/google.png";
      default:
        return "/openrouter.png";
    }
  };

  const iconSrc = getProviderIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="text-black px-3 py-1 rounded-md text-xs flex items-center gap-2 w-32 h-6 justify-start hover:bg-gray-200 hover:border-gray-200 "
        >
          <img
            src={iconSrc}
            alt={`${provider} icon`}
            className="w-3 h-3 flex-shrink-0"
          />
          <span className="truncate">{model_id}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="bg-white">
        {providers.map((provider) => (
          <DropdownMenuItem key={provider}>
            <img
              src={(() => {
                switch (provider.toLowerCase()) {
                  case "openai":
                    return "/openai.png";
                  case "anthropic":
                    return "/anthropic.png";
                  case "google":
                    return "/google.png";
                  default:
                    return "/openrouter.png";
                }
              })()}
              alt={`${provider} icon`}
              className="w-3 h-3 flex-shrink-0"
            />
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
