import { expect, test } from "bun:test";
import { getWellKnownHost, isWellKnownSource, parseGitSource } from "@/sources";

test("detects well-known hosts from website urls with paths", () => {
  expect(getWellKnownHost("https://mintlify.com/docs")).toBe("mintlify.com");
  expect(getWellKnownHost("mintlify.com/docs")).toBe("mintlify.com");
  expect(isWellKnownSource("https://mintlify.com/docs")).toBe(true);
  expect(isWellKnownSource("mintlify.com/docs")).toBe(true);
});

test("keeps git providers out of well-known detection", () => {
  expect(getWellKnownHost("https://github.com/powroom/flins")).toBeNull();
  expect(getWellKnownHost("codeberg.org/user/repo")).toBeNull();
  expect(isWellKnownSource("https://gitlab.com/user/repo")).toBe(false);
});

test("does not treat domain-like input as github shorthand", () => {
  expect(parseGitSource("mintlify.com/docs")).toEqual({
    url: "mintlify.com/docs",
  });
  expect(parseGitSource("powroom/flins")).toEqual({
    url: "https://github.com/powroom/flins.git",
    subpath: undefined,
  });
});
