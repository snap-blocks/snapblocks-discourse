const discourseConfig = require("@discourse/lint-configs/eslint")
module.exports = [
    ...discourseConfig,
    {
        ignores: ["./assets/javascripts/lib/snapblocks/*"],
    }
]
