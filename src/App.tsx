import "./App.css";
import { MainChat } from "@/components/chat";
import { EchoProvider } from "@/contexts/echo";
import { Navbar } from "@/components/ui/navbar";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <EchoProvider>
        <Navbar />
        <div className="flex-1 min-h-0 overflow-hidden">
          <MainChat />
        </div>
      </EchoProvider>
    </div>
  );
}

export default App;
