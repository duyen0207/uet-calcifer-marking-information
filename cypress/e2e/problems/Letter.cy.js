/// <reference types="cypress" />

// export const LAB_LETTER = (url, submission = { SubmissionId: "0001" }) =>

export default (url, submission = { SubmissionId: "0001" }) =>
  describe(`${submission.SubmissionId}`, () => {
    beforeEach(() => {
      Cypress.on("uncaught:exception", () => {
        return false;
      });
      cy.visit(url);
    });

    context("Block/structural semantics", () => {
      it("Have Doctype", { defaultCommandTimeout: 200 }, () => {
        cy.document().then((doc) => {
          expect(doc.doctype !== undefined).to.eq(true);
          expect(doc.doctype.name).to.eq("html");
        });
      });

      it("Heading organization", { defaultCommandTimeout: 200 }, () => {
        cy.get("h1").should(
          "contain",
          "Re: Eileen Dover university application"
        );
        cy.get("h2").should("contain", "Starting dates");
        cy.get("h2").should("contain", "Subjects of study");
        cy.get("h2").should("contain", "Exotic dance moves");
      });

      it(
        "Use list type to mark up list in letter",
        { defaultCommandTimeout: 200 },
        () => {
          const list = [
            "First semester: 9 September 2016",
            "Second semester: 15 January 2017",
            "Third semester: 2 May 2017",
            "Turning H2O into wine, and the health benefits of Resveratrol (C14H12O3.)",
            "Measuring the effect on performance of funk bassplayers at temperatures exceeding 30°C (86°F), when the audience size exponentially increases (effect of 3 × 103 increasing to 3 × 104.)",
            "HTML and CSS constructs for representing musical scores.",
          ];

          const description_list = [
            "Polynesian chicken dance",
            "Icelandic brownian shuffle",
            "Arctic robot dance",
          ];

          list.forEach((item) => {
            cy.contains("li", item);
          });

          description_list.forEach((item) => {
            cy.contains("dt", item);
          });
        }
      );

      it(
        "Put addresses inside <address> elements",
        { defaultCommandTimeout: 200 },
        () => {
          const addresses = [
            "Awesome Science faculty",
            "University of Awesome",
            "Bobtown, CA 99999,",
            "USA",
            "4321 Cliff Top Edge",
            "Dover, CT9 XXX",
            "UK",
          ];
          addresses.forEach((item) => {
            cy.contains("address", item);
          });

          cy.get("address").find("br");
        }
      );
    });

    context("Inline semantics", () => {
      it("Strong importance text", { defaultCommandTimeout: 200 }, () => {
        cy.get("strong").should("contain", "Tel:");
        cy.get("strong").should("contain", "Email:");
        cy.get("strong").should("contain", "Dr Eleanor Gaye");
        cy.get("strong").should("contain", "Miss Eileen Dover");
      });

      it("Date must be in <time> tag", { defaultCommandTimeout: 200 }, () => {
        const dates = [
          "20 January 2016",
          "9 September 2016",
          "15 January 2017",
          "2 May 2017",
        ];

        dates.forEach((item) => {
          cy.contains("time", item, { timeout: 100 });
        });
      });

      it("Class sender-column", { defaultCommandTimeout: 200 }, () => {
        cy.get("address")
          .first()
          .then(($firstAdd) => {
            cy.get(".sender-column")
              .children("address")
              .should(($add) => {
                expect($firstAdd[0] == $add[0]).to.eq(true);
              });
          });

        cy.get(".sender-column").should("contain", "20 January 2016");
      });

      it("Check abbreviation", { defaultCommandTimeout: 200 }, () => {
        const abbreviations = ["PhD", "HTML", "CSS", "BC", "Esq"];
        const titles = [
          "Doctor of Philosophy",
          "HyperText Markup Language",
          "Cascading Style Sheets",
          "Before Christ",
          "Esquire",
        ];

        abbreviations.forEach((item, index) => {
          console.log("hello", titles[index]);
          cy.get("abbr", { timeout: 100 })
            .eq(index)
            .should("contain", item)
            .and("have.attr", "title", titles[index]);
        });
      });

      it("Sub/superscripts", { defaultCommandTimeout: 200 }, () => {
        const subscripts = ["2", "14", "12", "3"];
        const superscripts = ["4", "3"];

        subscripts.forEach((item) => {
          cy.contains("sub", item);
        });
        superscripts.forEach((item) => {
          cy.contains("sup", item);
        });
      });

      it("Hyperlink", { defaultCommandTimeout: 200 }, () => {
        const links = [
          "important university dates",
          "exotic dance research page",
        ];

        links.forEach((item, index) => {
          cy.get("a")
            .eq(index)
            .should("contain", item)
            .and("have.attr", "href");
        });
      });

      it("Quote", { defaultCommandTimeout: 200 }, () => {
        cy.contains("q", "Be awesome to each other.");
      });
    });

    context("The head of the document", () => {
      it("Meta data", { defaultCommandTimeout: 200 }, () => {
        cy.get("meta").should("have.attr", "charset", "utf-8");
        cy.get("link").should("have.attr", "rel", "stylesheet");
        cy.get("meta").should("have.attr", "name", "author");
      });
    });
  });
