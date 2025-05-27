import { test, expect } from "@playwright/test";
import {
  getServerRecordedEvents,
  deleteServerRecordedEvents,
  setupPassthroughRoute,
} from "./test-utils";

test.beforeEach(async ({ page }, testInfo) => {
  await deleteServerRecordedEvents(testInfo);
});

test("track works", async ({ page }, testInfo) => {
  const { getPayloads } = await setupPassthroughRoute(page, testInfo);
  await page.goto(
    `/static/page-alfa.html?${new URLSearchParams({
      trackEndpoint: `/api/${testInfo.testId}/events`,
    }).toString()}`
  );
  await page.fill('input[name="text"]', "Hello World");
  await page.click('input[type="submit"]');
  // expect(getPayloads()).toEqual([
  //   {
  //     action: "submit",
  //     page: "page-alfa",
  //     timestamp: expect.any(String),
  //   },
  // ]);
  expect(await getServerRecordedEvents(testInfo)).toEqual([
    {
      action: "submit",
      page: "page-alfa",
      timestamp: expect.any(String),
    },
  ]);

  await expect(page.getByText("page beta")).toBeVisible();
});
