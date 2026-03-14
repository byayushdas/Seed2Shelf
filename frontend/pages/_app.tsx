import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { ChainProvider } from "@/hooks/useChain";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChainProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChainProvider>
  );
}
