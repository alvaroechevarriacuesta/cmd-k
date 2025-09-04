import { useEcho } from "@/hooks/useEcho";
import { WelcomePage } from "@/pages/welcome";
import { ChatWindow } from "@/components/chat";

export const HomePage: React.FC = () => {
    const { isAuthenticated } = useEcho();
    return (
        <>
            {isAuthenticated ? <ChatWindow /> : <WelcomePage />}
        </>
    )
}