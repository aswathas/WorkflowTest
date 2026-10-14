import { test } from "node:test";
import assert from "node:assert/strict";
import { sum } from "../src/c.js";

test("sum adds numbers", () => {
  assert.equal(sum([1, 2, 3]), 6);
});

test("sum of empty array is zero", () => {
  assert.equal(sum([]), 0);
});

test("sum handles negatives and floats", () => {
  assert.equal(sum([-1, 2.5, -0.5]), 1);
});