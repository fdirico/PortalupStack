"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.listDirectory = listDirectory;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function assertInWorkspace(filePath, wsRoot) {
    const resolved = path.resolve(filePath);
    const root = path.resolve(wsRoot);
    // Also block access to session/handoff outputs
    const blocked = [
        path.join(root, "outputs", "sessions"),
        path.join(root, "outputs", "handoffs"),
    ];
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
        throw new Error(`Access denied: path is outside workspace: ${filePath}`);
    }
    for (const b of blocked) {
        if (resolved.startsWith(b)) {
            throw new Error(`Access denied: path is in a protected directory: ${filePath}`);
        }
    }
}
function readFile(filePath, wsRoot) {
    assertInWorkspace(filePath, wsRoot);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, "utf8");
}
function writeFile(filePath, content, wsRoot, confirmFn) {
    assertInWorkspace(filePath, wsRoot);
    return confirmFn(filePath, content).then((confirmed) => {
        if (!confirmed)
            return "write denied by user";
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content, "utf8");
        return `wrote ${filePath}`;
    });
}
function listDirectory(dirPath, wsRoot) {
    assertInWorkspace(dirPath, wsRoot);
    if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n");
}
