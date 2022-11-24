$(document).ready(function () {
  loadMarkingData();
});

// fetch API--------------------------------------------
// load and show data
function loadMarkingData() {
  console.log(API.getData);
  fetch(API.getData)
    .then((response) => {
      // gọi api và trả về response
      if (response.status === 200) {
        console.log(response.status);
        return response.json();
      }
    })
    .then((data) => {
      // làm trống bảng dữ liệu
      emptyTable();
      console.log("thành công: ", data);
      return data;
    })
    .then((data) => {
      // Tạo bảng dữ liệu
      createDataRows(data.data, data.totalRecords);
    })
    .catch(function (err) {
      console.log("Không lấy được dữ liệu!");
    });
}
// post marking data
function updateMarking() {
  
}

// render data--------------------------------------------
function createDataRows(data, totalRecords) {
  console.log(data);
  $(".total-records").append(`Tổng số: ${totalRecords}`);
  for (let i = 0; i < data.length; i++) {
    $("#marking-data-table > tbody").append(`<tr>
    <td class="No">${i}</td>
    <td class="studentId">${formatData(data[i]?.StudentId)}</td>
    <td class="fullName">${formatData(data[i]?.FullName)}</td>
    <td class="problemTitle">${formatData(data[i]?.ProblemTitle)}</td>
    <td class="exerciseId">${formatData(data[i]?.ExerciseId)}</td>
    <td class="classId">${formatData(data[i]?.ClassId)}</td>

    <td class="submissionId">${formatData(data[i]?.SubmissionId)}</td>
    <td class="iter">${formatData(data[i]?.Iter)}</td>
    <td class="submittedLink">${formatData(data[i]?.SubmittedLink)}</td>
    <td class="testcaseResult">${formatData(data[i]?.TestcaseResult)}</td>
    <td class="score">${formatData(data[i]?.Score)}</td>
    <td class="errorTestcaseOrder">${formatData(
      data[i]?.errorTestcaseOrder
    )}</td>
    <td class="errorReport">${formatData(data[i]?.errorReport)}</td>
  </tr>`);
  }
}

// collect inputs--------------------------------------------
function onSubmitData(e) {
  e.preventDefault();

  let submissionIdRows = $(".body-table tr td.submissionId");
  let testcaseResultRows = $(".body-table tr td.testcaseResult");
  let scoreRows = $(".body-table tr td.score");
  let errorTestcaseOrderRows = $(".body-table tr td.errorTestcaseOrder");
  let errorReportRows = $(".body-table tr td.errorReport");

  let submissionData = [];
  let submissionReportData = [];

  for (let i = 0; i < submissionIdRows.length; i++) {
    const submissionId = submissionIdRows[i].innerText;
    const testcaseResult = testcaseResultRows[i].innerText;
    const score = scoreRows[i].innerText;
    const errorTestcaseOrder = errorTestcaseOrderRows[i].innerText;
    const errorReport = errorReportRows[i].innerText;

    submissionData.push({
      submissionId: submissionId,
      testcaseResult: testcaseResult,
      score: score,
    });

    submissionReportData.push({
      submissionId: submissionId,
      errorTestcaseOrder: errorTestcaseOrder,
      errorReport: errorReport,
    });
  }

  console.log({
    submissionData: submissionData,
    submissionReportData: submissionReportData,
  });

  return {
    submissionData: submissionData,
    submissionReportData: submissionReportData,
  };
}

// utils functions----------------------------------------------
/**
 * Function: empty table data
 */
 function emptyTable() {
  $("#marking-data-table > tbody").empty();
}
function formatData(data) {
  if (!data) return "";
  return data;
}
