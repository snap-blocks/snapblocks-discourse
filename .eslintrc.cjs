const discourseConfig = require("@discourse/lint-configs/eslint")
module.exports = {
    ...discourseConfig,
    ignorePatterns: ["./assets/javascripts/lib/snapblocks/*"],
}
