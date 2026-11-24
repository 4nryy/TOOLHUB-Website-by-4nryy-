import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categories, tools } from "./tools";
import { hasToolIcon } from "./tool-icons";

/**
 * Source-text guards for the single-file architecture of Task 1 (audit finding: a registry entry
 * without a matching UI branch renders an empty page with no error).
 * These read source files as text on purpose. Task 3 (per-tool components) is expected to replace them.
 */
const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");
const workspace = read("../components/ToolWorkspace.tsx");

describe("UI wiring (source-based smoke checks)", () => {
  for (const tool of tools) {
    it(`ToolWorkspace has a UI branch for "${tool.slug}"`, () => {
      assert.ok(workspace.includes(`"${tool.slug}"`), `no branch for ${tool.slug} in ToolWorkspace.tsx`);
    });
    it(`ToolIcon knows the icon "${tool.icon}" used by "${tool.slug}"`, () => {
      assert.ok(hasToolIcon(tool.icon), `icon ${tool.icon} is not registered (ToolIcon uses tool-icons.ts)`);
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

describe("UI wiring — category icons (Task 2B Phase 1)", () => {
  for (const category of categories) {
    it(`category "${category.name}" has a registered icon`, () => {
      assert.ok(hasToolIcon(category.icon), `category "${category.name}" uses unregistered icon "${category.icon}"`);
    });
  }
});
