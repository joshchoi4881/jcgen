import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta key="title" property="og:title" content="jcgen" />
        <meta
          key="description"
          property="og:description"
          content="generate images of me using ai"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
