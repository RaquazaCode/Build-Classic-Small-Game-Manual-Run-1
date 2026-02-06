import { approach, circleRectCollision, clamp, collisionNormal, nextWind, reflectFromPaddle } from "../src/logic";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Self-check failed: ${message}`);
  }
}

assert(clamp(5, 0, 3) === 3, "clamp should cap at max");
assert(clamp(-2, 0, 3) === 0, "clamp should raise to min");

const hit = circleRectCollision({ x: 5, y: 5, r: 3 }, { x: 4, y: 4, w: 4, h: 4 });
const miss = circleRectCollision({ x: 20, y: 20, r: 2 }, { x: 0, y: 0, w: 4, h: 4 });
assert(hit, "collision should be detected");
assert(!miss, "collision should be false when far away");

const reflected = reflectFromPaddle({ x: 50, y: 0 }, { x: 0, w: 100 }, 10);
assert(reflected.y < 0, "paddle reflection should send the ball upward");

assert(collisionNormal({ x: 9, y: 3 }, { x: 0, y: 0, w: 10, h: 20 }) === "horizontal", "normal should detect side hits");
assert(collisionNormal({ x: 5, y: 1 }, { x: 0, y: 0, w: 10, h: 20 }) === "vertical", "normal should detect top/bottom hits");

const positiveWind = nextWind(() => 0.9);
const negativeWind = nextWind(() => 0.1);
assert(positiveWind > 0, "high random seed should produce positive wind");
assert(negativeWind < 0, "low random seed should produce negative wind");

assert(approach(0, 1, 0.3) === 0.3, "approach should move toward positive target");
assert(approach(1, 0, 0.2) === 0.8, "approach should move toward negative target");

console.log("Self-check passed.");
