import assert from "node:assert/strict";
import test from "node:test";

import { isRateLimited, isTransientResponse } from "./oh-source.mjs";

const response = (status, headers = {}) => ({ status, headers: new Headers(headers) });

test("the statuses that were already transient stay transient", () => {
  for (const status of [408, 429, 500, 502, 503, 504, 599]) {
    assert.equal(
      isTransientResponse(response(status)),
      true,
      `HTTP ${status} must stay transient`,
    );
  }
});

test("an exhausted quota makes a 403 transient", () => {
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "0" })), true);
});

test("a 403 without exhausted-quota evidence stays fatal", () => {
  assert.equal(isTransientResponse(response(403)), false);
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "1" })), false);
  assert.equal(isTransientResponse(response(403, { "x-ratelimit-remaining": "4999" })), false);
});

test("a genuine authorization failure is never softened, however it is shaped", () => {
  assert.equal(isTransientResponse(response(401)), false);
  assert.equal(isTransientResponse(response(403, { "retry-after": "60" })), false);
});

test("a missing ref stays fatal, which is the guard's whole purpose", () => {
  for (const status of [400, 404, 409, 410, 422]) {
    assert.equal(
      isTransientResponse(response(status)),
      false,
      `HTTP ${status} must fail the deploy`,
    );
  }
});

test("the quota header is only believed on a 403", () => {
  assert.equal(isTransientResponse(response(404, { "x-ratelimit-remaining": "0" })), false);
});

test("a response with no headers at all does not throw", () => {
  assert.equal(isTransientResponse({ status: 403 }), false);
  assert.equal(isTransientResponse({ status: 500 }), true);
});

test("isRateLimited reads only an exact zero", () => {
  assert.equal(isRateLimited(new Headers({ "x-ratelimit-remaining": "0" })), true);
  assert.equal(isRateLimited(new Headers({ "x-ratelimit-remaining": "00" })), false);
  assert.equal(isRateLimited(new Headers()), false);
  assert.equal(isRateLimited(undefined), false);
});

test("the header is matched case-insensitively, as HTTP requires", () => {
  assert.equal(isTransientResponse(response(403, { "X-RateLimit-Remaining": "0" })), true);
});
