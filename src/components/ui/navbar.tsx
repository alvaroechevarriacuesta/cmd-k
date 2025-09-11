import { useEcho } from "@/hooks/useEcho";
import { cn } from "@/lib/utils";
import { CmdkLogo } from "./cmdk-logo";
import { EchoSignin } from "@/components/ui/echo-sign-in";

export function Navbar() {
  const { user, balance, isAuthenticated } = useEcho();

  console.log("balance", balance);
  console.log("user", user);

  return (
    <>
      {isAuthenticated && (
        <header className={cn("px-2 md:px-4 pt-2 flex flex-col gap-1", "pb-2")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CmdkLogo />
            </div>
            <h3 className="text-lg font-bold">{user?.name || user?.email}</h3>
            <div className="flex items-center gap-2">
              <EchoSignin />
            </div>
          </div>
        </header>
      )}
    </>
  );
}
