const express = require("express");
// get the client
const mysql = require("mysql2");
const cron = require("node-cron");
let shell = require("shelljs");

const ejs = require("ejs");
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const cors = require("cors");

const { exportJSONFile } = require("./utils/handleFile");
const { readReport } = require("./utils/readReport");
const { AnalysisReportAndUpdateScore, getNotScoredSubmissions } = require("./utils/scoring");

// create the connection to database
// connect to database
const config = {
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "uet_calcifer",
};
const database = mysql.createPool(config);
const promiseDatabase = database.promise();

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

// routes-------------------------------------------------------
app.get("/", (req, res) => {
  res.send("<h3>Hello this is auto scoring system!</h3>");
});
// -------------------------------------------------------------------
// handle 404 not found
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// -----------------------------------------------------------------
cron.schedule("*/5 * * * * *", function () {
  console.log("Cron job==============================================");
  Scoring(promiseDatabase);
});

// get data function------------------------------------
async function Scoring(promiseDatabase) {
  const submissions = await getNotScoredSubmissions(promiseDatabase);
  if (submissions.length == 0) {
    console.log("All submissions is scored. Nothing to do!");
    return;
  }

  console.log("[1] Getting submissions not scored...");
  console.log("Number of submissions: ", submissions.length);

  console.log("[2] Export data to json file");
  exportJSONFile(submissions);

  console.log("[3] Cypress run");
  // shell.exec("npx cypress run --quiet --spec cypress/e2e/scoring/scoring.cy.js");
  shell.exec("yarn run cy:scoring");
  console.log("Cypress Done!!!");

  console.log("[4] Reading cypress json report...");
  let reports = readReport();

  console.log("Analysis results report...");
  await AnalysisReportAndUpdateScore(promiseDatabase, reports);
  console.log("\nScoring done!!! The End.");
}
