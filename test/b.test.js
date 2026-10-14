import { test } from "node:test";
import assert from "node:assert/strict";
import { double } from "../src/b.js";

test("double multiplies by two", () => {
  assert.equal(double(21), 42);
});

test("double handles zero and negatives", () => {
  assert.equal(double(0), 0);
  assert.equal(double(-3), -6);
});

test("double handles decimals", () => {
  assert.equal(double(1.5), 3);
});