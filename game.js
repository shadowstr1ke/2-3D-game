// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ensure full viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player object
const player = { x: 100, y: 500, w: 30, h: 30, vy: 0, onGround: false, z: 0 };

// Physics
const gravity = 0.6;
const jumpStrength = -12;

// Keys
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Scroll wheel to move slices
window.addEventListener('wheel', e => {
  player.z += Math.sign(e.deltaY);
  if (player.z < 0) player.z = 0;
  if (player.z > 2) player.z = 2;
});

// Platforms: x, y, width, height, z slice
const platforms = [
  {x: 0, y: canvas.height-20, w: canvas.width, h: 20, z: 0},
  {x: 200, y: 500, w: 100, h: 20, z: 0},
  {x: 400, y: 450, w: 150, h: 20, z: 1},
  {x: 150, y: 400, w: 100, h: 20, z: 1},
  {x: 350, y: 350, w: 200, h: 20, z: 2},
];

// Main game loop
function update() {
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

  // Collision with platforms in current slice
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

// Draw everything
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

// Start game loop
update();

// Optional: resize canvas when window resizes
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
