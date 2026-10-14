import { test } from "node:test";
import assert from "node:assert/strict";
import { shout } from "../src/a.js";

test("shout uppercases", () => {
  assert.equal(shout("hi"), "HI");
});

test("shout is case-preserving for non-letters", () => {
  assert.equal(shout("a1-b"), "A1-B");
});

test("shout coerces non-strings", () => {
  assert.equal(shout(42), "42");
  assert.equal(shout(null), "NULL");
});