const { i18n } = require("./next-i18next.config");
const withTM = require("next-transpile-modules")(["js-combinatorics"]);

module.exports = withTM({
  i18n,
  future: {
    webpack5: true,
  },
  // https://github.com/vercel/next.js/issues/22813#issuecomment-810961712
  webpack: (config, { isServer, dev }) => {
    config.output.chunkFilename = isServer
      ? `${dev ? "[name]" : "[name].[fullhash]"}.js`
      : `static/chunks/${dev ? "[name]" : "[name].[fullhash]"}.js`;

    return config;
  },
});
