import { test } from "node:test";
import assert from "node:assert/strict";
import { triple } from "../src/d.js";

test("triple multiplies by three", () => {
  assert.equal(triple(14), 42);
});

test("triple handles zero and negatives", () => {
  assert.equal(triple(0), 0);
  assert.equal(triple(-3), -9);
});

test("triple handles decimals", () => {
  assert.equal(triple(1.5), 4.5);
});