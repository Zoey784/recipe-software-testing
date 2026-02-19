const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function e2eViewRecipeJourney() {
  const driver = await new Builder().forBrowser("chrome").build();

  const STEP_DELAY = 2000;   // 5 seconds per step
  const WAIT_TIMEOUT = 20000;

  try {
    const expectedTitle = "Spaghetti Aglio e Olio";

    console.log("Opening homepage...");
    await driver.get("http://localhost:3000/index.html");

    await driver.wait(
      () => driver.executeScript("return document.readyState==='complete'"),
      WAIT_TIMEOUT
    );

    await driver.sleep(STEP_DELAY);

    console.log("Clicking recipe id=3...");
    const recipeLink = await driver.wait(
      until.elementLocated(By.css('a[href*="recipe.html"][href*="id=3"]')),
      WAIT_TIMEOUT
    );
    await recipeLink.click();

    await driver.sleep(STEP_DELAY);

    console.log("Verifying recipe title...");
    const titleEl = await driver.wait(
      until.elementLocated(By.id("recipe-title")),
      WAIT_TIMEOUT
    );

    await driver.wait(async () => {
      const txt = await titleEl.getText();
      return txt && txt.trim().length > 0;
    }, WAIT_TIMEOUT);

    await driver.sleep(STEP_DELAY);

    const titleText = (await titleEl.getText()).trim();

    if (titleText !== expectedTitle) {
      throw new Error(`Expected "${expectedTitle}" but got "${titleText}"`);
    }

    console.log("✅ E2E PASS - User can open recipe and see title:", titleText);

    await driver.sleep(STEP_DELAY);

  } catch (err) {
    console.error("❌ E2E FAIL:", err);
    await driver.sleep(STEP_DELAY);
  } finally {
    await driver.quit();
  }
})();
