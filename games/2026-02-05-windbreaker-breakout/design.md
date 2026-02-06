# Windbreaker Breakout - Design

## Goal
Clear all bricks while managing wind gusts that push the ball sideways.

## Mechanics
- Paddle moves horizontally across the bottom of the playfield.
- Ball bounces off walls, paddle, and bricks.
- Wind target changes every few seconds and eases toward the new value.
- Top-row bricks take two hits.
- Ball speed ramps slightly with score.

## Controls
- Arrow keys / A-D to move.
- Space to launch.
- P to pause.
- R to restart.

## Scoring
- 50 points per brick, doubled for tougher bricks.

## Fail states
- Lose a life when the ball drops below the paddle.
- Game ends after all lives are lost.

## Twist
Wind gusts periodically change direction and strength, with a visible countdown to the next shift.

## Done means
- Game is playable in the browser.
- Score and lives update correctly.
- Restart works.
- Wind behavior is readable and feels fair.
