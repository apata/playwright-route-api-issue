import { Page, TestInfo } from "@playwright/test";

const SERVER_URL = "http://localhost:3000";

export async function getServerRecordedEvents({ testId }: TestInfo) {
  const response = await fetch(`${SERVER_URL}/api/${testId}/events`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  const data = await response.json();

  return data.events;
}

export async function deleteServerRecordedEvents({ testId }: TestInfo) {
  const response = await fetch(`${SERVER_URL}/api/${testId}/events`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete events: ${response.statusText}`);
  }
}

export async function setupPassthroughRoute(page: Page, { testId }: TestInfo) {
  const payloads: Record<string, unknown>[] = [];
  const getPayloads = () => payloads;
  await page.route(`${SERVER_URL}/foobar`, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === "POST") {
      const payload = route.request().postDataJSON();
      console.log(`Playwright route triggered: ${method} ${url}`);
      payloads.push(payload);
      await route.fulfill({ status: 202, contentType: 'text/plain', body: 'ok' });
    } else {
      await route.fulfill({status: 500, contentType: 'text/plain', body: 'Internal Server Error'});
    }
  });
  return { getPayloads };
}
