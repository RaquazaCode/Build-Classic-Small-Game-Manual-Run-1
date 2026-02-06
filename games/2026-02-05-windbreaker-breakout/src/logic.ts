export type Vector = { x: number; y: number };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function circleRectCollision(
  circle: { x: number; y: number; r: number },
  rect: { x: number; y: number; w: number; h: number }
): boolean {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

export function collisionNormal(
  ball: { x: number; y: number },
  rect: { x: number; y: number; w: number; h: number }
): "horizontal" | "vertical" {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const px = rect.w / 2 - Math.abs(dx);
  const py = rect.h / 2 - Math.abs(dy);
  return px < py ? "horizontal" : "vertical";
}

export function reflectFromPaddle(
  ball: Vector,
  paddle: { x: number; w: number },
  speed: number
): Vector {
  const relative = clamp((ball.x - paddle.x) / paddle.w, 0, 1);
  const angle = -Math.PI / 3 + (relative * (Math.PI * 2)) / 3;
  return {
    x: Math.sin(angle) * speed,
    y: -Math.cos(angle) * speed
  };
}

export function nextWind(rand: () => number = Math.random): number {
  const direction = rand() > 0.5 ? 1 : -1;
  const magnitude = 0.35 + rand() * 1.75;
  return direction * magnitude;
}

export function approach(current: number, target: number, delta: number): number {
  if (current < target) {
    return Math.min(current + delta, target);
  }
  return Math.max(current - delta, target);
}
