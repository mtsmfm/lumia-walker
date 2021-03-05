import "../styles/globals.css";
import { appWithTranslation } from "next-i18next";

const MyApp = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default appWithTranslation(MyApp);
