const fs = require("fs");

// write JSON string to a file
function exportJSONFile(data, fileName = "submissions.json") {
  // convert JSON object to a string
  const jsonData = JSON.stringify(data, null, 2);

  try {
    console.log("[2] Export data to json file");
    fs.writeFileSync(fileName, jsonData);
    console.log("JSON data is saved.");
  } catch (error) {
    console.log("Error!!: Export file failed with code: ", error.code);
  }
}

function readJSONFile(filePath) {
  try {
    var data = JSON.parse(fs.readFileSync(path=filePath));
    console.log("Read json file done.");
    return data;
  } catch (error) {
    console.error("Error!!: Read file failed with code: ", error.code);
  }
}

module.exports = { exportJSONFile, readJSONFile };
