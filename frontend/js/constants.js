// SERVER API------------------------------------------------------
const SERVER_URL = "http://localhost:3000";

const API = {
  getData: `${SERVER_URL}/data`,
  updateMarking: `${SERVER_URL}/data`,
};

const FILTER = {
  NOT_MARKED: "0",
  MARKED: "1",
  ALL: "2",
};
