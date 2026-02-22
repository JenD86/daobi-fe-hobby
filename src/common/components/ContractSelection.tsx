import { DYNAMIC_DAOBI_CONTRACTS } from "@/ethereum/abis";
import Image from "next/image";
import { useState } from "react";
import Contract from "./Contract";
import FactionsTable from "./Layout/FactionsTable";
import { useAccount } from "wagmi";
import useRoles from "@/hooks/useRoles";

const ContractSelection = () => {
  const [activeTab, setActiveTab] = useState(1); // contract nav
  const { address } = useAccount();
  const { hasGrudge, accuser } = useRoles(address);
  return (
    <>
      <div className="w-full flex justify-center items-center px-2 pt-2 mx-auto h-16 md:px-4 md:h-auto md:border-b md:flex-row md:w-full md:max-w-7xl border-color-mode overflow-x-auto">
        {/* Tab Selection */}
        {DYNAMIC_DAOBI_CONTRACTS.map((contract, idx) => {
          return (
            <button
              key={contract.name + "button" + idx}
              onClick={() => setActiveTab(idx)}
              className={`sm:font-daobi border pb-2 md:border-0 px-4 box-content w-1/4 text-sm md:text-xl h-full ${
                activeTab === idx
                  ? "font-bold text-orange-600 md:!border-b-2 border-orange-600"
                  : "font-medium"
              }`}
            >
              {contract.heading}
            </button>
          );
        })}
        <button
          key="nftbutton"
          onClick={() => setActiveTab(3)}
          className={`sm:font-daobi border pb-2 md:border-0 px-4 box-content w-1/4 text-sm md:text-xl h-full ${
            activeTab === 3
              ? "font-bold text-orange-600 md:!border-b-2 border-orange-600"
              : "font-medium"
          }`}
        >
          The Hierarchy{" "}
        </button>
        <button
          key="factionsbutton"
          onClick={() => setActiveTab(4)}
          className={`sm:font-daobi border pb-2 md:border-0 px-4 box-content w-1/4 text-sm md:text-xl h-full ${
            activeTab === 4
              ? "font-bold text-orange-600 md:!border-b-2 border-orange-600"
              : "font-medium"
          }`}
        >
          The Imperial Secretariat
        </button>
      </div>
      {hasGrudge && (
        <div>
          <p className="text-center text-2xl font-bold my-6">
            You have a grudge against{" "}
            <a className="text-fuchsia-700">{accuser}</a>. They have accused you
            and are trying to banish you from the DAO. Refute the accusation
            immediately or face the consequences.
          </p>
        </div>
      )}
      {/* Function Grid */}
      {DYNAMIC_DAOBI_CONTRACTS.map((contract, idx) => {
        if (contract?.ABI) {
          return (
            <>
              {activeTab === idx && (
                <div
                  key={contract.name + "div" + idx}
                  className={`${activeTab === idx ? "" : "hidden"}`}
                >
                  <Contract key={contract.name + "div" + idx} {...contract} />
                </div>
              )}
            </>
          );
        }
      })}
      {activeTab === 3 && (
        <div
          key="nftdiv"
          className="flex flex-col mx-1 mt-2 space-y-2 min-h-screen md:mx-16 xl:mx-32 2xl:mx-64"
        >
          <FactionsTable />{" "}
        </div>
      )}
      {activeTab === 4 && (
        <div
          key="nftdiv"
          className="flex flex-col mx-1 mt-2 space-y-2 min-h-screen md:mx-16 xl:mx-32 2xl:mx-64"
        >
          <h2 className="text-2xl text-center">The Chancellor&apos;s Seal</h2>
          <div className="flex relative flex-1">
            <Image
              layout="fill"
              objectFit="contain"
              src="/Seal.png"
              alt="A clearly scuffed up Chancellor's Seal"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ContractSelection;
