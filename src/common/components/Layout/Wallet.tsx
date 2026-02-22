import { DAOBI_CHAIN_ID } from "@/ethereum/wagmiClient";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

const Wallet = (): JSX.Element => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, pendingChainId } = useSwitchNetwork({
    chainId: DAOBI_CHAIN_ID,
  });
  const [showDialog, setShowDialog] = useState(address ? true : false);

  // dark mode
  const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // close dialog/modal with escape
  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      setShowDialog(false);
    }
  };

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (darkMode) {
      window.document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      window.document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  useEffect(() => {
    if (
      isConnected &&
      chain?.id !== DAOBI_CHAIN_ID &&
      pendingChainId !== DAOBI_CHAIN_ID
    ) {
      switchNetwork?.();
    }
  }, [chain?.id, isConnected, pendingChainId, switchNetwork]);

  return (
    <div className="flex gap-4 justify-end items-center w-full">
      <button className="" onClick={() => toggleDarkMode()}>
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 cursor-pointer"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 cursor-pointer"
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isConnected ? (
        <div className="flex flex-col justify-center items-center">
          <button onClick={() => disconnect?.()}>Disconnect</button>
          {chain?.id !== DAOBI_CHAIN_ID && (
            <button
              onClick={() => switchNetwork?.()}
              className="text-red-500 whitespace-nowrap"
            >
              Switch Network
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowDialog(true)}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          Connect Wallet
        </button>
      )}
      {error && <div>{error?.message ?? "Failed to connect"}</div>}
      {showDialog && !address && (
        <div
          className="absolute top-0 right-0 bottom-0 left-0 z-50 w-full max-w-full h-screen bg-transparent"
          onClick={() => setShowDialog(false)}
        >
          <div className="flex justify-end mt-16 w-full">
            <div className="md:flex md:w-1/4 md:justify-start pt-18">
              <dialog
                className="grid relative grid-cols-2 grid-rows-2 gap-2 p-4 ml-0 w-80 h-44 rounded-lg border-2 border-color-mode"
                open={showDialog}
              >
                {connectors.map((connector) => {
                  return (
                    <button
                      className="p-2 text-xs border"
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => {
                        setShowDialog(false);
                        connect({ connector });
                      }}
                    >
                      {connector.name}
                      {!connector.ready && " (unsupported)"}
                      {isLoading &&
                        connector.id === pendingConnector?.id &&
                        " (connecting)"}
                    </button>
                  );
                })}
              </dialog>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
