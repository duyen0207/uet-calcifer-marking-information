// SERVER API------------------------------------------------------
const SERVER_URL = "http://localhost:3001";

const API = {
  getData: `${SERVER_URL}/data`,
  updateMarking: `${SERVER_URL}/data`,
};

const FILTER = {
  NOT_MARKED: "0",
  MARKED: "1",
  ALL: "2",
};

const REPORT_DATA = [
  {
    ErrorTestcaseOrder: 1,
    TestcaseDescript: "test 1",
    ErrorReport: "lỗi sai",
  },
  {
    ErrorTestcaseOrder: 4,
    TestcaseDescript: "test 4",
    ErrorReport: "lỗi saiiii",
  },
];
