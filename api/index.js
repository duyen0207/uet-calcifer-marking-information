const express = require("express");
const app = express();
const port = 3000;
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

    console.log("query string: ", isMarked, notEmpty(search));

    const dataQuery = `SELECT s.StudentId, a.FullName, p.ProblemTitle, e.ExerciseId, 
    pc.ClassId, s.SubmissionId, s.Iter, s.SubmittedLink, s.TestcaseResult, s.Score 
    FROM submission s 
    INNER JOIN account a ON s.StudentId = a.AccountId
    INNER JOIN exercise e ON s.ExerciseId = e.ExerciseId
    INNER JOIN problem p ON e.ProblemId = p.ProblemId
    INNER JOIN practice_class pc ON e.ClassId = pc.ClassId
    WHERE s.SubmittedLink IS NOT NULL 
    ${
      // chưa chấm?
      isMarked == 0
        ? "AND s.Score IS NULL AND s.TestcaseResult IS NULL "
        : // đã chấm?
        isMarked == 1
        ? " AND s.Score IS NOT NULL AND s.TestcaseResult IS NOT NULL "
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

// update data
app.put("/data", (req, res) => {
  console.log("hello, this is marking: ");
  database.getConnection(function (err, tempConnection) {
    const data = req.body;

    if (err) res.send("Error occured.");
    for (let i = 0; i < data.length; i++) {
      const updateQuery = `UPDATE submission s
      SET
          TestcaseResult = ${data[i].TestcaseResult},
          Score = ${data[i].Score}
      WHERE SubmissionId = ${data[i].SubmissionId};`;

      database.query(updateQuery, function (err, result, fields) {
        if (err) throw err;
        res.json({
          message: `Update success: ${data.length}`,
          data: data,
        });
        tempConnection.release();
      });
    }
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
