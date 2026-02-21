const { Given, When, Then } = require("@cucumber/cucumber");
const request = require("supertest");
const app = require("../../../app");

let response;

Given("the recipe API is running", function () {
  // Supertest uses the Express app directly, so no server boot needed.
});

When('I request recipe with id {string}', async function (id) {
  response = await request(app).get(`/recipes/${id}`);
});

Then("the response status should be {int}", function (statusCode) {
  if (response.status !== statusCode) {
    throw new Error(`Expected status ${statusCode} but got ${response.status}`);
  }
});

Then('the recipe title should be {string}', function (expectedTitle) {
  const actualTitle = response.body?.title;
  if (actualTitle !== expectedTitle) {
    throw new Error(`Expected title "${expectedTitle}" but got "${actualTitle}"`);
  }
});