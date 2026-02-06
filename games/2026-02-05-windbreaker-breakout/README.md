# Windbreaker Breakout

A classic brick breaker with a twist: periodic gusts of wind nudge the ball sideways, forcing you to adjust your paddle timing.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

## Controls

- Move: Arrow keys or A/D
- Launch ball: Space
- Pause: P
- Restart: R

## Rules

- Clear every brick to win.
- Lose a life if the ball falls below the paddle.
- Stronger bricks in the top rows take two hits.

## Twist

Every five seconds the wind target changes. The gust now eases in smoothly and the HUD includes a countdown to the next shift.

## Improvements in this revision

- Smoothed wind transitions to reduce sudden unfair trajectory changes.
- Added a next-shift countdown for better anticipation.
- Improved brick bounce response with side/top collision normals.
- Added score-based speed ramp so late-game play feels faster.

## Self-check

```bash
npm run check
```

## Known issues

- No sound effects yet.
- Only one level layout is currently available.

## Next steps

- Add multiple level patterns and procedural sets.
- Introduce power-ups like sticky paddle or multi-ball.
- Add sound and particle effects for brick hits.
