import { Session } from "next-auth";
import { useRouter } from "next/router";
import DiscordAuth from "./DiscordAuth";
import { VOTING_CONTRACT } from "@/ethereum/abis";
import Section from "./Contract/Section";

interface Props {
  address: string;
  hasVoteToken: boolean;
  isRegistered: boolean;
  isReclused: boolean;
  isServing: boolean;
  isImmolated: boolean;
  balanceDB: number;
  discordSession: Session;
  authToken: string;
  signIn: () => void;
  signOut: () => void;
}

const RegistrationForm = ({
  address,
  hasVoteToken,
  isRegistered,
  isReclused,
  isServing,
  isImmolated,
  balanceDB,
  discordSession,
  authToken,
  signIn,
  signOut,
}: Props) => {
  const router = useRouter();

  const reloadRouter = () => {
    router.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center pb-4 my-auto space-y-6 w-full h-full text-center">
      <h3>Hello {`${address}.`}</h3>
      {!hasVoteToken && (!isRegistered || isImmolated) && (
        <>
          <p className="max-w-prose break-normal w-fit">
            {!isRegistered &&
              !isImmolated &&
              "It looks like you have not yet completed registration."}
            {isImmolated &&
              "You have self-immolated and must re-register if you wish to come back to Court."}
            <br />
            To protect against bots, we require linking a Discord account. Your
            address and username are not stored, and your Discord will be
            disconnected afterwards.
          </p>
          {discordSession && authToken ? (
            <DiscordAuth signOut={signOut} authToken={authToken} />
          ) : (
            <>
              <p>Click the button below to verify your Discord.</p>
              <button
                className="p-2 text-black bg-green-200 rounded-lg dark:bg-green-800 dark:text-gray-100"
                onClick={() => signIn()}
              >
                Connect Discord
              </button>
            </>
          )}
        </>
      )}
      {!isServing && hasVoteToken && (
        <>
          {balanceDB === 0 ? (
            <p className="max-w-prose break-normal w-fit">
              You currently hold 0 $DB. Acquire some to prove your worth to a
              faction.
            </p>
          ) : (
            <>
              <p className="max-w-prose break-normal w-fit">
                {isReclused
                  ? "Welcome back to the Court. We knew we would see you again."
                  : "Discord verification completed. Time to register your username and cast your first vote!"}
              </p>
              <Section
                {...VOTING_CONTRACT.userFriendlySections.registration}
                contractABI={VOTING_CONTRACT.ABI}
                contractAddress={VOTING_CONTRACT.address}
                stateHandler={reloadRouter}
              />
            </>
          )}
        </>
      )}

      {hasVoteToken && isServing && !isReclused && (
        <p className="max-w-prose break-normal w-fit">
          Congrats! You have already finished connecting your Twitter and
          registering to vote!
        </p>
      )}
    </div>
  );
};

export default RegistrationForm;
