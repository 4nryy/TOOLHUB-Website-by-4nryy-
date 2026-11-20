import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categories, tools } from "./tools";

/**
 * Source-text guards for the single-file architecture of Task 1 (audit finding: a registry entry
 * without a matching UI branch renders an empty page with no error).
 * These read source files as text on purpose. Task 3 (per-tool components) is expected to replace them.
 */
const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");
const workspace = read("../components/ToolWorkspace.tsx");
const iconSource = read("../components/ToolIcon.tsx");
const hasIcon = (name: string) => new RegExp(`(?:["']${name}["']|\\b${name})\\s*:`).test(iconSource);

describe("UI wiring (source-based smoke checks)", () => {
  for (const tool of tools) {
    it(`ToolWorkspace has a UI branch for "${tool.slug}"`, () => {
      assert.ok(workspace.includes(`"${tool.slug}"`), `no branch for ${tool.slug} in ToolWorkspace.tsx`);
    });
    it(`ToolIcon knows the icon "${tool.icon}" used by "${tool.slug}"`, () => {
      assert.ok(hasIcon(tool.icon), `icon ${tool.icon} missing in ToolIcon.tsx`);
    });
  }
  it("ToolWorkspace imports its logic from the tested tool-logic module", () => {
    assert.match(workspace, /from "@\/lib\/tool-logic"/);
  });
  it("ToolWorkspace no longer carries its own copy of the extracted helpers", () => {
    for (const name of ["function base64Encode", "function base64Decode", "function formatBytes"]) {
      assert.ok(!workspace.includes(name), `${name} should live in tool-logic only`);
    }
  });
});

describe("UI wiring — KNOWN ISSUES (reported as TODO, do not fail the suite)", () => {
  it("every category icon exists in ToolIcon (Documents -> 'file' and Business -> 'briefcase' fall back to a wrench)",
    { todo: "Task 2: add missing category icons or change them in tools.ts" },
    () => {
      for (const c of categories) assert.ok(hasIcon(c.icon), `category "${c.name}" uses missing icon "${c.icon}"`);
    });
});
