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

module.exports = { notEmpty, resetSuccessCount, formatJSON };
