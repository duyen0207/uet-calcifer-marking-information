const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// connect to uet_calcifer database
const mysql = require("mysql");
const config = {
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "",
  password: "",
  database: "uet_calcifer",
};
const database = mysql.createPool(config);

// sql
const dataQuery = `SELECT s.StudentId, a.FullName, p.ProblemTitle, e.ExerciseId, 
pc.ClassId, s.SubmissionId, s.Iter, s.SubmittedLink, s.TestcaseResult, s.Score 
FROM submission s 
INNER JOIN account a ON s.StudentId = a.AccountId
INNER JOIN exercise e ON s.ExerciseId = e.ExerciseId
INNER JOIN problem p ON e.ProblemId = p.ProblemId
INNER JOIN practice_class pc ON e.ClassId = pc.ClassId
WHERE s.SubmittedLink IS NOT NULL AND s.Score IS NULL AND s.TestcaseResult IS NULL;`;

// routes
app.get("/data", (req, res) => {
  var data = [];

  database.getConnection(function (err, tempConnection) {
    if (err) res.send("Error occured.");
    database.query(dataQuery, function (err, result, fields) {
      if (err) throw err;
      data = result;
      const output = {
        totalRecords: result.length,
        data: data,
      };

      res.json(output);
      tempConnection.release();
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
