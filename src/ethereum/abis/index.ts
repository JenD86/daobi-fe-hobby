import { DAObiContract3 } from "./DAObiContract3";
import { DAObiChancellorsSeal } from "./DAObiChancellorsSeal";
import { DAObiVoteContract } from "./DAObiVoteContract";
import { JsonFragment } from "@ethersproject/abi";
import { DaobiAccountability } from "./DaobiAccountability";

export type UserFriendlyMethod = Record<string, string>;
export interface UserFriendlySection {
  title: string;
  methods: Record<string, UserFriendlyMethod>;
}

export interface DAOBI_CONTRACT {
  name: string;
  address: string;
  ABI: JsonFragment[];
  heading: string;
  userFriendlySections?: Record<string, UserFriendlySection>;
}

export const VOTING_CONTRACT: DAOBI_CONTRACT = {
  name: "Voting",
  address:
    process.env.NEXT_PUBLIC_VOTE_ADDR ??
    "0xe8A858B29311652F7e2170118FbEaD34d097e88A",
  ABI: DAObiVoteContract,
  heading: "The Inner Courtyard",
  userFriendlySections: {
    registration: {
      title: "Enter the Imperial Court",
      methods: {
        register: {
          _name: "Choose a Courtesy Name for yourself",
          _initialVote:
            "Please enter the address of the courtier whose faction you will be joining, or your address if you wish to start a faction of your own",
        },
      },
    },
    changeVote: {
      title: "Switch Factions",
      methods: {
        vote: {
          _voteFor:
            "To pledge allegiance to a new faction, please enter the address of their courtier here. Your name will then be entered on the rolls of their supporters, and removed from your previous faction's",
        },
      },
    },
    investigateRivals: {
      title: "Investigate Your Rivals",
      methods: {
        seeBallot: {
          _voter:
            "To find out which faction another courtier belongs to, enter their address here",
        },
        checkStatus: {
          _voter:
            "To find out whether a potential rival is currently present in the Imperial Court, \nenter their address here",
        },
        assessVotes: {
          _voter:
            "To learn how many acolytes a rival courtier has, enter their address here",
        },
        getAlias: {
          _voter:
            "To find out which courtier owns a particular address, enter it here",
        },
      },
    },
    refreshURI: {
      title: "Refresh Token URI",
      methods: {
        refreshTokenURI: {},
      },
    },
    abandon: {
      title:
        "Abandon your faction and withdraw (your vote) into reclusion on your country estates.",
      methods: {
        recluse: {},
      },
    },
    selfImmolation: {
      title:
        "Self-immolation; the last recourse when all other forms of protest have failed. If you come back, initiation must be completed again. Click here to ceremonially burn your voting token.",
      methods: {
        selfImmolate: {},
      },
    },
  },
};

export const NFT_CONTRACT: DAOBI_CONTRACT = {
  name: "NFT",
  address:
    process.env.NEXT_PUBLIC_SEAL_ADDR ??
    "0xE024B49eF502392E0eE64EC0323FF6aE7b463623",
  ABI: DAObiChancellorsSeal,
  heading: "The Imperial Secretariat",
};

export const TOKEN_CONTRACT: DAOBI_CONTRACT = {
  name: "Token",
  address:
    process.env.NEXT_PUBLIC_TOKEN_ADDR ??
    "0x5988Bf243ADf1b42a2Ec2e9452D144A90b1FD9A9",
  ABI: DAObiContract3,
  heading: "The Chancellery",
  userFriendlySections: {
    claimChancellorSalary: {
      title: "Claim the daily Chancellor's Salary here.",
      methods: {
        claimChancellorSalary: {},
      },
    },
    mint: {
      title: "Introduce additional currency into circulation.",
      methods: {
        mint: {
          amount:
            "Number of coins to mint \n(these will automatically be transferred to Uniswap on your behalf)",
        },
      },
    },
    makeClaim: {
      title: `You've gained enough favor in the court. \nTime has come to claim your rightful title as Chancellor.`,
      methods: {
        makeClaim: {},
      },
    },
    chancellorSalary: {
      title: `Chancellor’s emoluments:`,
      methods: {
        chancellorSalary: {},
      },
    },
    salaryInterval: {
      title: "Time between stipend payments:",
      methods: {
        salaryInterval: {},
      },
    },
    lastSalaryClaim: {
      title: "Time since last stipend payment was claimed:",
      methods: {
        lastSalaryClaim: {},
      },
    },
    // recoverSeal: {
    //   title: "",
    //   methods: {
    //     recoverSeal: {},
    //   },
    // },
  },
};

export const ACCOUNTABILITY_CONTRACT: DAOBI_CONTRACT = {
  name: "Accountability",
  address:
    process.env.NEXT_PUBLIC_BANISHMENT_ADDR ??
    "0x397D5bA2F608A6FE51aD11DA0eA9c0eE09890D4e",
  ABI: DaobiAccountability as unknown as DAOBI_CONTRACT["ABI"],
  heading: "Accountability",
  userFriendlySections: {
    refuteAccusation: {
      title: "Refute The Accusation Made Against You",
      methods: {
        refuteAccusation: {},
      },
    },
    makeAccusation: {
      title: "Make Accusation",
      methods: {
        makeAccusation: {
          _target:
            "Enter the address of the courtier you wish to accuse. This might lead to their banishment from the Imperial Court, and the confiscation of their voting token.",
        },
      },
    },
    banish: {
      title: "Banish a Courtier",
      methods: {
        banish: {
          _target:
            "If you have gathered enough supporters you can banish your target. This will lead to the confiscation of your target's voting token and in turn you will receive an NFT commemorating the banishment event.",
        },
      },
    },
    selfResetAccusationTracker: {
      title: "Reset Your Accusation Tracker",
      methods: {
        selfResetAccusationTracker: {},
      },
    },
  },
};
export const DYNAMIC_DAOBI_CONTRACTS: DAOBI_CONTRACT[] = [
  TOKEN_CONTRACT,
  VOTING_CONTRACT,
  ACCOUNTABILITY_CONTRACT,
];
