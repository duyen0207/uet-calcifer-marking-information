const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    screenshotOnRunFailure: false,
    video: false,

    defaultCommandTimeout: 400,
    pageLoadTimeout: 10000,

    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      reportFilename: "report",
      overwrite: true,
      html: false,
      json: true,
    },
  },
});
