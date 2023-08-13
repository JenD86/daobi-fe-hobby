import { UserFriendlyMethod } from "@/ethereum/abis";
import { JsonFragment } from "@ethersproject/abi";
import { useState } from "react";
import TxToast, { Toast } from "../TxToast";
import Function, { UserCallableFunction } from "./Function";

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

  return (
    <>
      <TxToast toast={toast} setToast={setToast} />
      <div className="flex flex-col justify-between max-w-3xl card">
        <h3 className="p-4 mb-2 text-xl text-center whitespace-pre-line border-b border-color-mode">
          {title === "Refute The Accusation Made Against You" ? (
            <h1 className="text-red uppercase text-red-500 font-extrabold">
              {title}
            </h1>
          ) : (
            title
          )}
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
