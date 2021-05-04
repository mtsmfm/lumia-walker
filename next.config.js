const { i18n } = require("./next-i18next.config");
const withTM = require("next-transpile-modules")(["js-combinatorics"]);

module.exports = withTM({
  i18n,
  future: {
    webpack5: true,
  },
});
