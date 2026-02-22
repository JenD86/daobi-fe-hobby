import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { BytesLike, verifyMessage } from "ethers/lib/utils";

interface Props {
  signOut: () => void;
  authToken: string;
}

const DiscordAuth = ({ signOut, authToken }: Props) => {
  const [promptedToSign, setPromptedToSign] = useState(false);
  const [sentVerification, setSentVerification] = useState(false);
  const { address } = useAccount();
  const uniqueMessage =
    `Signing this message verifies that you have completed linking your Discord account. \nAfter you sign this message, DAObi will approve your wallet address on the Voting contract, and your Discord account will be disconnected. \nNeither your address or Discord information will be saved by DAObi, but we still recommend clearing your cookies after verification is completed. \n` +
    JSON.stringify({
      address: address,
      authToken,
    });

  const {
    data: signedMessage,
    isSuccess: successfullySigned,
    signMessage,
    status,
  } = useSignMessage({
    message: uniqueMessage,
  });

  const [verificationStatus, setVerificationStatus] = useState<any>({
    loading: true,
    message: null,
    error: null,
  });

  useEffect(() => {
    // prompt user to sign message
    if (
      address &&
      status !== "loading" &&
      !sentVerification &&
      !promptedToSign
    ) {
      signMessage();
    }
    if (status === "loading") setPromptedToSign(true);
  }, [address, signMessage, status, sentVerification, promptedToSign]);

  useEffect(() => {
    const verifySignedMessage = (signature: BytesLike): boolean => {
      const resolvedAddress = verifyMessage(uniqueMessage, signature);
      return resolvedAddress === address;
    };

    const submitVerification = async () => {
      const res = await fetch(`/api/verify/${address}`, {
        method: "PUT",
        body: JSON.stringify(signedMessage),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (json?.message === "Verification Successful") {
        console.log("Successfully Verified");
        signOut();
      } else {
        console.log(`Error verifying...\n`, { ...json });
        setVerificationStatus({
          loading: false,
          message: json?.message,
          error: json?.error?.reason ?? json?.error,
        });
      }
    };
    if (
      // user signed message
      successfullySigned &&
      signedMessage &&
      !sentVerification
    ) {
      // client-side verifying of message
      const authorized = verifySignedMessage(signedMessage);
      if (authorized) {
        setSentVerification(true);
        // make call to api/verify/[address]
        submitVerification();
      }
    }
  }, [
    address,
    sentVerification,
    signOut,
    signedMessage,
    successfullySigned,
    uniqueMessage,
  ]);

  return (
    <>
      {!verificationStatus?.error && (
        <button
          className="p-2 text-black bg-green-200 rounded-lg animate-pulse dark:bg-green-800 dark:text-gray-100"
          onClick={() => signMessage()}
        >
          Sign Message To Complete Verification...
        </button>
      )}

      {verificationStatus?.error && (
        <p>
          {verificationStatus?.message ?? verificationStatus?.error}
          <br />
          Try again. If issue persists, check in Discord.
        </p>
      )}
    </>
  );
};

export default DiscordAuth;
