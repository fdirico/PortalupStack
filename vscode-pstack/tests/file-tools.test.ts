import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readFile, writeFile, listDirectory } from "../src/tools/file-tools";

let tmpDir: string;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-test-"));
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("file-tools", () => {
  describe("readFile", () => {
    it("happy path: returns file content", () => {
      const filePath = path.join(tmpDir, "hello.txt");
      fs.writeFileSync(filePath, "hello world", "utf8");
      const result = readFile(filePath, tmpDir);
      assert.equal(result, "hello world");
    });

    it("failure path: throws for file outside workspace", () => {
      assert.throws(
        () => readFile(path.join(os.tmpdir(), "outside.txt"), tmpDir),
        /outside workspace/
      );
    });

    it("failure path: throws for file not found", () => {
      assert.throws(
        () => readFile(path.join(tmpDir, "missing.txt"), tmpDir),
        /not found/
      );
    });

    it("edge case: blocks access to outputs/sessions/", () => {
      const blockedDir = path.join(tmpDir, "outputs", "sessions");
      fs.mkdirSync(blockedDir, { recursive: true });
      const blockedFile = path.join(blockedDir, "s.json");
      fs.writeFileSync(blockedFile, "{}", "utf8");
      assert.throws(
        () => readFile(blockedFile, tmpDir),
        /protected directory/
      );
    });
  });

  describe("writeFile", () => {
    it("happy path: writes file when confirmed", async () => {
      const filePath = path.join(tmpDir, "out.txt");
      const result = await writeFile(filePath, "written content", tmpDir, async () => true);
      assert.ok(result.includes("wrote"));
      assert.equal(fs.readFileSync(filePath, "utf8"), "written content");
    });

    it("failure path: does not write when denied", async () => {
      const filePath = path.join(tmpDir, "denied.txt");
      const result = await writeFile(filePath, "should not appear", tmpDir, async () => false);
      assert.equal(result, "write denied by user");
      assert.ok(!fs.existsSync(filePath));
    });

    it("edge case: creates parent directories when they do not exist", async () => {
      const filePath = path.join(tmpDir, "nested", "deep", "file.txt");
      await writeFile(filePath, "nested", tmpDir, async () => true);
      assert.equal(fs.readFileSync(filePath, "utf8"), "nested");
    });
  });

  describe("listDirectory", () => {
    it("happy path: returns file and directory names", () => {
      const subDir = path.join(tmpDir, "listdir-test");
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, "a.ts"), "", "utf8");
      fs.mkdirSync(path.join(subDir, "src"), { recursive: true });
      const result = listDirectory(subDir, tmpDir);
      assert.ok(result.includes("a.ts"));
      assert.ok(result.includes("src/"));
    });

    it("failure path: throws for directory not found", () => {
      assert.throws(
        () => listDirectory(path.join(tmpDir, "nonexistent"), tmpDir),
        /not found/
      );
    });

    it("failure path: throws for directory outside workspace", () => {
      assert.throws(
        () => listDirectory(os.tmpdir(), tmpDir),
        /outside workspace/
      );
    });
  });
});
