/// <reference types="cypress" />

import data from "../../../data/submissions.json";
import LAB_LETTER from "../problems/Letter.cy";

for (let i = 0; i < data.length; i++) {
  LAB_LETTER(data[i].SubmittedLink, data[i]);
}
