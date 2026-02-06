import "./style.css";
import {
  approach,
  clamp,
  circleRectCollision,
  collisionNormal,
  nextWind,
  reflectFromPaddle
} from "./logic";

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  hits: number;
  maxHits: number;
  color: string;
};

type GameState = {
  score: number;
  lives: number;
  launched: boolean;
  paused: boolean;
  gameOver: boolean;
  levelClear: boolean;
  wind: number;
  targetWind: number;
  windTimer: number;
  message: string;
};

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const scoreEl = document.querySelector<HTMLSpanElement>("#score");
const livesEl = document.querySelector<HTMLSpanElement>("#lives");
const windEl = document.querySelector<HTMLSpanElement>("#wind");

if (!canvas || !scoreEl || !livesEl || !windEl) {
  throw new Error("Missing UI elements");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Missing canvas context");
}

const state: GameState = {
  score: 0,
  lives: 3,
  launched: false,
  paused: false,
  gameOver: false,
  levelClear: false,
  wind: 0,
  targetWind: 0,
  windTimer: 0,
  message: "Press Space to launch"
};

const paddle = {
  x: canvas.width / 2 - 64,
  y: canvas.height - 40,
  w: 128,
  h: 14,
  speed: 520
};

const ball = {
  x: paddle.x + paddle.w / 2,
  y: paddle.y - 14,
  r: 10,
  vx: 0,
  vy: 0,
  baseSpeed: 330
};

const keys = new Set<string>();
let bricks: Brick[] = [];
let lastTime = 0;

function buildBricks(): Brick[] {
  const rows = 5;
  const cols = 9;
  const padding = 12;
  const offsetTop = 80;
  const offsetLeft = 40;
  const brickWidth = (canvas.width - offsetLeft * 2 - padding * (cols - 1)) / cols;
  const brickHeight = 26;
  const palette = ["#ff7b72", "#ffa657", "#ffd27f", "#7ee787", "#79c0ff"];

  const result: Brick[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const maxHits = row < 2 ? 2 : 1;
      result.push({
        x: offsetLeft + col * (brickWidth + padding),
        y: offsetTop + row * (brickHeight + padding),
        w: brickWidth,
        h: brickHeight,
        hits: 0,
        maxHits,
        color: palette[row]
      });
    }
  }
  return result;
}

function resetBall(): void {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r - 4;
  ball.vx = 0;
  ball.vy = 0;
  state.launched = false;
  if (!state.paused) {
    state.message = "Press Space to launch";
  }
}

function resetGame(): void {
  state.score = 0;
  state.lives = 3;
  state.wind = 0;
  state.targetWind = 0;
  state.windTimer = 0;
  state.paused = false;
  state.gameOver = false;
  state.levelClear = false;
  state.message = "Press Space to launch";
  bricks = buildBricks();
  resetBall();
}

function loseLife(): void {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.message = "Out of lives! Press R to restart.";
    state.paused = true;
    state.gameOver = true;
    state.launched = false;
    return;
  }
  state.message = "Life lost. Press Space to relaunch.";
  resetBall();
}

function update(dt: number): void {
  const moveDir =
    (keys.has("ArrowLeft") || keys.has("a") || keys.has("A") ? -1 : 0) +
    (keys.has("ArrowRight") || keys.has("d") || keys.has("D") ? 1 : 0);

  paddle.x += moveDir * paddle.speed * dt;
  paddle.x = clamp(paddle.x, 20, canvas.width - paddle.w - 20);

  if (state.paused) {
    return;
  }

  if (!state.launched) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 4;
    return;
  }

  state.windTimer += dt;
  if (state.windTimer >= 5) {
    state.windTimer = 0;
    state.targetWind = nextWind();
  }

  state.wind = approach(state.wind, state.targetWind, dt * 0.75);

  ball.vx += state.wind * dt * 14;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + ball.r > canvas.width) {
    ball.x = canvas.width - ball.r;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
  }

  if (ball.y - ball.r > canvas.height) {
    loseLife();
    return;
  }

  if (
    ball.vy > 0 &&
    circleRectCollision(
      { x: ball.x, y: ball.y, r: ball.r },
      { x: paddle.x, y: paddle.y, w: paddle.w, h: paddle.h }
    )
  ) {
    const reflected = reflectFromPaddle(ball, paddle, ball.baseSpeed + Math.min(120, state.score / 8));
    ball.vx = reflected.x;
    ball.vy = reflected.y;
    ball.y = paddle.y - ball.r - 0.2;
  }

  for (const brick of bricks) {
    if (
      circleRectCollision(
        { x: ball.x, y: ball.y, r: ball.r },
        { x: brick.x, y: brick.y, w: brick.w, h: brick.h }
      )
    ) {
      brick.hits += 1;
      if (collisionNormal({ x: ball.x, y: ball.y }, brick) === "horizontal") {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }
      state.score += 50 * brick.maxHits;
      break;
    }
  }

  bricks = bricks.filter((brick) => brick.hits < brick.maxHits);

  if (bricks.length === 0) {
    state.message = "All clear! Press R to play again.";
    state.paused = true;
    state.levelClear = true;
    state.launched = false;
  }
}

function draw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0a0f18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111c2c";
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#f0f6fc";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#58a6ff";
  ctx.fill();

  bricks.forEach((brick) => {
    ctx.fillStyle = brick.hits > 0 ? "#30363d" : brick.color;
    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
  });

  const nextShift = Math.max(0, 5 - state.windTimer);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText(`Wind: ${state.wind.toFixed(1)}  Next shift: ${nextShift.toFixed(1)}s`, 32, canvas.height - 20);

  if (state.message) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, canvas.height / 2 - 42, canvas.width, 84);
    ctx.fillStyle = "#f0f6fc";
    ctx.textAlign = "center";
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.fillText(state.message, canvas.width / 2, canvas.height / 2 + 8);
    ctx.textAlign = "left";
  }
}

function loop(timestamp: number): void {
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  update(Math.min(delta, 0.05));
  draw();
  updateHud();
  requestAnimationFrame(loop);
}

function updateHud(): void {
  scoreEl.textContent = state.score.toString();
  livesEl.textContent = state.lives.toString();
  windEl.textContent = state.wind.toFixed(1);
}

function handleKeyDown(event: KeyboardEvent): void {
  keys.add(event.key);
  if (event.key === " ") {
    if (!state.launched && !state.paused && !state.gameOver && !state.levelClear) {
      state.launched = true;
      state.message = "";
      const reflected = reflectFromPaddle(ball, paddle, ball.baseSpeed);
      ball.vx = reflected.x;
      ball.vy = reflected.y;
    }
    event.preventDefault();
  }

  if (event.key === "p" || event.key === "P") {
    if (state.gameOver || state.levelClear) {
      return;
    }
    state.paused = !state.paused;
    if (state.paused) {
      state.message = "Paused";
    } else if (!state.launched) {
      state.message = "Press Space to launch";
    } else {
      state.message = "";
    }
  }

  if (event.key === "r" || event.key === "R") {
    resetGame();
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  keys.delete(event.key);
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

resetGame();
requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  loop(timestamp);
});
