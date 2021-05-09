import React from "react";
import "../styles/globals.css";
import { appWithTranslation } from "next-i18next";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import GitHubForkRibbon from "react-github-fork-ribbon";

const MyApp = ({ Component, pageProps }) => {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Lumia Walker</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <GitHubForkRibbon
        href="//github.com/mtsmfm/lumia-walker"
        target="_blank"
        position="right"
      >
        Fork me on GitHub
      </GitHubForkRibbon>
      <Component {...pageProps} />
    </React.Fragment>
  );
};

export default appWithTranslation(MyApp);
