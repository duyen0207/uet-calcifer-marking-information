const { readJSONFile } = require("./handleFile");

function readReport() {
  let REPORT_DATA = readJSONFile("cypress/results/report.json");
  if (!REPORT_DATA) return;
  REPORT_DATA = JSON.stringify(REPORT_DATA);
  const ScoringReport = JSON.parse(REPORT_DATA).results[0];

  if (ScoringReport == false) {
    return null;
  }

  const SubmissionsResult = ScoringReport.suites;

  let reports = [];

  for (const submission of SubmissionsResult) {
    var result = [];
    var errorReport = [];

    getTestcaseResult(submission, result, errorReport);

    reports.push({
      SubmissionId: submission.title,
      TestcaseResult: result.join(""),
      errorReports: errorReport,
    });

    // testing
    if (submission.title == "de84a9f2-c2be-11ed-b626-0a0027000005") {
      console.log("Sai ở đâyyyyyyy: ", result);
    }
  }
  console.log("Read report done. Number of submissions:", reports.length);
  return reports;
}

function getTestcaseResult(report, testCaseResults, errorReport) {
  if (report.tests.length == 0 && report.suites.length == 0) {
    console.log("No test no suite");
    return;
  }

  if (report.tests.length > 0) {
    for (const testCase of report.tests) {
      const state = testCase.state == "passed" ? 1 : 0;
      // console.log("\ttest: ", state, testCase.title);
      testCaseResults.push(state.toString());
      if (state === 0)
        errorReport.push({
          uuid: testCase.uuid,
          TestTitle: testCase.title,
          state: testCase.state,
          ErrorTestcaseOrder: testCaseResults.length,
          ErrorReport:
            testCase.err.message == null
              ? "Skipped: Can't run this test case. Check your submit to make sure your submitted link worked."
              : testCase.err.message,
        });
    }
  }

  if (report.suites.length > 0) {
    // console.log("suit length: ", report.suites.length);
    for (const suite of report.suites) {
      // console.log("suit: ", suite.title);
      getTestcaseResult(suite, testCaseResults, errorReport);
    }
  }
}

module.exports = { readReport };
