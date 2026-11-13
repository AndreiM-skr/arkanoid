
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

// =====================================
// TEST 2
// Ühe punkti lisamine ei lõpeta mängu, kui plokke on veel alles.
// =====================================

test("Punkti lisamine", game => {
    game.create();
    let endings = 0;
    game.end = () => {
        endings++;
    };
    game.addScore();
    equal(game.score, 1);
    equal(endings, 0);
});

// 3. Viimane punkt kutsub mängu lõpetamise välja täpselt ühe korra.

test("Võit / Победа", game => {
    game.create();
    game.score = 31;
    let endings = 0;
    game.end = () => {
        endings++;
    };
    game.addScore();
    equal(game.score, 32);
    equal(endings, 1);
});

// =====================================
// TEST 4
// Pall liigub mõlemas suunas vastavalt dx ja dy väärtustele.
// =====================================

test("Palli liikumine", game => {
    game.ball.dx = 2;
    game.ball.dy = -3;

    game.ball.move();

    equal(game.ball.x, 322);
    equal(game.ball.y, 277);
});

// =====================================
// TEST 5
// Nullkiirusega pall jääb paigale.
// =====================================

test("Paigal olev pall", game => {
    game.ball.move();
    equal(game.ball.x, 320);
    equal(game.ball.y, 280);
});

// =====================================
// TEST 6
// Plokid põrkuvad.
// =====================================

test("Kokkupõrge", game => {
    const block = {
        x: 330,
        y: 290,
        width: 60,
        height: 20
    };
    equal(game.ball.collide(block), true);
});

// =====================================
// TEST 7
// Üksteisest kaugel olevad plokid ei põrku.
// =====================================

test("Kokkupõrget pole", game => {
    const block = {
        x: 10,
        y: 10,
        width: 60,
        height: 20
    };

    equal(game.ball.collide(block), false);
});

