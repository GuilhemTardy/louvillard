import assert from "node:assert/strict";
import { test } from "node:test";
import { bibsFromFilename } from "../src/lib/images.ts";

test("dossards détectés dans le nom de fichier", () => {
  assert.deepEqual(bibsFromFilename("IMG_D248.jpg"), ["248"]);
  assert.deepEqual(bibsFromFilename("km12_#115_#0042.JPG"), ["115", "42"]);
  assert.deepEqual(bibsFromFilename("dossard-7.jpeg"), ["7"]);
});

test("pas de faux positifs sur les numéros d'appareil", () => {
  assert.deepEqual(bibsFromFilename("DSC_0042.jpg"), []);
  assert.deepEqual(bibsFromFilename("IMG_2026.jpg"), []);
});
