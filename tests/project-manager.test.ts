import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ProjectManager } from "../dist/project-manager.js";

const TEST_HOME = path.join(os.tmpdir(), `portalup-test-${Date.now()}`);

const TEMPLATE = `# Project: [nombre]

## Metadata
- Created: YYYY-MM-DD
- Status: active

## Goal

## Current State

## Decisions

## Facts

## Risks

## Sessions

## Next Action
`;

before(() => {
  process.env["PORTALUP_HOME"] = TEST_HOME;
});

after(() => {
  fs.rmSync(TEST_HOME, { recursive: true, force: true });
  delete process.env["PORTALUP_HOME"];
});

describe("ProjectManager — happy path", () => {
  it("create genera project.md con nombre y fecha correctos", () => {
    const pm = new ProjectManager();
    pm.create("test-happy", TEMPLATE);
    const content = pm.load("test-happy");
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(content.includes("test-happy"), "debe contener el slug del nombre");
    assert.ok(content.includes(today), "debe contener la fecha de hoy");
  });

  it("create crea el directorio sessions/", () => {
    const pm = new ProjectManager();
    pm.create("test-sessions-dir", TEMPLATE);
    const sessionsDir = path.join(pm.projectPath("test-sessions-dir"), "sessions");
    assert.ok(fs.existsSync(sessionsDir), "sessions/ debe existir");
  });

  it("load retorna el contenido de project.md", () => {
    const pm = new ProjectManager();
    pm.create("test-load", TEMPLATE);
    const content = pm.load("test-load");
    assert.ok(content.length > 0, "contenido no debe estar vacío");
  });

  it("write actualiza project.md y load devuelve el nuevo contenido", () => {
    const pm = new ProjectManager();
    pm.create("test-write", TEMPLATE);
    pm.write("test-write", "# Updated content");
    assert.equal(pm.load("test-write"), "# Updated content");
  });

  it("exists retorna true después de crear el proyecto", () => {
    const pm = new ProjectManager();
    pm.create("test-exists", TEMPLATE);
    assert.ok(pm.exists("test-exists"));
  });

  it("list retorna los proyectos creados", () => {
    const pm = new ProjectManager();
    pm.create("list-alpha", TEMPLATE);
    pm.create("list-beta", TEMPLATE);
    const names = pm.list().map((p) => p.name);
    assert.ok(names.includes("list-alpha"), "debe incluir list-alpha");
    assert.ok(names.includes("list-beta"), "debe incluir list-beta");
  });

  it("getNextSessionId retorna YYYYMMDD-1 para proyecto nuevo", () => {
    const pm = new ProjectManager();
    pm.create("test-session-id", TEMPLATE);
    const id = pm.getNextSessionId("test-session-id");
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    assert.ok(id.startsWith(today), `debe empezar con ${today}, obtuvo ${id}`);
    assert.ok(id.endsWith("-1"), `primera sesión debe ser -1, obtuvo ${id}`);
  });

  it("getNextSessionId incrementa N en sesiones sucesivas del mismo día", () => {
    const pm = new ProjectManager();
    pm.create("test-session-inc", TEMPLATE);
    const id1 = pm.getNextSessionId("test-session-inc");
    pm.createSessionFile("test-session-inc", id1, "# Sesion 1");
    const id2 = pm.getNextSessionId("test-session-inc");
    assert.ok(id2.endsWith("-2"), `segunda sesión debe ser -2, obtuvo ${id2}`);
  });
});

describe("ProjectManager — failure path", () => {
  it("load de proyecto inexistente lanza error con mensaje descriptivo", () => {
    const pm = new ProjectManager();
    assert.throws(
      () => pm.load("proyecto-que-no-existe"),
      (err: Error) => {
        assert.ok(err.message.includes("no encontrado"), `mensaje debe incluir 'no encontrado', obtuvo: ${err.message}`);
        return true;
      }
    );
  });

  it("exists retorna false para proyecto inexistente", () => {
    const pm = new ProjectManager();
    assert.ok(!pm.exists("no-existe-en-ningún-lado"));
  });

  it("list retorna array vacío si no hay proyectos", () => {
    process.env["PORTALUP_HOME"] = path.join(os.tmpdir(), `portalup-empty-${Date.now()}`);
    const pm = new ProjectManager();
    assert.deepEqual(pm.list(), []);
    process.env["PORTALUP_HOME"] = TEST_HOME;
  });
});

describe("ProjectManager — edge cases", () => {
  it("nombre con espacios se normaliza a kebab-case", () => {
    const pm = new ProjectManager();
    pm.create("Mi Proyecto AA1", TEMPLATE);
    assert.ok(pm.exists("mi-proyecto-aa1"), "slug kebab-case debe existir");
    assert.ok(pm.exists("Mi Proyecto AA1"), "búsqueda por nombre original también funciona");
  });

  it("nombre solo con símbolos especiales lanza error de validación", () => {
    const pm = new ProjectManager();
    assert.throws(
      () => pm.create("!@#$%^&*()", TEMPLATE),
      (err: Error) => {
        assert.ok(err.message.includes("inválido"), `debe incluir 'inválido', obtuvo: ${err.message}`);
        return true;
      }
    );
  });

  it("crear proyecto existente sobreescribe project.md", () => {
    const pm = new ProjectManager();
    pm.create("test-overwrite", TEMPLATE);
    pm.create("test-overwrite", "# Nuevo contenido");
    assert.equal(pm.load("test-overwrite"), "# Nuevo contenido");
  });
});
