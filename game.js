// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Player
const player = { 
    x: 100, 
    y: canvas.height - 60, // start 60px above bottom
    w: 30, 
    h: 30, 
    vy: 0, 
    onGround: false, 
    z: 0 
};

// Gravity & jump
const gravity = 0.6;
const jumpStrength = -12;

// Keys
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Scroll to shift slices
window.addEventListener('wheel', e => {
    player.z += Math.sign(e.deltaY);
    if (player.z < 0) player.z = 0;
    if (player.z > 2) player.z = 2;
});

// Platforms (dynamic based on canvas height)
let platforms = [
    {x: 0, y: canvas.height - 20, w: canvas.width, h: 20, z: 0},
    {x: 200, y: canvas.height - 100, w: 100, h: 20, z: 0},
    {x: 400, y: canvas.height - 150, w: 150, h: 20, z: 1},
    {x: 150, y: canvas.height - 200, w: 100, h: 20, z: 1},
    {x: 350, y: canvas.height - 250, w: 200, h: 20, z: 2},
];

// Update function
function update() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a']) player.x -= 5;
    if (keys['ArrowRight'] || keys['d']) player.x += 5;

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.vy = jumpStrength;
        player.onGround = false;
    }

    // Apply gravity
    player.vy += gravity;
    player.y += player.vy;

    // Collision detection (current slice only)
    player.onGround = false;
    platforms.forEach(p => {
        if (p.z === player.z &&
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

    // Draw platforms
    platforms.forEach(p => {
        if (p.z === player.z) {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(p.x, p.y, p.w, p.h);
        } else {
            ctx.fillStyle = 'rgba(0,255,0,0.1)'; // faint preview
            ctx.fillRect(p.x, p.y, p.w, p.h);
        }
    });

    // Draw player
    ctx.fillStyle = '#ff0';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Slice info
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Slice Z: ' + player.z, 10, 30);
}

// Start game
update();
