import { useEcho } from '@/hooks/useEcho';

import { WelcomePage } from '@/pages/welcome';
import { ChatWindow } from './ChatWindow';

export const MainChat: React.FC = () => {
  const { 
    isAuthenticated, 
  } = useEcho();

  return (
    <div className={`flex h-full w-full overflow-hidden ${!isAuthenticated ? 'items-center justify-center' : ''}`}>
      {isAuthenticated ? <ChatWindow /> : <WelcomePage />}
    </div>
  );
};

// Export individual chat components
export { ChatWindow } from './ChatWindow';
export { MessageList } from './MessageList';
export { ChatInput } from './ChatInput';
export type { Message } from './ChatWindow';

