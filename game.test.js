
const fs = require("node:fs");

// vm (virtual machine) võimaldab JavaScripti koodi käivitada eraldi kontekstis.
// kontekst on oma muutujage
const vm = require("node:vm");

let passed = 0;
let failed = 0;

const source = fs.readFileSync(`${__dirname}/game.js`, "utf-8");

function equal(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Oodatud ${expected}, saadud ${actual}`);
    }
}

function test(name, check) {
    try {
        const window = {
            addEventListener() {}
        };
        const {game, KEYS} = vm.runInNewContext(`${source}\n({game,KEYS});`, {window});
check(game, KEYS);
passed++;

console.log(`OK ${name}`);
} catch (error) {
    failed++;
    process.exitCode = 1;
    console.error(`VIGA ${name}: ${error.message}`);
}
console.log(`Läbitud: ${passed}, ebaõnnestunud: ${failed}`);
}

test("Plokkide ehitamine", game => {
    game.create();

    equal(game.blocks.length, 32);
    equal(game.blocks.every(block => block.active === true), true);

    equal(game.blocks[0].x, 65);
    equal(game.blocks[0].y, 35);

    equal(game.blocks[31].x, 513);
    equal(game.blocks[31].y, 107);
});