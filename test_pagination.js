import fetch from 'node-fetch';

async function testBackend() {
    const url1 = 'http://localhost:3000/orders?page=1&limit=5';
    const url2 = 'http://localhost:3000/orders?page=2&limit=5';

    try {
        const r1 = await fetch(url1).then(r => r.json());
        const r2 = await fetch(url2).then(r => r.json());

        console.log("Page 1 orders IDs:", r1.data.map(o => o.id));
        console.log("Page 2 orders IDs:", r2.data.map(o => o.id));
    } catch (e) {
        console.error(e);
    }
}

testBackend();
