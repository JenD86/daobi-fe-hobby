import type { NextPage } from "next";
import { useAccount, useNetwork } from "wagmi";
import useRoles from "@/hooks/useRoles";
import { useEffect, useState } from "react";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import RegistrationForm from "@/components/RegistrationForm";
import { toTrimmedAddress } from "../utils";
import ContractSelection from "@/components/ContractSelection";
import MakeClaimModal from "@/components/MakeClaimModal";
import { DAOBI_CHAIN_ID } from "@/ethereum/wagmiClient";
import { VOTING_CONTRACT } from "@/ethereum/abis";
import Section from "@/components/Contract/Section";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const {
    hasVoteToken,
    isRegistered,
    isServing,
    isReclused,
    isImmolated,
    balanceDB,
    rolesLoading,
  } = useRoles(address);
  const { chain } = useNetwork();

  const isPolygon = chain?.id === DAOBI_CHAIN_ID;

  // next-auth twitter
  const { data: twitterSession, status: twitterStatus } = useSession();
  const [authToken, setAuthToken] = useState<null | string>();

  useEffect(() => {
    const getAuthToken = async () => {
      const csrfToken = await getCsrfToken();
      if (csrfToken) setAuthToken(csrfToken);
    };

    if (twitterStatus === "authenticated") {
      getAuthToken();
    }
  }, [twitterStatus]);

  return (
    <div className="flex flex-col w-full h-full grow">
      {isConnected && !isPolygon && (
        <div
          id="wrong-network"
          className="my-auto font-bold text-center text-red-500 break-words"
        >
          Your wallet is connected to the wrong network.
          <br />
          Please switch to Polygon before continuing.
        </div>
      )}
      {isPolygon && (!isRegistered || !isServing) && (
        <>
          <p
            id="connection"
            className={`my-auto font-bold text-center break-words ${
              isConnected && !rolesLoading ? "hidden" : ""
            }`}
          >
            {!isConnected && "Please Connect Your Wallet"}
            {address && rolesLoading && "Greetings! Loading your roles..."}
          </p>
          {!rolesLoading && address && (
            <RegistrationForm
              address={toTrimmedAddress(address)}
              hasVoteToken={hasVoteToken}
              isRegistered={isRegistered}
              isReclused={isReclused}
              isServing={isServing}
              isImmolated={isImmolated}
              balanceDB={balanceDB}
              authToken={authToken}
              twitterSession={twitterSession}
              signIn={signIn}
              signOut={signOut}
            />
          )}
        </>
      )}
      {isPolygon && isServing && (
        <>
          <MakeClaimModal />
          <ContractSelection />
        </>
      )}
      {isPolygon && isReclused && (
        <>
          <Section
            {...VOTING_CONTRACT.userFriendlySections.investigateRivals}
            contractABI={VOTING_CONTRACT.ABI}
            contractAddress={VOTING_CONTRACT.address}
          />
          <Section
            {...VOTING_CONTRACT.userFriendlySections.selfImmolation}
            contractABI={VOTING_CONTRACT.ABI}
            contractAddress={VOTING_CONTRACT.address}
          />
        </>
      )}
    </div>
  );
};

export default Home;
