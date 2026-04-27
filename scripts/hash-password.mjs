#!/usr/bin/env node
// Generate a strong passphrase + scrypt hash for ADMIN_PASSWORD_HASH.
//
// Usage:
//   node scripts/hash-password.mjs                # generates a fresh passphrase + hash
//   node scripts/hash-password.mjs "your phrase"  # hashes an existing passphrase

import { randomBytes, scryptSync, randomInt } from "node:crypto";

const WORDS = [
  "amber","anchor","apple","arrow","aspen","autumn","azure","badger","bagel","balcony",
  "banjo","barley","basil","beacon","beetle","birch","bison","blossom","bramble","breeze",
  "brick","bridge","bronze","brook","buffalo","cactus","camel","canopy","canyon","cardinal",
  "carrot","cedar","cherry","chestnut","cinder","cliff","clover","cobalt","compass","copper",
  "coral","cosmos","cricket","crimson","crystal","cypress","daisy","dawn","delta","desert",
  "diamond","dolphin","drift","dusk","eagle","ember","emerald","fable","falcon","feather",
  "fennel","fern","ferry","fjord","flame","flicker","flint","forest","fox","frost",
  "garnet","ginger","glacier","gold","granite","gravel","hazel","heron","hickory","hollow",
  "honey","horizon","hornet","ibex","iris","ivory","jade","jasper","juniper","kestrel",
  "lagoon","lantern","lark","lavender","ledger","lemon","lichen","lime","linden","lobster",
  "lotus","mallet","maple","marble","marigold","marsh","meadow","melon","meteor","midnight",
  "millet","mint","mirror","mist","moose","moss","mulberry","nectar","nimbus","oak",
  "ocean","onyx","opal","orchid","osprey","otter","owl","pearl","pebble","pelican",
  "pepper","piano","pigeon","pine","pioneer","poppy","prairie","puffin","quartz","quince",
  "rain","raven","reef","reed","ridge","river","robin","rose","ruby","saffron",
  "sage","salmon","sapphire","scarlet","sequoia","shadow","silver","slate","sparrow","spruce",
  "starling","stone","stream","summit","sunset","swallow","sycamore","tamarack","tangerine","teal",
  "thicket","thistle","thorn","thunder","tiger","timber","topaz","trout","tulip","turtle",
  "valley","velvet","violet","walnut","walrus","whisper","willow","winter","wolf","wren"
];

const arg = process.argv.slice(2).join(" ").trim();
const passphrase = arg || generatePassphrase(6);
const hash = hashPassword(passphrase);

console.log("");
console.log("  Passphrase: " + passphrase);
console.log("  ADMIN_PASSWORD_HASH=" + hash);
console.log("");
console.log("  → Add ADMIN_PASSWORD_HASH to .env.local AND Netlify env vars.");
console.log("  → Remove the old ADMIN_PASSWORD value once the hash is set.");
console.log("  → Share the passphrase with staff out-of-band (1Password, Signal, etc.).");
console.log("");

function generatePassphrase(wordCount) {
  const picked = [];
  for (let i = 0; i < wordCount; i++) {
    picked.push(WORDS[randomInt(0, WORDS.length)]);
  }
  return picked.join("-");
}

function hashPassword(plaintext) {
  const salt = randomBytes(16);
  const hash = scryptSync(plaintext, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}
