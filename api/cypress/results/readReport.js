const { readJSONFile } = require("../../utils/handleFile");

function readReport() {
  let REPORT_DATA = readJSONFile("cypress/results/report.json");
  if (!REPORT_DATA) return;
  REPORT_DATA = JSON.stringify(REPORT_DATA);
  const ScoringReport = JSON.parse(REPORT_DATA).results[0];
  
  const SubmissionsResult = ScoringReport.suites;
  
  let reports = [];
  
  console.log("[4] Reading cypress json report...");
  for (const submission of SubmissionsResult) {
    console.log(submission.title);
    var result = [];
    var errorReport = [];

    getScoringResult(submission, result, errorReport);

    reports.push({
      SubmissionId: submission.title,
      TestcaseResult: result.join(""),
      errorReports: errorReport,
    });
  }
  return reports;
}

function getScoringResult(report, testCaseResults, errorReport) {
  if (report.tests.length == 0 && report.suites.length == 0) {
    console.log("No test no suite");
    return;
  }

  if (report.tests.length > 0) {
    for (const testCase of report.tests) {
      const state =
        testCase.state == "passed" ? 1 : testCase.state == "failed" ? 0 : -1;
      // console.log("\ttest: ", state, testCase.title);
      testCaseResults.push(state.toString());
      //   console.log("aaaaaaaaaaaaaa", testCaseResults);
      if (state === 0)
        errorReport.push({
          uuid: testCase.uuid,
          TestTitle: testCase.title,
          state: testCase.state,
          ErrorTestcaseOrder: testCaseResults.length,
          ErrorReport: testCase.err.message,
        });
    }
  }

  if (report.suites.length > 0) {
    // console.log("suit length: ", report.suites.length);
    for (const suite of report.suites) {
      // console.log("suit: ", suite.title);
      getScoringResult(suite, testCaseResults, errorReport);
    }
  }
}

module.exports = { readReport, getScoringResult };
