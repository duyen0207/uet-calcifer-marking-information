const express = require("express");
const cron = require("node-cron");
let shell = require("shelljs");

const ejs = require("ejs");
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const cors = require("cors");
const mysql = require("mysql");

const { notEmpty, resetSuccessCount, formatJSON } = require("./utils/utils");
const { exportJSONFile } = require("./utils/handleFile");
const { readReport } = require("./cypress/results/readReport");
const { getScoreByTestResult, ScoringSubmissions } = require("./utils/scoring");

const app = express();
const port = 3001;

// for parsing multipart/form-data
const upload = multer();
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// connect to database
const config = {
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "uet_calcifer",
};
const database = mysql.createPool(config);

getNotScoredSubmissions(database);

// cron.schedule("*/5 * * * * *", async function () {
//   console.log("Cron job");
//   getNotScoredSubmissions(database);
//   // console.log("this is data: ", getNotScoredSubmissions(database));
//   // if (shell.exec("node cronJob/cronTest.js").code !== 0) {
//   //   console.log("Some thing went wrong!");
//   // }
// });

// routes-------------------------------------------------------
app.get("/", (req, res) => {
  ejs.renderFile("views/ssr.ejs", {}, {}, function (err, template) {
    if (err) {
      throw err;
    } else {
      res.end(template);
    }
  });
});

// load data
app.get("/data/filter", (req, res) => {
  database.getConnection(function (err, tempConnection) {
    if (err) res.send("Error occured.");

    const isMarked = req.query?.isMarked;
    const search = req.query?.search;

    const sql = "CALL Proc_Submission_GetNotScoredAndSearch(?)";

    database.query(sql, search, function (err, result, fields) {
      if (err) throw err;
      const data = result;
      const output = {
        totalRecords: result.length,
        data: data[0],
      };

      // console.log("data ", data[0]);
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
      const dataQuery = "CALL Proc_SubmissionReport_GetOf(?)";

      database.query(dataQuery, submissionId, function (err, result, fields) {
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
        const updateQuery = "CALL Proc_Submission_UpdateScoreResult(?,?,?)";

        database.query(
          updateQuery,
          data[i].testcaseResult,
          data[i].score,
          data[i].submissionId,
          function (err, result, fields) {
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
          }
        );
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

// get data function------------------------------------
function getNotScoredSubmissions(database) {
  database.getConnection(function (err, tempConnection) {
    if (err) console.log("Error is: ", err);

    const sql = "CALL Proc_Submission_GetNotScored";

    console.log("[1] Getting submissions not scored...");
    database.query(sql, function (err, result, fields) {
      if (err) throw err;
      const data = result[0];
      const output = {
        totalRecords: result.length,
        data: data,
      };

      exportJSONFile(data);

      // cypress run
      shell.exec("yarn cy:scoring");
      console.log("Doneeee!");

      let reports = readReport();
      ScoringSubmissions(reports, database, tempConnection);
    });
  });
}
