import React from "react";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import useRoles from "@/hooks/useRoles";

type factionData = {
  [key: string]: string[];
};

function FactionsTable() {
  const { address } = useAccount();
  const {
    isChancellor,
    balanceDB,
    currentChancellor,
    userCourtName,
    rolesLoading,
  } = useRoles(address);
  const [factions, setFactions] = useState<factionData>({});

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/factions");
      const responseData = await response.json();

      const users: { [addr: string]: string[] } = {};
      users["0x0"] = ["0x0", "null", "0x0"];

      for (const event of responseData.result) {
        const topics = event.topics;

        // Skip if topics is missing or empty
        if (!topics || topics.length === 0) continue;

        if (
          topics[0] ===
          "0xa629d669aa8e26d0998c7d6a40ad225ddea112e0c54474a08ef6c039bd302476"
        ) {
          // Registered(address indexed regVoter, bytes32 nickname, address initVote)
          const fromAddr = topics[1];
          const name = Buffer.from(event.data.slice(2, 66), "hex")
            .toString("utf-8")
            .replace(/\0/g, "");
          const iniVote = "0x000000000000000000000000" + event.data.slice(-40);
          users[fromAddr] = [fromAddr, name, iniVote];
        } else if (
          topics[0] ===
          "0xce0c7a2a940807f7dc2ce7a615c2532e915e6c0ac9a08bc4ed9d515a710a53e2"
        ) {
          // Voted(...)
          const fromAddr = topics[1];
          if (users[fromAddr]) {
            users[fromAddr] = [fromAddr, users[fromAddr][1], topics[2]];
          }
        } else if (
          topics[0] ===
          "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"
        ) {
          // Approval / burn‑related?
          const fromAddr = topics[1];
          if (fromAddr in users) {
            delete users[fromAddr];
          }
        } else if (
          topics[0] ===
          "0xe2795580f31af61313dfda02eec54a3b17d06e395138a74e448cb4cb75d3d818"
        ) {
          // Recluse
          const fromAddr = topics[1];
          if (users[fromAddr]) {
            users[fromAddr] = [fromAddr, users[fromAddr][1], "0x0"];
          }
        } else if (
          topics[0] ===
          "0x0ce6b15623afb84538dc319bdb30ea0a2cd87994e4969451d2402323afc5b03e"
        ) {
          // Burnt (banished or self‑immolation)
          const fromAddr = topics[1];
          if (users[fromAddr]) {
            users[fromAddr] = ["null", "null", ""];
          }
        }
      }

      const factionsDict: {
        [factionName: string]: { votes: number; voters: string[] };
      } = {};

      for (const user of Object.values(users)) {
        const userName = user[1];
        const iniVoteAddr = user[2];
        const factionName =
          iniVoteAddr in users ? users[iniVoteAddr][1] : "null";

        if (userName === "null" || factionName === "null") {
          continue;
        }

        if (factionName in factionsDict) {
          factionsDict[factionName].votes += 1;
          factionsDict[factionName].voters.push(userName);
        } else {
          factionsDict[factionName] = { votes: 1, voters: [userName] };
        }
      }

      setFactions(
        Object.fromEntries(
          Object.entries(factionsDict).map(([name, data]) => [
            name,
            [String(data.votes), ...data.voters],
          ])
        )
      );
    }

    fetchData().catch((e) => console.error("Error fetching factions:", e));
  }, []);

  return (
    <>
      <div className="flex flex-col">
        <a
          href="https://info.daobi.org/court"
          className="no-underline mx-auto mt-6"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          <button
            className=" font-daobi
           bg-orange-500 text-white
          px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-amber-500 transition ease-in-out duration-300 hover:-translate-y-1 hover:scale-110"
          >
            Visit the court
          </button>
        </a>
      </div>
      <div className="flex overflow-x-scroll">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mx-auto card">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-transparent dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 font-daobi text-lg">
                Leader
              </th>
              <th scope="col" className="px-6 py-3 text-lg">
                #
              </th>
              <th scope="col" className="px-6 py-3 font-daobi text-lg">
                Supporters
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(factions).map((factionName) => {
              const [votes, ...voters] = factions[factionName] || [];
              return (
                <tr
                  key={factionName}
                  className="bg-white border-b dark:bg-black dark:border-gray-700 overflow-x-scroll "
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`${
                        factionName === currentChancellor.courtName
                          ? "from-amber-400  to-amber-600 text-white font-daobi"
                          : "from-gray-200 to-gray-400 text-black"
                      } card p-3 mx-1 bg-gradient-to-r `}
                    >
                      {factionName}
                    </span>
                  </td>
                  <td className="px-6 py-4">{votes}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voters.map((voter) => (
                      <span key={voter} className="card p-3 mx-1">
                        {voter}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default FactionsTable;
