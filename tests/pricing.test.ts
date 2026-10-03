import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrice, quote } from "../src/lib/pricing.ts";

const trail = { unit: 600, bundles: [{ quantity: 3, price: 1500 }, { quantity: 6, price: 2400 }], all: null };
const gala = { unit: 500, bundles: [{ quantity: 5, price: 2000 }, { quantity: 10, price: 3500 }], all: 6900 };

test("panier vide", () => {
  assert.equal(quote(trail, 0, 30).total, 0);
});

test("prix unitaire sans lot", () => {
  assert.equal(quote(trail, 2, 30).total, 1200);
});

test("lot appliqué dès qu'il est atteint", () => {
  assert.equal(quote(trail, 3, 30).total, 1500);
  assert.equal(quote(trail, 4, 30).total, 2100);
});

test("le lot supérieur est choisi s'il coûte moins cher", () => {
  const q = quote(trail, 5, 30);
  assert.equal(q.total, 2400);
  assert.equal(q.undiscounted, 3000);
});

test("combinaison optimale de lots", () => {
  assert.equal(quote(trail, 9, 30).total, 3900);
  assert.equal(quote(trail, 12, 30).total, 4800);
});

test("la galerie complète est offerte quand elle revient moins cher", () => {
  const q = quote(gala, 19, 30);
  assert.equal(q.all, true);
  assert.equal(q.total, 6900);
  assert.equal(q.count, 30);
});

test("pas de galerie complète tant que la sélection coûte moins cher", () => {
  const q = quote(gala, 10, 30);
  assert.equal(q.all, false);
  assert.equal(q.total, 3500);
});

test("format des prix en euros", () => {
  assert.equal(formatPrice(600).replace(/\s/g, " "), "6 €");
  assert.equal(formatPrice(1250).replace(/\s/g, " "), "12,50 €");
});
