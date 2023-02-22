/**
 * Scoring submissions
 * @param {Array} submissions Submissions of student
 * @param {*} database
 * @param {*} connection
 * @returns
 */
function ScoringSubmissions(submissions = [], database, connection) {
  let ScoredSubmissions = [];
  if (submissions.length == 0) {
    return;
  }
  return new Promise((resolve) => {
    const dataQuery = "CALL Proc_Submission_GetProblemTestCases(?)";
    console.log("Get Test Score...");
    for (let i = 0; i < submissions.length; i++) {
      // get tests suite
      database.query(
        dataQuery,
        submissions[i].SubmissionId,
        function (err, result, fields) {
          if (err) throw err;

          // Calculate score
          console.log("Submission", submissions[i].SubmissionId);
          submissions[i].Score = getScoreByTestResult(
            submissions[i].TestcaseResult,
            result[0]
          );
          // push score into submission
          ScoredSubmissions.push(submissions[i]);
          if (ScoredSubmissions.length === submissions.length) {
            console.log("length:", ScoredSubmissions.length);
            resolve(ScoredSubmissions);
          }
        }
      );
    }
  }).then((res) => {
    // console.log("Scored Successfully!", res);
    console.log("Scored Successfully!");
    // submit into database
    submitScoringData(res, database, connection);
  }).then(()=>{
    console.log("Release connection!");
    connection.release(error => error ? reject(error) : resolve());;
  });
}

//Pure function get score according to test result
function getScoreByTestResult(TestcaseResult = "", TestsSuite = []) {
  let score = 0;
  console.log("Calculate score with:", TestcaseResult);
  for (let i = 0; i < TestcaseResult.length; i++) {
    if (TestcaseResult.charAt(i) == 1) {
      console.log(
        "Plus: ",
        i,
        " because state is",
        TestcaseResult.charAt(i),
        "- Score of test",
        TestsSuite[i].TestOrder,
        "is",
        TestsSuite[i].Score
      );
      score += TestsSuite[i].Score;
    }
  }
  console.log("after scored: ", score);
  return score;
}

// save scored submission into database
function submitScoringData(submissions, database, connection) {
  console.log("[5] Submit data");

  const submissionSql = "CALL Proc_Submission_UpdateScoreResult(?,?,?)";
  const submissionReportSql = "CALL Proc_SubmissionReport_Insert(?,?,?)";
  for (const submission of submissions) {
    //   submit test result
    database.query(
      submissionSql,
      [submission.SubmissionId, submission.TestcaseResult, submission.Score],
      function (err, result, fields) {
        if (err) throw err;
        // console.log(result);
      }
    );

    //   submit error report
    for (const errorReport of submission.errorReports) {
      database.query(
        submissionReportSql,
        [
          submission.SubmissionId,
          errorReport.ErrorTestcaseOrder,
          errorReport.ErrorReport,
        ],
        function (err, result, fields) {
          if (err) throw err;
          // console.log(result);
        }
      );
    }
  }
}

module.exports = { ScoringSubmissions, getScoreByTestResult };
