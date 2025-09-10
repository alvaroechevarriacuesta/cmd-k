import { useEcho } from "@/hooks/useEcho";
import { WelcomePage } from "@/pages/welcome";
import { ChatWindow } from "@/components/chat";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useEcho();
  return (
    <div className="flex-1 h-0 overflow-y-auto">
      {isAuthenticated ? <ChatWindow /> : <WelcomePage />}
    </div>
  );
};
