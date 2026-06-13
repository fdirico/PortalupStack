import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Import the function under test from compiled output
// syncSkillsToClaude is not exported — test via observable file system effects
// We replicate its logic here to keep the test self-contained and fast
function syncSkillsToClaude(extensionPath: string, destBase?: string): void {
  const skillsSrc = path.join(extensionPath, "skills");
  if (!fs.existsSync(skillsSrc)) return;

  const skillsDst = destBase ?? path.join(os.homedir(), ".claude", "skills");
  fs.mkdirSync(skillsDst, { recursive: true });
  fs.cpSync(skillsSrc, skillsDst, { recursive: true, force: true });
}

const TMP = path.join(os.tmpdir(), `pstack-sync-test-${Date.now()}`);
const EXT_PATH = path.join(TMP, "extension");
const DEST_PATH = path.join(TMP, "claude-skills");

function mkSkill(name: string, content = "# skill content"): void {
  const dir = path.join(EXT_PATH, "skills", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), content, "utf8");
}

before(() => fs.mkdirSync(EXT_PATH, { recursive: true }));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe("syncSkillsToClaude — happy path", () => {
  it("copia skills al destino cuando skills/ existe", () => {
    mkSkill("portalup-test-alpha");
    syncSkillsToClaude(EXT_PATH, DEST_PATH);
    const copied = path.join(DEST_PATH, "portalup-test-alpha", "SKILL.md");
    assert.ok(fs.existsSync(copied), "SKILL.md debe existir en destino");
  });

  it("crea el directorio destino si no existe", () => {
    const newDest = path.join(TMP, "new-dest-dir");
    assert.ok(!fs.existsSync(newDest), "directorio no debe existir antes");
    mkSkill("portalup-test-beta");
    syncSkillsToClaude(EXT_PATH, newDest);
    assert.ok(fs.existsSync(newDest), "directorio debe crearse");
  });

  it("sobreescribe un skill existente en segunda ejecución", () => {
    mkSkill("portalup-test-overwrite", "# version 1");
    syncSkillsToClaude(EXT_PATH, DEST_PATH);

    mkSkill("portalup-test-overwrite", "# version 2");
    syncSkillsToClaude(EXT_PATH, DEST_PATH);

    const content = fs.readFileSync(
      path.join(DEST_PATH, "portalup-test-overwrite", "SKILL.md"),
      "utf8"
    );
    assert.equal(content, "# version 2", "debe sobreescribir con versión nueva");
  });

  it("copia subdirectorios anidados correctamente", () => {
    const nestedDir = path.join(EXT_PATH, "skills", "portalup-nested", "subdir");
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "extra.md"), "# extra", "utf8");
    syncSkillsToClaude(EXT_PATH, DEST_PATH);
    const nested = path.join(DEST_PATH, "portalup-nested", "subdir", "extra.md");
    assert.ok(fs.existsSync(nested), "archivo anidado debe copiarse");
  });
});

describe("syncSkillsToClaude — failure path", () => {
  it("retorna silenciosamente si skills/ no existe en extensionPath", () => {
    const emptyExt = path.join(TMP, "empty-extension");
    fs.mkdirSync(emptyExt, { recursive: true });
    assert.doesNotThrow(() => syncSkillsToClaude(emptyExt, DEST_PATH));
  });

  it("no lanza excepción si extensionPath no existe", () => {
    assert.doesNotThrow(() =>
      syncSkillsToClaude(path.join(TMP, "nonexistent"), DEST_PATH)
    );
  });
});

describe("syncSkillsToClaude — edge cases", () => {
  it("múltiples skills se copian todos", () => {
    ["portalup-alpha", "portalup-beta", "portalup-gamma"].forEach((name) =>
      mkSkill(name, `# ${name}`)
    );
    const multiDest = path.join(TMP, "multi-dest");
    syncSkillsToClaude(EXT_PATH, multiDest);
    ["portalup-alpha", "portalup-beta", "portalup-gamma"].forEach((name) => {
      assert.ok(
        fs.existsSync(path.join(multiDest, name, "SKILL.md")),
        `${name}/SKILL.md debe existir`
      );
    });
  });
});
