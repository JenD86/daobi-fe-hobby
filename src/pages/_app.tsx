import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { wagmiClient } from "@/ethereum/wagmiClient";
import PageLayout from "@/components/Layout/PageLayout";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = AppProps & {
  pageProps: {
    session: Session;
  };
};

const MyDApp = ({ Component, pageProps }: Props) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <SessionProvider session={pageProps.session}>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </SessionProvider>
    </WagmiConfig>
  );
};

export default MyDApp;
