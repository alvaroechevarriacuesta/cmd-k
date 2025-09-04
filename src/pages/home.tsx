import { useEcho } from "@/hooks/useEcho";
import { WelcomePage } from "@/pages/welcome";
import { Chat } from "@/pages/chat";

export const HomePage: React.FC = () => {
    const { isAuthenticated } = useEcho();
    return (
        <>
            {isAuthenticated ? <Chat /> : <WelcomePage />}
        </>
    )
}