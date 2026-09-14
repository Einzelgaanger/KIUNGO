import assert from "node:assert/strict";
import { test } from "node:test";
import { isLoopbackHost, publicOrigin, SITE_URL } from "./site";

test("loopback hosts are not public", () => {
  assert.equal(isLoopbackHost("localhost:10000"), true);
  assert.equal(isLoopbackHost("http://127.0.0.1:3000"), true);
  assert.equal(isLoopbackHost("kiungo.jabali.studio"), false);
});

test("walkthrough redirects stay on the public host behind a proxy", () => {
  const request = new Request("http://localhost:10000/walkthrough/go/amina-delivery", {
    headers: {
      host: "localhost:10000",
      "x-forwarded-host": "kiungo.jabali.studio",
      "x-forwarded-proto": "https",
    },
  });
  assert.equal(publicOrigin(request), "https://kiungo.jabali.studio");
});

test("local next dev stays on localhost", () => {
  const previous = process.env.NODE_ENV;
  Reflect.set(process.env, "NODE_ENV", "development");
  const request = new Request("http://localhost:3000/walkthrough/go/amina-delivery", {
    headers: { host: "localhost:3000" },
  });
  assert.equal(publicOrigin(request), "http://localhost:3000");
  Reflect.set(process.env, "NODE_ENV", previous);
});

test("production without forwarded host does not fall back to loopback", () => {
  const previous = process.env.NODE_ENV;
  Reflect.set(process.env, "NODE_ENV", "production");
  const request = new Request("http://localhost:10000/walkthrough/go/amina-delivery", {
    headers: { host: "localhost:10000" },
  });
  assert.equal(publicOrigin(request), SITE_URL);
  Reflect.set(process.env, "NODE_ENV", previous);
});
