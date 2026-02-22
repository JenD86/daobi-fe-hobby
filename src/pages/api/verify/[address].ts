import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { auth } from "../../../auth";
import { getCsrfToken } from "next-auth/react";
import { VoteABIConst } from "../../../ethereum/abis/DAObiVoteContract";

/** Twitter Verification and Minting Workflow // Draft
 * ** Client-Side **                    ** Server-Side **
 * - new user connects wallet
 * - prompt user to connect Discord
 * - user approves our app
 * -->                                  - api/auth gets discord details
 *                                        - implement requirements/checks here,
 *                                          ex: follower count, account age,
 *                                          account used already for dif addr.
 *                                          Latter would req hosting a DB.
 *                                      - a new 'session' is created, JWT is
 *                                      - encoded & sent to client
 * - client is signed in to twitter   <--
 * - have user sign message of:
 *   {
 *      address,
 *      session JWT
 *   }
 * - verify signedMessage was signed
 *   by correct address
 * - call api/verify/[address]
 * -->                                  - verify JWT
 *                                      - mint Token to address
 * - sign out
 *  */

// eslint-disable-next-line import/no-anonymous-default-export
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message?: string; error?: Error | string }>
) {
  const {
    query: { address },
    body: signature,
    method,
  } = req;

  // SESSION CONTAINS IDENTIFY INFO
  // DO NOT LOG
  const session = await auth();
  const csrfToken = await getCsrfToken({ req });

  const uniqueMessage =
    `Signing this message verifies that you have completed linking your Discord account. \nAfter you sign this message, DAObi will approve your wallet address on the Voting contract, and your Discord account will be disconnected. \nNeither your address or Discord information will be saved by DAObi, but we still recommend clearing your cookies after verification is completed. \n` +
    JSON.stringify({
      address: address,
      authToken: csrfToken,
    });

  // server-side verification of message
  const resolvedAddress = ethers.utils.verifyMessage(uniqueMessage, signature);

  switch (method) {
    case "PUT":
      // check auth tokens (CSRF/Session) exists & user isn't trying to forge signatures
      if (!csrfToken || !session || resolvedAddress !== address) {
        console.log(
          `Unauthorized\naddress:${address}\nresolvedAddress:${resolvedAddress}`
        );
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (csrfToken && session) {
        // Signed in
        // try to mint NFT to user's address
        const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
          await getFees();
        try {
          const voteContractWrite = await initiateVoteContractWithSigner();
          const tx: ethers.ContractTransaction = await voteContractWrite.mint(
            address,
            { gasLimit: 275000, gasPrice }
            // { gasLimit: 275000, maxFeePerGas, maxPriorityFeePerGas }
          );

          const receipt = await tx.wait(2);

          if (receipt) {
            console.log(`Successfully registered address:${address}`);
            return res.status(200).json({
              message: "Verification Successful",
            });
          }
        } catch (error) {
          // if minting fails, tell user reason, and log to server
          console.log({ error });
          return res.status(500).json({
            message: "Internal Server Error while trying to mint.",
            error: {
              ...error,
              maxFeePerGas: maxFeePerGas.toNumber(),
              maxPriorityFeePerGas: maxPriorityFeePerGas.toNumber(),
              gasPrice: gasPrice.toNumber(),
            },
          });
        }
      }

      break;
    default:
      return res.status(400).json({
        message: "This API Route only accepts 'PUT' requests.",
        error: "Bad Request",
      });
  }
}

const getProvider = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-rpc.com"
  );
  await provider.ready;
  return provider;
};

const getFees = async () => {
  const provider = await getProvider();
  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
    await provider.getFeeData();

  // multiply current gas fees by 1.5x (3/2)
  return {
    maxFeePerGas: maxFeePerGas.mul(3).div(2),
    maxPriorityFeePerGas: maxPriorityFeePerGas.mul(3).div(2),
    gasPrice: gasPrice.mul(3).div(2),
  };
};

const initiateVoteContractWithSigner = async () => {
  const provider = await getProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
  const voteContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_VOTE_ADDR,
    VoteABIConst,
    signer
  );
  return voteContract;
};
