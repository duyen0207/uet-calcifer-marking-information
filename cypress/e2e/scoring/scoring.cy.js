import data from "../../../data/submissions.json";

for (let i = 0; i < data.length; i++) {
  try {
    const testing = require(`../problems/${data[i].TestcaseScript}`);
    testing(data[i].SubmittedLink, data[i]);
  } catch (error) {
    console.log("Oh no! No test script found!", error);
    it(`Oh no! No test script found! ${error}`, () => {
      expect(false).to.eq(true);
    });
  }
}
