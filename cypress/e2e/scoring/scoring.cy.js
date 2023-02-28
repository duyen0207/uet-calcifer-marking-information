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
    // const testScript = data[i].TestcaseScript;
    // console.log("this is test script: ", testScript);
    // const path = `../problems/${data[i].TestcaseScript}.cy.js`;
    // console.log("this is path: ", path);
    // let obj = await import(path);
    // const obj = import(`../problems/${testScript}`);
    try {
      const testing = require(`../problems/${data[i].TestcaseScript}`);
      testing(data[i].SubmittedLink, data[i]);
    } catch (error) {
      console.log("Oh no! No test script found!", error);
      it(`Oh no! No test script found! ${error}`, () => {
        expect(false).to.eq(true);
      });
    }
    // const testing = require(`${data[i].TestcaseScript}`);
  }
}
