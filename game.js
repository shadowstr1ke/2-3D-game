const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Player
const startPos = { x: 100, y: canvasHeight - 60, z: 0 };
const player = { ...startPos, w: 30, h: 30, vy: 0, onGround: false, targetZ: 0 };

// Physics
const gravity = 0.6;
const jumpStrength = -12;

// Keys
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Scroll to change slices
window.addEventListener('wheel', e => {
    player.targetZ += Math.sign(e.deltaY);
    if (player.targetZ < 0) player.targetZ = 0;
    if (player.targetZ > 5) player.targetZ = 5;
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    player.x = startPos.x;
    player.y = startPos.y;
    player.vy = 0;
    player.z = startPos.z;
    player.targetZ = startPos.z;
    items.forEach(it => it.collected = false);
});

// Platforms & hidden items
let platforms = [];
for (let z = 0; z <= 5; z++) {
    platforms.push({ x: 0, y: canvasHeight - 20, w: canvasWidth, h: 20, z }); // ground
}
platforms.push({x: 200, y: canvasHeight - 100, w: 100, h: 20, z: 0});
platforms.push({x: 400, y: canvasHeight - 150, w: 150, h: 20, z: 1});
platforms.push({x: 150, y: canvasHeight - 200, w: 100, h: 20, z: 2});
platforms.push({x: 350, y: canvasHeight - 250, w: 200, h: 20, z: 3});
platforms.push({x: 500, y: canvasHeight - 300, w: 100, h: 20, z: 4});
platforms.push({x: 600, y: canvasHeight - 350, w: 120, h: 20, z: 5});

let items = [
    {x: 420, y: canvasHeight - 180, w: 20, h: 20, z: 1, collected: false},
    {x: 520, y: canvasHeight - 320, w: 20, h: 20, z: 4, collected: false},
    {x: 650, y: canvasHeight - 370, w: 20, h: 20, z: 5, collected: false}
];

// Background parallax layers
const bgLayers = [
    {color: '#111', speed: 0.1}, 
    {color: '#222', speed: 0.2}, 
    {color: '#333', speed: 0.4}
];

// Game loop
function update() {
    // Smooth Z transition
    player.z += (player.targetZ - player.z) * 0.1;

    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a']) player.x -= 5;
    if (keys['ArrowRight'] || keys['d']) player.x += 5;

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.vy = jumpStrength;
        player.onGround = false;
    }

    // Gravity
    player.vy += gravity;
    player.y += player.vy;

    // Collision
    player.onGround = false;
    platforms.forEach(p => {
        if (Math.round(p.z) === Math.round(player.z) &&
            player.x + player.w > p.x &&
            player.x < p.x + p.w &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + p.h + player.vy) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    });

    // Collect items
    items.forEach(it => {
        if (!it.collected && Math.round(it.z) === Math.round(player.z) &&
            player.x + player.w > it.x &&
            player.x < it.x + it.w &&
            player.y + player.h > it.y &&
            player.y < it.y + it.h) {
            it.collected = true;
        }
    });

    draw();
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw parallax background
    bgLayers.forEach(layer => {
        const offset = -player.x * layer.speed % canvasWidth;
        ctx.fillStyle = layer.color;
        ctx.fillRect(offset, 0, canvasWidth, canvasHeight);
        if (offset < canvasWidth) ctx.fillRect(offset + canvasWidth, 0, canvasWidth, canvasHeight);
    });

    // Draw platforms with ghost previews
    platforms.forEach(p => {
        const dz = Math.abs(p.z - player.z);
        const scale = 1 - dz * 0.3;
        let opacity = (Math.round(p.z) === Math.round(player.z)) ? 1 : 0.05; // faint previews
        ctx.fillStyle = `rgba(0,255,0,${opacity})`;
        ctx.fillRect(
            p.x + (1 - scale) * canvasWidth/2,
            p.y + (1 - scale) * canvasHeight/2,
            p.w * scale,
            p.h * scale
        );
    });

    // Draw items
    items.forEach(it => {
        if (!it.collected && Math.round(it.z) === Math.round(player.z)) {
            ctx.fillStyle = '#0ff';
            ctx.fillRect(it.x, it.y, it.w, it.h);
        }
    });

    // Draw player
    const playerScale = 1 - (player.z - Math.floor(player.z)) * 0.2;
    ctx.fillStyle = '#ff0';
    ctx.fillRect(player.x, player.y, player.w * playerScale, player.h * playerScale);

    // Slice info
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Slice Z: ' + player.z.toFixed(2), 10, 30);
}

update();
