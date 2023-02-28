import data from "../../../data/submissions.json";

// function loadJs(file) {
//   return new Promise((resolve) => {
//     import(`../problems/${file}`).then((module) => {
//       resolve(module.default);
//     });
//   });
// }

Scoring();

async function Scoring() {
  for (let i = 0; i < data.length; i++) {
    // const testScript = "Letter.cy.js";
    const path = `../problems/${data[i].TestcaseScript}.cy.js`;
    console.log("this is path: ", path);
    // let obj = await import(path);
    let obj = await import(`../problems/Letter.cy.js`);
    let testing = obj.default;
    testing(data[i].SubmittedLink, data[i]);
  }
}
