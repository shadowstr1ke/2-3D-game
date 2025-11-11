// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Player
const startPos = { x: 100, y: canvas.height - 60, z: 0 };
const player = { ...startPos, w: 30, h: 30, vy: 0, onGround: false, targetZ: 0 };

// Gravity & jump
const gravity = 0.6;
const jumpStrength = -12;

// Keys
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Scroll to shift slices
window.addEventListener('wheel', e => {
    player.targetZ += Math.sign(e.deltaY);
    if (player.targetZ < 0) player.targetZ = 0;
    if (player.targetZ > 2) player.targetZ = 2;
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    player.x = startPos.x;
    player.y = startPos.y;
    player.vy = 0;
    player.z = startPos.z;
    player.targetZ = startPos.z;
});

// Platforms (dynamic based on canvas height)
let platforms = [
    {x: 0, y: canvas.height - 20, w: canvas.width, h: 20, z: 0},
    {x: 200, y: canvas.height - 100, w: 100, h: 20, z: 0},
    {x: 400, y: canvas.height - 150, w: 150, h: 20, z: 1},
    {x: 150, y: canvas.height - 200, w: 100, h: 20, z: 1},
    {x: 350, y: canvas.height - 250, w: 200, h: 20, z: 2},
];

// Main game loop
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

    // Collision detection (closest slice)
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

    draw();
    requestAnimationFrame(update);
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    platforms.forEach(p => {
        // Scale platforms based on Z distance
        const dz = Math.abs(p.z - player.z);
        const scale = 1 - dz * 0.3;
        ctx.fillStyle = (Math.round(p.z) === Math.round(player.z)) ? '#0f0' : 'rgba(0,255,0,0.1)';
        ctx.fillRect(
            p.x + (1 - scale) * canvas.width/2,
            p.y + (1 - scale) * canvas.height/2,
            p.w * scale,
            p.h * scale
        );
    });

    // Draw player with slight scaling based on fractional Z
    const playerScale = 1 - (player.z - Math.floor(player.z)) * 0.2;
    ctx.fillStyle = '#ff0';
    ctx.fillRect(player.x, player.y, player.w * playerScale, player.h * playerScale);

    // Slice info
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Slice Z: ' + player.z.toFixed(2), 10, 30);
}

update();
