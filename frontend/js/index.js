$(document).ready(function () {
  loadMarkingData();
  // tìm kiếm
  $("#search-input").change(function (e) {
    e.preventDefault();
    loadMarkingData(
      (isMarked = $("#filter").val()),
      (search = $("#search-input").val())
    );
  });
  // select
  $("#filter").change(function (e) {
    e.preventDefault();
    loadMarkingData(
      (isMarked = $("#filter").val()),
      (search = $("#search-input").val())
    );
  });

  // click in table
  $("#marking-data-table >tbody").click(function (e) {
    console.log(e.target);

    e.stopPropagation();
    console.log(e.target);

  });
});

// fetch API--------------------------------------------
// load and show data
function loadMarkingData(isMarked = FILTER.NOT_MARKED, search = "") {
  const URL = `${SERVER_URL}/data/filter?isMarked=${isMarked}&search=${search}`;

  console.log(URL);
  fetch(URL)
    .then((response) => {
      // gọi api và trả về response
      if (response.status === 200) {
        console.log("load data: ", response.status);
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
function updateMarkingData(data) {
  console.log("this is score: ", JSON.stringify(data));
  let fetchData = {
    method: "PUT",
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json; charset=UTF-8",
    }),
  };
  console.log("aaaaaaaaaaaaaaaa: ", API.updateMarking, fetchData);
  fetch(API.updateMarking, fetchData)
    .then((response) => {
      if (response.status === 200) {
        // console.log("update: ",response.status);
      }
    })
    .then(() => {
      emptyTable();
    })
    .then(() => {
      // load lại bảng dữ liệu
      // loadMarkingData();
    })
    .catch((err) => console.log(err));
}

// render data--------------------------------------------
function createDataRows(data, totalRecords) {
  // console.log(data);
  $(".total-records").append(`${totalRecords}`);
  for (let i = 0; i < data.length; i++) {
    $("#marking-data-table > tbody").append(`<tr id='${formatData(
      data[i]?.StudentId
    )}'>
    <td class="No">${i}</td>
    <td class="studentId">${formatData(data[i]?.StudentId)}</td>
    <td class="fullName">${formatData(data[i]?.FullName)}</td>
    <td class="problemTitle">${formatData(data[i]?.ProblemTitle)}</td>
    <td class="exerciseId">${formatData(data[i]?.ExerciseId)}</td>
    <td class="classId">${formatData(data[i]?.ClassId)}</td>

    <td class="submissionId">${formatData(data[i]?.SubmissionId)}</td>
    <td class="iter">${formatData(data[i]?.Iter)}</td>
    <td class="submittedLink"><a href="${formatData(
      data[i]?.SubmittedLink
    )}" target="_blank">${formatData(data[i]?.SubmittedLink)}</a></td>
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

  updateMarkingData(submissionData);

  alert("Update marks successful!");

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
  $(".total-records").empty();
}
function formatData(data) {
  if (!data) return "";
  return data;
}
