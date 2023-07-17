import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");
    cy.findByRole("button", { name: /open main menu/i }).click();
    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();
    cy.findByRole("button", { name: /create account/i }).should("not.exist").wait(1000);
    
    cy.findByRole("button", { name: /open main menu/i }).click();
    cy.findByRole("button", { name: /log out.*/i }).click();
    cy.findByRole("button", { name: /log out.*/i }).should("not.exist").wait(1000);
  });
});
