/// <reference types="cypress" />

import data from "../../../data/submissions.json";
import { LAB_LETTER } from "../problems/Letter.cy";

console.log("[3] Cypress run");
for (let i = 0; i < data.length; i++) {
  LAB_LETTER(data[i].SubmittedLink, data[i]);
}
