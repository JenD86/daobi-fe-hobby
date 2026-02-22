import { Dispatch, SetStateAction, useEffect } from "react";

export interface Toast {
  status: "loading" | "error" | "success";
  hash?: string;
}

interface Props {
  toast: Toast;
  setToast: Dispatch<SetStateAction<Toast>>;
}

const TxToast = ({ toast, setToast }: Props) => {
  useEffect(() => {
    // hide success / error toast after 15 seconds
    const deleteToast = () => {
      setToast(null);
    };

    const interval = setInterval(() => {
      if (toast?.status === "error" || toast?.status === "success") {
        deleteToast();
      }
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [toast, setToast]);

  return (
    <>
      {/* tx status toast */}
      {toast && (
        <div className="flex fixed right-0 bottom-0 z-50 justify-end items-end mr-6 mb-4 w-fit h-fit">
          <div className="sticky bottom-0">
            <div
              className={
                "relative px-6 py-4 max-w-prose max-h-16 text-center rounded-lg " +
                `${
                  toast?.status === "loading"
                    ? "animate-bounce bg-yellow-300 dark:bg-yellow-600"
                    : toast?.status === "success"
                    ? "bg-green-200 dark:bg-green-800"
                    : // else isError
                      "bg-red-300 dark:bg-red-600"
                }`
              }
            >
              {/* {isLoading && ( */}
              {toast?.status === "loading" && (
                <p className="italic">Tx Pending...</p>
              )}
              {/* {isSuccess && ( */}
              {toast?.status === "success" && (
                <p className="font-bold">
                  Success!{" "}
                  {toast?.hash && (
                    <a href={`https://polygonscan.com/tx/${toast?.hash}`}>
                      View on Explorer.
                    </a>
                  )}
                </p>
              )}
              {/* {isSuccess && ( */}
              {toast?.status === "error" && (
                <p className="font-bold">
                  Tx Failed
                  {toast?.hash && (
                    <>
                      :{" "}
                      <a href={`https://polygonscan.com/tx/${toast?.hash}`}>
                        View on Explorer.
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TxToast;
