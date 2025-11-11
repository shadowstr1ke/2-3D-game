const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = { x: 100, y: 500, w: 30, h: 30, vy: 0, onGround: false, z: 0 };

// Gravity & jump
const gravity = 0.6;
const jumpStrength = -12;

// Key handling
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Scroll to shift slices
window.addEventListener('wheel', e => {
  player.z += Math.sign(e.deltaY); // move z by ±1
  if (player.z < 0) player.z = 0;
  if (player.z > 2) player.z = 2; // max slices
});

// Define platforms with slice info
// Each platform: x, y, width, height, z slice
const platforms = [
  {x: 0, y: 580, w: 800, h: 20, z: 0},
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

  // Apply gravity
  player.vy += gravity;
  player.y += player.vy;

  // Collision detection (only with current slice)
  player.onGround = false;
  platforms.forEach(p
