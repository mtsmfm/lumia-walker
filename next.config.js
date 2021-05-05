const { i18n } = require("./next-i18next.config");
const withTM = require("next-transpile-modules")(["js-combinatorics"]);

module.exports = withTM({
  i18n,
  future: {
    webpack5: true,
  },
  webpack: (config, { isServer, dev }) => {
    // https://github.com/vercel/next.js/issues/22813#issuecomment-810961712
    config.output.chunkFilename = isServer
      ? `${dev ? "[name]" : "[name].[fullhash]"}.js`
      : `static/chunks/${dev ? "[name]" : "[name].[fullhash]"}.js`;

    // https://github.com/vercel/next.js/issues/19865#issuecomment-810738415
    config.output.hotUpdateMainFilename =
      "static/webpack/[fullhash].[runtime].hot-update.json";

    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
});
