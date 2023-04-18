/// <reference types="cypress" />

export default (url, submission) =>
  describe(`${submission.SubmissionId}`, () => {
    beforeEach(() => {
      Cypress.on("uncaught:exception", (err, runnable) => {
        console.log("error", err, runnable);
        return false;
      });
      cy.visit(url, { failOnStatusCode: false });
    });

    it("Đặt tâm điểm vào ô nhập họ tên khi mới vào trang", () => {
      cy.get("input").first().should("have.focus");
    });

    it("Đánh dấu các ô phải nhập với nền xanh", () => {
      cy.get("input").eq(0).should("have.css", "background-color");
      cy.get('input[type="text"]').eq(2).and("have.css", "background-color");
      cy.get('input[type="text"]').eq(3).and("have.css", "background-color");
      cy.get('input[type="text"]').eq(5).and("have.css", "background-color");
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
      cy.contains("Chấp nhận").click();

      cy.get("#email + span").should("contain.text", "Quý vị chưa nhập");
    });

    it("Thông báo khi email không đúng định dạng", () => {
      cy.get("#email").type("abc@gmail");

      cy.contains("Chấp nhận").click();
      cy.get("#email + span").should(
        "contain.text",
        "Email không đúng định dạng"
      );
    });

    it("Thông báo khi ngày sinh không đúng định dạng", () => {
      cy.get("input").eq(4).type("abcd");
      cy.contains("Chấp nhận").click();
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
      cy.get("input[type='password']").eq(0).type("1234");
      cy.get("input[type='password']").eq(1).type("12345");
      cy.contains("Chấp nhận").click();
      // cy.contains("Mật khẩu và gõ lại mật khẩu không trùng nhau");
      cy.get("span").contains("Mật khẩu");
    });

    it("Kiểm tra các thông tin đã được nhập hay chưa khi ấn nút chấp nhận", () => {
      cy.contains("Chấp nhận").click();
      cy.contains("Quý vị chưa nhập họ tên");
      cy.contains("Quý vị chưa nhập ngày sinh");
      // cy.contains("Quý vị chưa nhập e-mail");
      cy.contains("Quý vị chưa nhập tên sử dụng");
      cy.contains("Quý vị chưa nhập mật khẩu");
    });

    it("Gõ Enter sau khi nhập xong để chuyển sang ô tiếp theo", () => {
      cy.get("input").first().type("nguyễn văn a").type("{enter}");
      cy.get("input").eq(1).should("have.focus");
    });
  });
