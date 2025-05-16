import '../assets/style/global.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '../components/header';
import { Auth0Provider } from '@auth0/auth0-react';
import { SWRConfig } from 'swr';
import { ComponentLoadingProvider } from '@/contexts/loading-context';
import LoadingBar from '@/components/base/loading-bar';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
      }}
    >
      <SWRConfig
        value={{
          fetcher: (resource) => fetch(resource).then((res) => res.json()),
        }}
      >
        <ComponentLoadingProvider>
          <LoadingBar />
          <Head>
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
            <meta name='description' content='Clone and deploy your own Next.js portfolio in minutes.' />
            <title>My awesome blog</title>
          </Head>
          <Header />
          <main className='py-14'>
            <Component {...pageProps} />
          </main>
        </ComponentLoadingProvider>
      </SWRConfig>
    </Auth0Provider>
  );
}
