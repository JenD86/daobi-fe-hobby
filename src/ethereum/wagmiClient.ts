import { createClient, configureChains } from "wagmi";
import { polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

export const DAOBI_CHAIN_ID = 137; // Polygon Mainnet

export const { chains, provider, webSocketProvider } = configureChains(
  [polygon],
  [publicProvider()]
);

export const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "DAObi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        // Get a free projectId at https://cloud.walletconnect.com
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        showQrModal: true,
        metadata: {
          name: "DAObi",
          description: "DAObi Han Dynasty Court Governance",
          url: "https://daobi.org",
          icons: ["https://daobi.org/favicon.ico"],
        },
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Other (Injected)",
        shimDisconnect: true,
      },
    }),
  ],
});
