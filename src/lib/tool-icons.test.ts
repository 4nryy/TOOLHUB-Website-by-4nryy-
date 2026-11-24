import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Briefcase, File as FileIcon, Wrench } from "lucide-react";
import { categories, tools } from "./tools";
import { categoryIconClass, hasToolIcon, resolveToolIcon } from "./tool-icons";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function categoryNamed(name: string) {
  const found = categories.find((item) => item.name === name);
  assert.ok(found, `category "${name}" is missing`);
  return found;
}

describe("category icon mapping", () => {
  for (const category of categories) {
    it(`category "${category.name}" icon "${category.icon}" is registered`, () => {
      assert.ok(hasToolIcon(category.icon), `category "${category.name}" uses unregistered icon "${category.icon}"`);
    });
  }
  for (const tool of tools) {
    it(`tool "${tool.slug}" icon "${tool.icon}" resolves to a registered icon`, () => {
      assert.ok(hasToolIcon(tool.icon), `tool "${tool.slug}" uses unregistered icon "${tool.icon}"`);
    });
  }
  it("Documents resolves to the File icon, not the Wrench fallback", () => {
    const icon = resolveToolIcon(categoryNamed("Documents").icon);
    assert.equal(icon, FileIcon);
    assert.notEqual(icon, Wrench);
  });
  it("Business resolves to the Briefcase icon, not the Wrench fallback", () => {
    const icon = resolveToolIcon(categoryNamed("Business").icon);
    assert.equal(icon, Briefcase);
    assert.notEqual(icon, Wrench);
  });
  it("category data keeps the icon names 'file' (Documents) and 'briefcase' (Business)", () => {
    assert.equal(categoryNamed("Documents").icon, "file");
    assert.equal(categoryNamed("Business").icon, "briefcase");
  });
  it("an unknown name is not registered and falls back to Wrench", () => {
    assert.equal(hasToolIcon("does-not-exist"), false);
    assert.equal(resolveToolIcon("does-not-exist"), Wrench);
  });
  it("inherited object property names are not treated as icons", () => {
    for (const name of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
      assert.equal(hasToolIcon(name), false, name);
      assert.equal(resolveToolIcon(name), Wrench, name);
    }
  });
  it("empty name is not registered", () => {
    assert.equal(hasToolIcon(""), false);
  });
});

describe("category icon colour class", () => {
  it("builds the class from the category name", () => {
    assert.equal(categoryIconClass("Text & Writing"), "icon-text-writing");
    assert.equal(categoryIconClass("Student & Work"), "icon-student-work");
    assert.equal(categoryIconClass("Documents"), "icon-documents");
  });
  it("every category has a distinct icon class", () => {
    const classes = categories.map((category) => categoryIconClass(category.name));
    assert.equal(new Set(classes).size, categories.length);
  });
  for (const category of categories) {
    it(`"${category.name}" has a colour rule in globals.css with background and text colour`, () => {
      const cls = categoryIconClass(category.name);
      const rule = new RegExp("\\." + cls + "\\{([^}]*)\\}").exec(css);
      assert.ok(rule, `no CSS rule for .${cls}`);
      assert.match(rule[1], /background:/, `.${cls} has no background`);
      assert.match(rule[1], /color:/, `.${cls} has no colour`);
    });
  }
});
