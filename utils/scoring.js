// calculate score by test result string
function getScoreByTestResult(TestcaseResult = "", TestSuite = []) {
  let score = 0;
  console.log("Calculate score with:", TestcaseResult);
  for (let i = 0; i < TestSuite.length; i++) {
    if (TestcaseResult.charAt(i) == 1) {
      score += TestSuite[i].Score;
    }
  }
  return score;
}

/**
 * Analysis tests result to calculate score and Update All results of submissions into database
 * @param {*} promiseDatabase
 * @param {*} submissionsReport : list of submissions report
 * @returns
 */
async function AnalysisReportAndUpdateScore(
  promiseDatabase,
  submissionsReport
) {
  if (submissionsReport.length == 0) return;
  for (let submission_report of submissionsReport) {
    console.log("\nSubmission: ", submission_report.SubmissionId);
    // get tests score
    const TestSuite = await getTestSuiteBySubmissionId(
      promiseDatabase,
      submission_report.SubmissionId
    );
    if(submission_report.SubmissionId=='de84a9f2-c2be-11ed-b626-0a0027000005'){
      console.log("Sai ở đây: ", submission_report.TestcaseResult);
    }
    // calculate score
    const Score = getScoreByTestResult(
      submission_report.TestcaseResult,
      TestSuite
    );
    submission_report.Score = Score;
    console.log("After scored: ", submission_report.Score, "/10");

    // submit all result into database
    try {
      await submitScoreAndResult(promiseDatabase, submission_report);
      await submitErrorReportsOfSubmission(promiseDatabase, submission_report);
    } catch (error) {
      console.log("Database errors: ", error);
    }
  }
}

// DATABASE ----------------------------------------------------------------------------

/**
 * Get all submissions without score and test result
 * @param {*} promiseDatabase
 * @returns Submissions which not scored
 */
async function getNotScoredSubmissions(promiseDatabase) {
  const sql = "CALL Proc_Submission_GetNotScored";
  try {
    const [results, fields] = await promiseDatabase.query(sql);
    return results[0];
  } catch (error) {
    console.log("Error when get not scored submissions:", {
      code: error.code,
      sql: error.sql,
      message: error.sqlMessage,
    });
    return [];
  }
}

/**
 * Get test suite with standard score of a submission
 * @param {*} promiseDatabase
 * @param {*} submissionId
 * @returns
 */
async function getTestSuiteBySubmissionId(promiseDatabase, submissionId) {
  const sql = "CALL Proc_Submission_GetTestCasesById(?)";
  try {
    const [results, fields] = await promiseDatabase.query(sql, submissionId);
    return results[0];
  } catch (error) {
    console.log("Error when get tests of submission:", {
      code: error.code,
      sql: error.sql,
      message: error.sqlMessage,
    });
    return [];
  }
}

/**
 * Update score and test result into database
 * @param {*} promiseDatabase
 * @param {*} submissionResult
 */
async function submitScoreAndResult(promiseDatabase, submissionResult) {
  const sql = "CALL Proc_Submission_UpdateScoreResult(?,?,?)";

  try {
    const [results, fields] = await promiseDatabase.query(sql, [
      submissionResult.SubmissionId,
      submissionResult.TestcaseResult,
      submissionResult.Score,
    ]);
  } catch (error) {
    console.log("Error when get update score:", {
      code: error.code,
      sql: error.sql,
      message: error.sqlMessage,
    });
  }
}

/**
 * Submit all error report of test case which failed of a submission
 * @param {*} promiseDatabase
 * @param {*} submissionResult: results of a submission after scoring
 */
async function submitErrorReportsOfSubmission(
  promiseDatabase,
  submissionResult
) {
  const sql = "CALL Proc_SubmissionReport_Insert(?,?,?)";

  let insert_count = 0;
  let errors = {
    submission_id: submissionResult.SubmissionId,
    insert_errors: [],
  };

  for (const errorReport of submissionResult.errorReports) {
    try {
      const [results, fields] = await promiseDatabase.query(sql, [
        submissionResult.SubmissionId,
        errorReport.ErrorTestcaseOrder,
        errorReport.ErrorReport,
      ]);
      insert_count += results.affectedRows;
    } catch (error) {
      errors.insert_errors.push({
        err_code: error.code,
        message: error.sqlMessage,
      });
    }
  }
  if (insert_count > 0)
    console.log("Insert successfully:", insert_count, "records.");
  if (errors.insert_errors.length > 0) console.log("Insert Errors:", errors);
}

module.exports = { AnalysisReportAndUpdateScore, getNotScoredSubmissions };
