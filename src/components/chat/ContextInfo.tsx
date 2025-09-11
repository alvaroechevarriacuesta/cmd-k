import React from "react";
import type { SupportedModel } from "@merit-systems/echo-typescript-sdk";
import { Button } from "@/components/ui/button";
import { useEchoModels } from "@/hooks/useEchoModels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface ContextInfoProps {
  model: SupportedModel;
  setProviderModel: (model: SupportedModel) => void;
}

export const ContextInfo: React.FC<ContextInfoProps> = ({
  model,
  setProviderModel,
}) => {
  return (
    <div className="h-[40px] mt-2 rounded-md text-white flex items-center justify-start text-sm">
      <ProviderInfo {...model} setProviderModel={setProviderModel} />
    </div>
  );
};

interface ProviderInfoProps extends SupportedModel {
  setProviderModel: (model: SupportedModel) => void;
}

const ProviderInfo: React.FC<ProviderInfoProps> = ({
  provider,
  model_id,
  setProviderModel,
}) => {
  const { models } = useEchoModels();
  const providers = ["openai", "anthropic", "gemini", "openrouter"];
  const getProviderIcon = () => {
    switch (provider.toLowerCase()) {
      case "openai":
        return "/openai.png";
      case "anthropic":
        return "/anthropic.png";
      case "gemini":
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
          <DropdownMenuSub key={provider}>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <img
                src={(() => {
                  switch (provider.toLowerCase()) {
                    case "openai":
                      return "/openai.png";
                    case "anthropic":
                      return "/anthropic.png";
                    case "gemini":
                      return "/google.png";
                    default:
                      return "/openrouter.png";
                  }
                })()}
                alt={`${provider} icon`}
                className="w-3 h-3 flex-shrink-0"
              />
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white min-w-[150px] max-h-[300px] overflow-y-auto z-50">
              {models
                ?.filter(
                  (m) => m.provider.toLowerCase() === provider.toLowerCase(),
                )
                .map((m) => (
                  <DropdownMenuItem
                    key={m.model_id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setProviderModel(m)}
                  >
                    {m.model_id}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
