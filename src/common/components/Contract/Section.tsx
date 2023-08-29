import { UserFriendlyMethod } from "@/ethereum/abis";
import { JsonFragment } from "@ethersproject/abi";
import { useState } from "react";
import TxToast, { Toast } from "../TxToast";
import Function, { UserCallableFunction } from "./Function";
import useRoles from "@/hooks/useRoles";
import { useAccount } from "wagmi";

interface Props {
  title: string;
  methods: Record<string, UserFriendlyMethod>;
  contractAddress: string;
  contractABI: JsonFragment[];
  stateHandler?: () => void;
}

const Section = ({
  title,
  methods,
  contractAddress,
  contractABI,
  stateHandler,
}: Props) => {
  const [toast, setToast] = useState<Toast | null>(null);
  // get functions from abi
  const allContractFunctions = contractABI.filter(
    (method) => method.type === "function" && method?.name
  );

  const userCallableFunctions: UserCallableFunction[] = [];

  // filter out user callable functions
  Object.entries(methods).forEach(([methodName, methodInputs]) => {
    let userFunc: UserCallableFunction | null = null;

    allContractFunctions.map(
      ({ name: abiName, inputs, outputs, stateMutability, ...func }) => {
        if (abiName === methodName) {
          userFunc = {} as UserCallableFunction;
          userFunc["functionName"] = abiName;
          userFunc["stateMutability"] = stateMutability;
          userFunc["outputs"] = outputs;
          userFunc["contractABI"] = contractABI;
          userFunc["contractAddress"] = contractAddress;
          userFunc["inputs"] = inputs.map((input) => {
            return {
              json: input,
              userFriendlyCopy: methodInputs[`${input.name}`],
            };
          });
        }
      }
    );

    if (userFunc !== null) {
      userCallableFunctions.push(userFunc);
    }
  });
  const { address } = useAccount();
  const { numSupporters, accusationTracker } = useRoles(address);

  function renderSwitch(title: string) {
    switch (title) {
      case "Refute The Accusation Made Against You":
        return (
          <h1 className="text-red uppercase text-red-500 font-extrabold">
            <h1 className="text-red uppercase text-red-500 font-extrabold">
              {title}
            </h1>{" "}
          </h1>
        );
      case "Banish a Courtier":
        return (
          <>
            <h1 className="text-red uppercase text-red-500 font-extrabold">
              {title}
            </h1>
            <div className="font-light">
              You have {numSupporters} out of minimum{" "}
              {process.env.NEXT_PUBLIC_MIN_SUPPORTERS || 4} needed for the
              banishment of {accusationTracker}.
            </div>
          </>
        );
      case "Make Accusation":
        return (
          <>
            {title}
            {accusationTracker !=
              "0x0000000000000000000000000000000000000000" &&
              accusationTracker && (
                <div className="text-sm font-normal">
                  You are currently accusing{" "}
                  <div className="inline text-orange-400">
                    {accusationTracker}
                  </div>{" "}
                  along with {numSupporters} other courtiers.
                </div>
              )}
          </>
        );
      default:
        return title;
    }
  }
  return (
    <>
      <TxToast toast={toast} setToast={setToast} />
      <div className="flex flex-col justify-between max-w-3xl card">
        <h3 className="p-4 mb-2 text-xl text-center whitespace-pre-line border-b border-color-mode">
          {renderSwitch(title)}
        </h3>
        {userCallableFunctions.map((userFunc) => {
          return (
            <Function
              key={userFunc.functionName}
              {...userFunc}
              stateHandler={stateHandler}
              setToast={setToast}
            />
          );
        })}
      </div>
    </>
  );
};

export default Section;
