/// <reference types="cypress" />

// LAB_FORM("https://itest.com.vn/lects/webappdev/form/demo/");
const url = "https://itest.com.vn/lects/webappdev/form/demo/";

// export const LAB_FORM = (url, submission = { SubmissionId: "0001" }) =>
// describe(`${submission.SubmissionId}`, () => {
describe(`0001`, () => {
  beforeEach(() => {
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    cy.visit(url);
  });

  it("Đặt tâm điểm vào ô nhập họ tên khi mới vào trang", () => {
    cy.get("input").first().should("have.focus");
  });

  it("Gõ Enter sau khi nhập xong để chuyển sang ô tiếp theo", () => {
    cy.get("input").first().type("nguyễn văn a").type("{enter}");
    cy.get("input").eq(1).should("have.focus");
  });

  it("Đánh dấu các ô phải nhập với nền xanh", () => {
    cy.get("input")
      .eq(0)
      .should("have.css", "background-color", "rgb(0, 255, 255)");
    cy.get('input[type="text"]')
      .eq(2)
      .and("have.css", "background-color", "rgb(0, 255, 255)");
    cy.get('input[type="text"]')
      .eq(3)
      .and("have.css", "background-color", "rgb(0, 255, 255)");
    cy.get('input[type="text"]')
      .eq(5)
      .and("have.css", "background-color", "rgb(0, 255, 255)");
  });

  it("Chuẩn hóa họ tên khi nhập xong ô Họ tên", () => {
    cy.get('input[type="text"]')
      .eq(0)
      .type("nguyễn văn nam")
      .blur()
      .should("have.value", "Nguyễn Văn Nam");
    cy.get('input[type="text"]')
      .eq(0)
      .clear()
      .type("nguyễn thị    an")
      .blur()
      .should("have.value", "Nguyễn Thị An");
  });

  it("Thông báo khi chưa nhập email", () => {
    cy.get("#email");
    // cy.contains("Chấp nhận").click();
    cy.get("input[type='button']").first().click();
    cy.get("#email + span").should("contain.text", "Quý vị chưa nhập e-mail");
  });

  it("Thông báo khi email không đúng định dạng", () => {
    cy.get("#email").type("abc@gmail");
    // cy.contains("Chấp nhận").click();
    cy.get("input[type='button']").first().click();
    cy.get("#email + span").should(
      "contain.text",
      "Email không đúng định dạng"
    );
  });

  it("Thông báo khi ngày sinh không đúng định dạng", () => {
    cy.get("input").eq(4).type("abcd");
    cy.get("input[type='button']").first().click();
    cy.contains("Ngày sinh không đúng định dạng");
  });
  
  it("Tự động thêm dấu cách khi nhập đủ ngày hoặc tháng", () => {
    cy.get("input")
      .eq(4)
      .type("10022001")
      .blur()
      .should("have.value", "10/02/2001");
  });

  it("Có kiểm tra trùng khớp mật khẩu", () => {
    cy.get("input[type='password']").first().type("1234");
    cy.get("input[type='password']").last().type("12345");
    cy.get("input[type='button']").first().click();
    cy.contains("Mật khẩu và gõ lại mật khẩu không trùng nhau");
  });

  it("Kiểm tra các thông tin đã được nhập hay chưa khi ấn nút chấp nhận", () => {
    cy.get("input[type='button']").first().click();
    cy.contains("Quý vị chưa nhập họ tên");
    cy.contains("Quý vị chưa nhập ngày sinh");
    cy.contains("Quý vị chưa nhập e-mail");
    cy.contains("Quý vị chưa nhập tên sử dụng");
    cy.contains("Quý vị chưa nhập mật khẩu");
  });
});
