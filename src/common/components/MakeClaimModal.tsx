import { useEffect, useState } from "react";
import { TOKEN_CONTRACT } from "@/ethereum/abis";
import Section from "./Contract/Section";
import { useAccount } from "wagmi";
import useRoles from "@/hooks/useRoles";

const MakeClaimModal = () => {
  const [claimed, setClaimed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { address } = useAccount();
  const { canClaimChancellor } = useRoles(address);

  const hideModal = () => {
    setClaimed(true);
    setShowClaimModal(false);
  };

  useEffect(() => {
    if (showClaimModal !== canClaimChancellor && !claimed) {
      setShowClaimModal(canClaimChancellor);
    }
  }, [canClaimChancellor, claimed, showClaimModal]);

  return (
    <>
      {showClaimModal && (
        <div className="flex fixed top-0 right-0 left-0 z-50 justify-center items-center w-full max-w-full h-full min-h-full bg-white bg-opacity-95 dark:bg-opacity-90 dark:bg-black">
          <div className="fixed m-auto w-2/3 h-1/2 bg-transparent">
            <div className="w-full h-min">
              <Section
                {...TOKEN_CONTRACT.userFriendlySections.makeClaim}
                contractABI={TOKEN_CONTRACT.ABI}
                contractAddress={TOKEN_CONTRACT.address}
                stateHandler={hideModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MakeClaimModal;
