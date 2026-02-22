import Input from "./Input";
import { JsonFragment, JsonFragmentType } from "@ethersproject/abi";
import { isHexString, hexlify } from "@ethersproject/bytes";
import {
  formatBytes32String,
  parseBytes32String,
  toUtf8Bytes,
} from "@ethersproject/strings";
import {
  useAccount,
  useBlockNumber,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useProvider,
  useWaitForTransaction,
} from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { formatIODefaultValues } from "@/utils/index";
import { BytesLike, formatEther, parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { Toast } from "../TxToast";
import { DAObiContract3 } from "@/ethereum/abis/DAObiContract3";

interface ParentState {
  setToast: Dispatch<SetStateAction<Toast>>;
  stateHandler?: () => void;
}
export interface UserCallableFunction {
  functionName: string;
  stateMutability: string;
  inputs: Array<{
    json: JsonFragmentType;
    userFriendlyCopy: string;
  }>;
  outputs: readonly JsonFragmentType[];
  contractABI: JsonFragmentType[];
  contractAddress: string;
}

const formatInputData = (input: {
  name?: string;
  indexed?: boolean;
  type?: string;
  internalType?: any;
  components?: readonly JsonFragment[];
  value: any;
}) => {
  if (input.name === "amount") {
    try {
      return parseEther(Number(input.value).toFixed(2));
    } catch (error) {
      return BigNumber.from(0);
    }
  } else if (typeof input.value === "number") {
    try {
      return BigNumber.from(input.value.toString());
    } catch (error) {
      return BigNumber.from(0);
    }
  } else if (input.name === "_name") {
    // username
    try {
      return formatBytes32String(input.value);
    } catch (error) {
      // purposefully invalidate the tx with incorrect length bytes
      return hexlify(toUtf8Bytes("FAIL"));
    }
  } else {
    return input.value;
  }
};

const Function = ({
  functionName,
  stateMutability,
  inputs,
  outputs,
  contractABI,
  contractAddress,
  setToast,
  stateHandler,
}: UserCallableFunction & ParentState) => {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  // useState for all input values
  const [formData, setFormData] = useState(
    // .sol types -> .js types
    formatIODefaultValues(
      inputs.map((input) => input.json),
      address
    )
  );

  const [msgValue, setMsgValue] = useState(0); // for payable functions
  const [txWillError, setTxWillError] = useState(true); // block transactions until ethers can estimate gas
  const [formattedViewData, setFormattedViewData] = useState("");

  // FOR READ FUNCTIONS
  const {
    data: viewData,
    isSuccess: viewIsSuccess,
    isLoading: viewIsLoading,
    refetch: viewRefetch,
  } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: functionName,
    args:
      inputs?.length > 0
        ? formData?.map((input) => {
            return formatInputData(input);
          })
        : undefined,
  });

  // FOR WRITE FUNCTIONS
  const { config, refetch } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: functionName,
    args: formData?.map((input) => {
      return formatInputData(input);
    }),
    overrides: {
      value: parseEther(msgValue.toString()),
      gasLimit:
        functionName === "makeAccusation"
          ? (250000 as unknown as BigNumber)
          : null,
    },
    onSuccess() {
      switch (functionName) {
        case "register":
          // require filling out courtName to register
          let nameIsNull = true;
          formData.map((input) => {
            if (input.name === "_name") {
              if (input.value !== "") nameIsNull = false;
            }
          });

          setTxWillError(nameIsNull);
          break;

        case "mint":
          let amountIsInvalid: boolean;
          formData.map((input) => {
            if ((input.name = "amount")) {
              if (input.value < 0) {
                amountIsInvalid = true;
              } else {
                amountIsInvalid = false;
              }

              if (input.value.toString().includes(".")) {
                input.value = Number(input.value).toFixed(2);
              }
            }
          });

          setTxWillError(amountIsInvalid);
          break;

        default:
          setTxWillError(false);
          break;
      }
    },
    onError(error: any) {
      setTxWillError(true);
    },
  });
  const { config: approveConfig } = usePrepareContractWrite({
    address: "0x5988Bf243ADf1b42a2Ec2e9452D144A90b1FD9A9",
    abi: DAObiContract3,
    functionName: "approve",
    args: ["0x397d5ba2f608a6fe51ad11da0ea9c0ee09890d4e", parseEther("1000")],
  });

  const { data: approveData, write: writeApprove } =
    useContractWrite(approveConfig);

  const { data, write } = useContractWrite(config);
  const {
    data: tx,
    isLoading,
    isError,
    isSuccess,
  } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      if (stateHandler) {
        stateHandler();
      }
    },
  });

  // re-estimate when values change
  useEffect(() => {
    function refreshEstimates() {
      if (stateMutability === "view") {
        refetch();
      } else {
        viewRefetch();
      }
    }

    refreshEstimates();
  }, [formData, refetch, stateMutability, viewRefetch]);

  useEffect(() => {
    if (isLoading) {
      setToast({ status: "loading" });
    }
    if (isSuccess) {
      if (tx.status === 1) {
        setToast({ status: "success", hash: data?.hash });
      } else {
        setToast({ status: "error", hash: data?.hash });
      }
    }
    if (isError) {
      setToast({ status: "error", hash: data?.hash });
    }
  }, [isLoading, isError, isSuccess, setToast, tx?.status, data?.hash]);

  useEffect(() => {
    async function getAndSetFormattedData() {
      const formatViewData = async () => {
        switch (functionName) {
          case "chancellorSalary":
            return `${Math.floor(
              Number(formatEther(viewData as BigNumber))
            )} $DB`;

          case "salaryInterval":
            const seconds = (viewData as BigNumber).toNumber();
            if (seconds > 3600) return `${(seconds / 3600).toFixed(1)} hour(s)`;
            else return seconds + ` seconds`;

          case "lastSalaryClaim":
            const lastClaimTimestamp = (viewData as BigNumber).toNumber();
            const currentTimestamp = (
              await provider.getBlock(currentBlockNumber)
            )?.timestamp;

            const secondsSince = currentTimestamp - lastClaimTimestamp;

            if (secondsSince > 86400) {
              const days = (secondsSince / 86400).toFixed(0);

              return `Approximately ${days} day${
                Number(days) > 1 ? "s" : ""
              } ago`;
            } else if (secondsSince > 3600) {
              const hours = (secondsSince / 3600).toFixed(1);

              return `Approximately ${hours} hour${
                Number(hours) > 1 ? "s" : ""
              } ago`;
            } else return `Approximately ${secondsSince} seconds ago`;

          default:
            return typeof viewData !== "object"
              ? isHexString(viewData, 32)
                ? parseBytes32String(viewData as BytesLike)
                : viewData?.toString() ?? viewData
              : (viewData as BigNumber)?.toString();
        }
      };
      const formatted = await formatViewData();
      setFormattedViewData(formatted as string);
    }

    if (viewData) {
      getAndSetFormattedData();
    }
  }, [viewData, formattedViewData, functionName, provider, currentBlockNumber]);

  return (
    <>
      {inputs?.length > 0 && (
        <>
          <form
            className="px-6 space-y-4 w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            {inputs?.map((input, idx) => (
              <Input
                key={`${input.json.name}-${contractAddress}-${idx}`}
                input={input}
                value={formData[idx].value}
                idx={idx}
                formData={formData}
                setFormData={setFormData}
                isMsgValue={false}
              />
            ))}

            {/* field for payable function */}
            {/* {stateMutability === "payable" && (
              <Input
                key={`${msgValue}-${contractAddress}-${name}`}
                input={{
                  json: { name: "msgValue", type: "uint256" },
                  userFriendlyCopy: "MATIC",
                }}
                value={msgValue}
                idx={0}
                formData={msgValue}
                setFormData={setMsgValue}
                isMsgValue={true}
              />
            )} */}
          </form>
        </>
      )}
      <div className="flex flex-row justify-center items-center px-6 py-2 w-full">
        {stateMutability !== "view" ? (
          <button
            className={`py-2 px-4 mb-2 min-w-20 max-w-20 border h-min ${
              txWillError ? "border-error" : "border-ready"
            }`}
            onClick={async (e) => {
              e.preventDefault();
              functionName === "makeAccusation" ? writeApprove?.() : null;
              write?.();
            }}
            disabled={txWillError}
          >
            {functionName.includes("claim") || functionName.includes("Claim")
              ? "Claim"
              : "Submit"}
          </button>
        ) : (
          <div className="mx-auto w-full text-center">
            {viewIsLoading && <p>Loading...</p>}
            {viewIsSuccess && (
              <>
                <div className="overflow-x-auto mb-2 max-w-32 scrollbar">
                  {formattedViewData}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Function;
