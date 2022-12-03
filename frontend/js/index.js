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
  var chooseColumn = null;
  $("#marking-data-table >tbody").click(function (e) {
    e.stopPropagation();

    const element = e.target;
    const studentId = $(element).parent().attr("id");
    chooseColumn = `#${studentId} .${element.className}`;

    // click to view test case reports
    if (element.className == "show-report") {
      console.log("Xem báo cáo", element.id);
      const submissionId = element.id;
      loadSubmissionReportsData(submissionId);
      $(".modal").show();
    }

    // click to edit score or test case results
    if (
      element.className == "score" ||
      element.className == "testcaseResult" ||
      (element.className == "submissionReport" && $("#filter").val() == 0)
    ) {
      // edit input
      $("#edit-input").val($(chooseColumn).text());

      // console.log(
      //   element.offsetHeight,
      //   $(element).offset().top,
      //   $(element).offset().left,

      //   $(element).attr("height"),
      //   $(element),
      //   studentId,
      //   chooseColumn
      // );

      // đặt vị trí ô input
      $("#edit-input").css({
        height: `${element.offsetHeight}px`,
        width: `${element.offsetWidth - 10}px`,
        maxHeight: "20px",
        minWidth: "20px",
        backgroundColor: `${$(`#${studentId}`).css("background-color")}`,

        position: "absolute",
        top: `${$(element).offset().top + (element.offsetHeight - 20) / 2}px`,
        left: `${$(element).offset().left}px`,
      });
      $("#edit-input").show();
    } else $("#edit-input").hide();
  });

  // event onchange edit
  $("#edit-input").change(function (e) {
    console.log("heyyyyy: ", chooseColumn);
    $(chooseColumn).text($("#edit-input").val());
    $("#edit-input").hide();
  });

  $("#submit-button").click(function (e) {
    console.log("click submit");
    // e.preventDefault();
    onSubmitData(e);
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
      $("#edit-input").hide();

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
// load report result data
function loadSubmissionReportsData(submissionId = "") {
  const URL = `${SERVER_URL}/data/submission-report?submissionId=${submissionId}`;

  console.log(URL);
  fetch(URL)
    .then((response) => {
      // gọi api và trả về response
      if (response.status === 200) {
        console.log("load submission reports: ", response.status);
        return response.json();
      }
    })
    .then((data) => {
      createReportDataRows(data);
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
  fetch(API.updateMarking, fetchData)
    .then((res) => {
      // console.log("update: ", response);
      console.log("updateeee", res);
    })
    .then(() => {
      console.log("vừa upload xong, đang load lại bảng: ");
      emptyTable();
    })
    .then(() => {
      // load lại bảng dữ liệu
      loadMarkingData();
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
    <td class="testcaseScript"><a href="${formatData(
      data[i]?.TestcaseScript
    )}">${formatData(data[i]?.TestcaseScript)}</a></td>
    <td class="submittedLink"><a href="${formatData(
      data[i]?.SubmittedLink
    )}" target="_blank">${formatData(data[i]?.SubmittedLink)}</a></td>
    <td class="testcaseResult">${formatData(data[i]?.TestcaseResult)}</td>
    <td class="score">${formatData(data[i]?.Score)}</td>
    <td class="submissionReport">${
      formatData(data[i]?.Score) != ""
        ? `<div id='${formatData(
            data[i]?.SubmissionId
          )}' class='show-report'>Xem</div>`
        : ""
    }</td>
    
  </tr>`);
  }
}

function createReportDataRows(data = REPORT_DATA) {
  $("#report-table > tbody").empty();
  for (let i = 0; i < data.length; i++) {
    $("#report-table > tbody").append(
      `<tr id='${formatData(data[i]?.SubmissionId)}'>
          <td class="errorTestcaseOrder">${formatData(
            data[i].ErrorTestcaseOrder
          )}</td>
          <td class="testcaseDescript">${formatData(
            data[i].TestcaseDescript
          )}</td>
          <td class="errorReport">${formatData(data[i].ErrorReport)}</td>
        </tr>`
    );
  }
}

// collect inputs--------------------------------------------
function onSubmitData(e) {
  let updateAmount = 0;

  let submissionIdRows = $(".body-table tr td.submissionId");
  let testcaseResultRows = $(".body-table tr td.testcaseResult");
  let scoreRows = $(".body-table tr td.score");
  let submissionReportRows = $(".body-table tr td.submissionReport");

  let submissionData = [];

  for (let i = 0; i < submissionIdRows.length; i++) {
    const submissionId = submissionIdRows[i].innerText;
    const testcaseResult = testcaseResultRows[i].innerText;
    const score = scoreRows[i].innerText;
    if (testcaseResult != "" && score != "") {
      submissionData.push({
        submissionId: submissionId,
        testcaseResult: testcaseResult,
        score: score,
      });
      updateAmount++;
    }
  }

  console.log({
    submissionData: submissionData
  });

  updateMarkingData(submissionData);

  // alert(`Update marks successful ${updateAmount} records!`);
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
/**
 * Function: close something when click outside
 */
// $(document).mouseup(function (e) {
//   // close modal
//   if ($(e.target).closest(".modal .modal-content").length === 0) {
//     $(".modal").hide();
//     console.log("đã đóng. đang clear table");
//   }
// });
