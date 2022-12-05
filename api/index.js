const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const cors = require("cors");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// connect to uet_calcifer database
const mysql = require("mysql");
const config = {
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "uet_calcifer",
};
const database = mysql.createPool(config);

// const postData = `INSERT submission_report (SubmissionId, ErrorTestcaseOrder, ErrorReport)
// VALUES ('${SubmissionId}', ${ErrorTestcaseOrder},'${ErrorReport}');`;

// routes-------------------------------------------------------
app.get("/", (req, res) => {
  res.send("<p>Hello, this is uet calcifer api</p>");
});

// load data
app.get("/data/filter", (req, res) => {
  database.getConnection(function (err, tempConnection) {
    if (err) res.send("Error occured.");

    const isMarked = req.query?.isMarked;
    const search = req.query?.search;

    // console.log("query string: ", isMarked, notEmpty(search));

    const dataQuery = `SELECT s.StudentId, a.FullName, p.ProblemTitle, e.ExerciseId, 
    pc.ClassId, s.SubmissionId, s.Iter, p.TestcaseScript, s.SubmittedLink, s.TestcaseResult, s.Score 
    FROM submission s 
    INNER JOIN account a ON s.StudentId = a.AccountId
    INNER JOIN exercise e ON s.ExerciseId = e.ExerciseId
    INNER JOIN problem p ON e.ProblemId = p.ProblemId
    INNER JOIN practice_class pc ON e.ClassId = pc.ClassId
    WHERE s.SubmittedLink IS NOT NULL 
    ${
      // chưa chấm?
      isMarked == 0
        ? "AND (s.Score ='' OR s.Score IS NULL) AND (s.TestcaseResult ='' OR s.TestcaseResult IS NULL)"
        : // đã chấm?
        isMarked == 1
        ? " AND (s.Score !='' AND s.Score IS NOT NULL) AND (s.TestcaseResult !='' AND s.TestcaseResult IS NOT NULL)"
        : // tất cả bài nộp
          " "
    }
    ${
      notEmpty(search)
        ? `AND s.StudentId LIKE '%${search}%' OR a.FullName LIKE '%${search}%'`
        : " "
    }
    ;`;

    database.query(dataQuery, function (err, result, fields) {
      if (err) throw err;
      const data = result;
      const output = {
        totalRecords: result.length,
        data: data,
      };

      res.json(output);
      tempConnection.release();
    });
  });
});
// load submission report
app.get("/data/submission-report", (req, res) => {
  database.getConnection(function (err, tempConnection) {
    if (err) res.send("Error occured.");

    const submissionId = req.query?.submissionId;

    if (notEmpty(submissionId)) {
      const dataQuery = `SELECT sr.ErrorTestcaseOrder, t.TestcaseDescript, sr.ErrorReport FROM submission_report sr 
    INNER JOIN submission s ON sr.SubmissionId = s.SubmissionId
    INNER JOIN exercise e ON s.ExerciseId = e.ExerciseId
    INNER JOIN problem p ON e.ProblemId = p.ProblemId
    INNER JOIN testcase t ON p.ProblemId = t.ProblemId
    WHERE sr.SubmissionId='${submissionId}';`;

      database.query(dataQuery, function (err, result, fields) {
        if (err) throw err;

        res.json(result);
        tempConnection.release();
      });
    } else res.json((message = "không tìm được"));
  });
});

// update score
var errors = [];
var updateSuccessCount = 0;
var insertSuccessCount = 0;

function pushMarkingData(data) {
  resetSuccessCount();
  return new Promise((resolve) => {
    for (let i = 0; i < data.length; i++) {
      // console.log("đang chạy đến: ", i);
      if (notEmpty(data[i].testcaseResult) && notEmpty(data[i].submissionId)) {
        const updateQuery = `UPDATE submission s
        SET
            TestcaseResult = ${data[i].testcaseResult},
            Score = ${data[i].score}
        WHERE SubmissionId = ${data[i].submissionId};`;

        database.query(updateQuery, function (err, result, fields) {
          if (err) {
            console.log(err.code);
            res.send("Error occured.", err);
            errors.push({
              submissionId: data[i].submissionId,
              error: `Update lỗi: ${err.code}`,
            });
          } else {
            updateSuccessCount += result?.affectedRows;
            console.log("update: ", updateSuccessCount, result?.message);
          }
          // ket thuc promise
          if (i == data.length - 1) {
            console.log("update resolve.");
            resolve(errors);
          }
        });
      } else {
        if (i == data.length - 1) {
          console.log("update resolve.");
          resolve(errors);
        }
      }
    }
  });
}

function pushSubmissionReportData(data) {
  insertSuccessCount = 0;
  return new Promise((resolve) => {
    for (let i = 0; i < data.length; i++) {
      const submissionReports = data[i]?.submissionReports;
      // nếu ko có test sai
      if (!submissionReports) {
        console.log("không có test case nào sai.");
        if (i == data.length - 1) resolve(errors);
      }
      // nếu có test sai
      else {
        for (let j = 0; j < submissionReports.length; j++) {
          const insertReportQuery = `INSERT submission_report
                (SubmissionId, ErrorTestcaseOrder, ErrorReport)
                VALUES ('${data[i].submissionId}', ${
            submissionReports[j].errorTestcaseOrder
          }, '${formatJSON(submissionReports[j].errorReport)}');`;

          database.query(insertReportQuery, function (err, result, fields) {
            if (err) {
              if (err.code == "ER_DUP_ENTRY") {
                errors.push({
                  submissionId: data[i].submissionId,
                  testcaseOrder: submissionReports[j].errorTestcaseOrder,
                  error:
                    "Dữ liệu đã tồn tại, không thể insert submission report.",
                });
                console.log("lỗi sai: ", j);
              }
            } else {
              insertSuccessCount += result?.affectedRows;
            }
            // kết thúc promise
            if (i == data.length - 1 && j == submissionReports.length - 1) {
              resolve(errors);
            }
          });
        }
      }
    }
  });
}

app.put("/data", (req, res) => {
  console.log("hello, this is marking: ");

  database.getConnection(function (err, tempConnection) {
    const data = req.body;

    if (err) {
      res.send("Error occured.", err);
    }

    pushMarkingData(data).then((results) => {
      pushSubmissionReportData(data).then((results) => {
        console.log("aaaaaaa: ");
        const output = {
          message: `Update marking success: ${updateSuccessCount}/${data.length} records, Insert submission reports success: ${insertSuccessCount} records`,
          errors: {
            totals: results.length,
            details: results,
          },
        };
        res.json(output);
        tempConnection.release();
        return results;
      });
    });
  });
});

// -------------------------------------------------------------------
// handle 404 not found
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// utils function -----------------------------
function notEmpty(data) {
  if (data) return data.length != 0 && data != "undefined" && data != "null";
  return false;
}

function resetSuccessCount() {
  updateSuccessCount = 0;
  insertSuccessCount = 0;
  errors = [];
}

// replace ' by ` in sql query variable
function formatJSON(data) {
  let res = data.replace(/'/g, "`");
  console.log(res);
}
