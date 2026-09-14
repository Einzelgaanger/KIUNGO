import assert from "node:assert/strict";
import { test } from "node:test";
import { clampStep, getWalkthrough, hrefPathname, stepMatches, withWalkQuery, appendWalkParams, WALKTHROUGHS } from "./walkthroughs";

test("withWalkQuery keeps filters and hashes", () => {
  assert.equal(
    withWalkQuery("/registry?q=Kariobangi", "amina-delivery", 0),
    "/registry?q=Kariobangi&wt=amina-delivery&wts=0",
  );
  assert.equal(
    withWalkQuery("/how-it-works#api", "faith-programme", 2),
    "/how-it-works?wt=faith-programme&wts=2#api",
  );
});

test("step matching does not collapse registry list into a profile", () => {
  assert.equal(stepMatches("/registry?q=Kariobangi", "/registry"), true);
  assert.equal(stepMatches("/registry?q=Kariobangi", "/registry/kariobangi-metal-works"), false);
  assert.equal(stepMatches("/console/claims", "/console/claims/claim-0001"), true);
  assert.equal(hrefPathname("/how-it-works#api"), "/how-it-works");
});

test("appendWalkParams keeps an existing query and skips when idle", () => {
  assert.equal(
    appendWalkParams("/intelligence?weeks=8", "faith-programme", "0"),
    "/intelligence?weeks=8&wt=faith-programme&wts=0",
  );
  assert.equal(appendWalkParams("/intelligence?weeks=8"), "/intelligence?weeks=8");
});

test("walkthrough copy is operator-facing", () => {
  const text = JSON.stringify(WALKTHROUGHS);
  assert.equal(text.includes("Play demo"), false);
  assert.equal(text.includes("theatrical"), false);
  assert.equal(text.includes("seeded"), false);
});

test("Amina walkthrough starts as Amina on the filtered registry", () => {
  const walkthrough = getWalkthrough("amina-delivery");
  assert.ok(walkthrough);
  assert.equal(walkthrough.steps[0]?.personaId, "user-amina");
  assert.equal(hrefPathname(walkthrough.steps[0]!.href), "/registry");
  assert.equal(clampStep(walkthrough, 99), walkthrough.steps.length - 1);
});
