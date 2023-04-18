/// <reference types="cypress" />

const url =
  "http://localhost/Form/INT3306_21-Form/2223II_INT3306_21-(N2)-134706/Do%c3%a3n%20Minh%20Ho%c3%a0ng_718147_assignsubmission_file_/form.html";

describe(`Bài số 1`, () => {
  beforeEach(() => {
    Cypress.on("uncaught:exception", (err, runnable) => {
      console.log("error", err, runnable);
      return false;
    });
    cy.visit(url, { failOnStatusCode: false });
  });

  it("Đặt tâm điểm vào ô nhập họ tên khi mới vào trang", () => {
    cy.get('label:contains("Họ tên")').next("input").should("have.focus");
    // cy.get("input").first().should("have.focus");
  });

  it("Gõ Enter sau khi nhập xong để chuyển sang ô tiếp theo", () => {
    cy.get("input").first().type("nguyễn văn a").type("{enter}");
    cy.get("input").eq(1).should("have.focus");
  });

  it("Đánh dấu các ô phải nhập với nền xanh", () => {
    cy.get("label")
      .contains(/Họ tên|Họ Tên/g)
      .next("input")
      .should("have.css", "background-color");
    cy.get("label")
      .contains(/Ngày sinh|Ngày Sinh/g)
      .next("input")
      .should("have.css", "background-color");
    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .should("have.css", "background-color");
    cy.get("label")
      .contains(/Tên sử dụng|Tên Sử Dụng/g)
      .next("input")
      .should("have.css", "background-color");
  });

  it("Chuẩn hóa họ tên khi nhập xong ô Họ tên", () => {
    cy.get("label")
      .contains(/Họ tên|Họ Tên/g)
      .next("input")
      .type("nguyễn văn nam")
      .blur()
      .should("have.value", "Nguyễn Văn Nam");
    cy.get("label")
      .contains(/Họ tên|Họ Tên/g)
      .next("input")
      .clear()
      .type("nguyễn thị    an")
      .blur()
      .should("have.value", "Nguyễn Thị An");
  });

  it("Thông báo khi chưa nhập email", () => {
    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .click();
    cy.get(
      "input[value='Chấp nhận'],input[value='Đăng ký'], button:contains('Chấp nhận'), button:contains('Đăng ký')"
    ).click();

    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .next("span")
      .should("contain.text", "nhập");
  });

  it("Thông báo khi email không đúng định dạng", () => {
    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .type("abc@gmail");

    cy.get(
      "input[value='Chấp nhận'],input[value='Đăng ký'], button:contains('Chấp nhận'), button:contains('Đăng ký')"
    ).click();

    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .next("span")
      .contains(/định dạng|Định dạng|hợp lệ/g);
  });

  it("Thông báo khi ngày sinh không đúng định dạng", () => {
    cy.get("label").contains("Ngày sinh").next("input").type(20052001);
    cy.get(
      "input[value='Chấp nhận'],input[value='Đăng ký'], button:contains('Chấp nhận'), button:contains('Đăng ký')"
    ).click();
    cy.get("label")
      .contains(/Ngày sinh|Ngày Sinh/g)
      .next("input")
      .next("span")
      .contains(/định dạng|Định dạng|hợp lệ/g);
  });

  it("Tự động thêm dấu cách khi nhập đủ ngày hoặc tháng", () => {
    cy.get("label")
      .contains(/Ngày sinh|Ngày Sinh/g)
      .next("input")
      .type("10022001")
      .blur()
      .should("have.value", "10/02/2001");
  });

  it("Có kiểm tra trùng khớp mật khẩu", () => {
    cy.get("input[type='password']").eq(0).type("1234");
    cy.get("input[type='password']").eq(1).type("12345");

    cy.get(
      "input[value='Chấp nhận'],input[value='Đăng ký'], button:contains('Chấp nhận'), button:contains('Đăng ký')"
    ).click();
    cy.get("input[type='password']").next("span").contains("Mật khẩu");
  });

  it("Kiểm tra các thông tin đã được nhập hay chưa khi ấn nút chấp nhận", () => {
    cy.get(
      "input[value='Chấp nhận'],input[value='Đăng ký'], button:contains('Chấp nhận'), button:contains('Đăng ký')"
    ).click();
    cy.get("label")
      .contains(/Họ tên|Họ Tên/g)
      .next("input")
      .next("span")
      .should("contain.text", "nhập");
    cy.get("label")
      .contains(/Ngày sinh|Ngày Sinh/g)
      .next("input")
      .next("span")
      .should("contain.text", "nhập");
    cy.get("label")
      .contains(/Email|E-mail/g)
      .next("input")
      .next("span")
      .should("contain.text", "nhập");
    cy.get("label")
      .contains(/Tên sử dụng|Tên Sử Dụng/g)
      .next("input")
      .next("span")
      .should("contain.text", "nhập");
    cy.get("input[type='password']").next("span").contains("nhập");
  });
});
