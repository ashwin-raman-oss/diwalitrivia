# Trivia Board: Build Spec

Paste this whole file into Claude Code as the first message, or save it in the project root as `SPEC.md` and tell Claude Code to build from it.

---

## 1. What we are building

A Jeopardy-style trivia board for a house party, shown full screen on a TV from one laptop. The host clicks tiles, reveals answers, and awards points. Scores update live on the board.

- 10 categories x 5 tiles = 50 tiles
- Tile values: $100, $200, $300, $400, $500
- 2 to 4 teams
- Runs fully offline. No backend, no database, no login.

## 2. Tech stack

- Vite + React + TypeScript
- Plain CSS or CSS modules (no UI library needed)
- All content comes from one file: `public/questions.json`
- All images live in `public/images/`
- Game state saved to `localStorage` so a refresh never loses scores
- `npm run dev` for local use, `npm run build` for a static build that can open from any static host

## 3. Folder structure

```
trivia-board/
  public/
    questions.json
    images/
      (all question and answer images)
  src/
    App.tsx
    screens/
      SetupScreen.tsx
      BoardScreen.tsx
      QuestionScreen.tsx
      AnswerScreen.tsx
      FinalScreen.tsx
    components/
      Scoreboard.tsx
      Tile.tsx
    state/
      gameReducer.ts
      storage.ts
    types.ts
  SPEC.md
```

## 4. Content file: `public/questions.json`

The host edits this file to change any question. The app must never hardcode questions.

```json
{
  "title": "Trivia Night",
  "categories": [
    {
      "name": "Absolut Cities",
      "tiles": [
        {
          "value": 100,
          "question": "Name the city.",
          "answer": "Manhattan",
          "questionImage": "/images/absolut-manhattan-q.png",
          "answerImage": "/images/absolut-manhattan-a.png",
          "accept": "Accept New York",
          "funFact": "Central Park forms the bottle."
        }
      ]
    }
  ]
}
```

### Field rules

| Field | Required | Shown on | Notes |
|---|---|---|---|
| `value` | yes | board, question | 100 to 500 |
| `question` | yes | question screen | Can be short ("Name the city.") when the image carries the clue |
| `answer` | yes | answer screen | |
| `questionImage` | no | question screen | Version with text blocked out |
| `answerImage` | no | answer screen | Full version with the reveal |
| `accept` | no | answer screen, hidden by default | Host-only note on acceptable answers. Toggle with `H` |
| `funFact` | no | answer screen | Shown under the answer |

### Image fallback logic

- Question screen shows `questionImage` if present, otherwise text only.
- Answer screen shows `answerImage` if present. If there is no `answerImage` but there is a `questionImage`, show the `questionImage` again. Otherwise text only.

### Validation on startup

When the app loads, check every image path in `questions.json`. If any image fails to load, show a small warning banner on the setup screen listing the missing files. The game should still be playable.

## 5. Game rules (must be implemented exactly)

1. **Setup:** Host enters 2 to 4 team names in order. That order is the rotation.
2. **Picking:** Teams pick tiles in a fixed rotation (Team 1, Team 2, Team 3, Team 4, back to Team 1). The board always shows whose pick it is.
3. **Answering:** The team that picked answers first.
4. **Steals:** If that team is wrong, the question passes to the next team in rotation order. This continues until a team gets it right or every team has had one try.
5. **Scoring:** A correct answer earns the tile value. Wrong answers cost nothing. No negative scores from play.
6. **No one got it:** The tile closes with no points.
7. **Next pick:** After any tile closes, the pick moves to the next team after the team that picked, no matter who answered. Stealing does not change the rotation.
8. **No Daily Doubles, no Final Jeopardy.**
9. **End:** When all 50 tiles are used, show the final screen.

## 6. Screens

### 6.1 Setup screen
- Title from `questions.json`
- Inputs for 2 to 4 team names (add or remove team buttons)
- Missing-image warning banner if any
- "Start game" button
- If a saved game exists in `localStorage`, show "Resume game" and "New game" (New game asks for confirmation)

### 6.2 Board screen (the hub)
- 10 x 5 grid. Category names across the top, values down each column.
- Used tiles go dark and are not clickable.
- Scoreboard pinned along the bottom: each team's name and score, large and readable from across a room.
- The team whose pick it is gets a clear highlight and the label "Your pick".
- Small host controls in a corner: Undo, Adjust scores, Reset game.
- Must fit a 16:9 screen with no scrolling. Category names wrap to two lines if needed and shrink to fit rather than overflow.

### 6.3 Question screen
- Category name and value at the top
- `questionImage` large and centered if present, then the `question` text in large type
- Shows "Answering: [Team name]" so the room knows whose turn it is
- "Reveal answer" button (keyboard: `Space`)
- "Back to board" button that returns without using the tile (in case of a misclick)

### 6.4 Answer screen
- `answer` in very large type, with `answerImage` (or fallback) and `funFact`
- `accept` note hidden by default, toggled with `H`
- Still shows "Answering: [Team name]"
- Buttons:
  - **Correct**: awards the value to the current answering team, closes the tile, returns to board
  - **Wrong, pass to [next team name]**: moves the answer to the next team in rotation that has not tried yet. The button label always names who is next.
  - **No one got it**: closes the tile with no points, returns to board
- When every team has tried, the "Wrong, pass" button is replaced by "No one got it"
- Optional manual override: a row of small buttons, one per team, to award the points to any team (for when the room sorts it out loudly)

### 6.5 Final screen
- All teams ranked by score, winner highlighted
- Keep it warm, not game-showey. A simple "Thanks for playing" is enough.
- Buttons: "Back to board" (to review), "New game"

## 7. Host controls

- **Undo:** Reverts the last action (award, pass, or tile close). Supports multiple steps. Implement game state as a reducer with a history stack.
- **Adjust scores:** Small panel with +100 and -100 buttons per team, for disputes. This is the only way a score can go down.
- **Reset game:** Clears all state after a confirmation dialog.

## 8. Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Reveal answer (question screen) |
| `1` to `4` | Award points to team 1 to 4 (answer screen) |
| `W` | Wrong, pass to next team |
| `N` | No one got it |
| `Esc` | Back to board |
| `H` | Toggle host accept note |
| `F` | Toggle full screen |
| `Ctrl+Z` / `Cmd+Z` | Undo |

## 9. Visual design

- Built for a TV across a room: large type, high contrast, nothing small that matters.
- Images scale to fit the available space and keep their aspect ratio. Never crop or stretch.
- Smooth but quick transitions (under 300ms). Nothing that slows the host down.

### Theme: subtle rose

The board is a dark, warm, elegant base with rose used only as an accent. Rose should cover roughly 10% of any screen. It should read as refined, never cute.

**Palette (define as CSS variables in one place)**

| Token | Hex | Used for |
|---|---|---|
| `--bg` | `#17141A` | Page background (warm near-black) |
| `--tile` | `#2A2227` | Unused tiles (dark mauve-charcoal) |
| `--tile-hover` | `#362B31` | Tile hover state |
| `--tile-used` | `#1E1A1D` | Used tiles |
| `--text-used` | `#4A3F44` | Text on used tiles |
| `--text` | `#F5EEF0` | Primary text (warm off-white) |
| `--text-muted` | `#B8A9AE` | Secondary text, labels |
| `--rose` | `#E3A3AE` | Accent: tile values, current-pick highlight, thin underlines |
| `--rose-deep` | `#B5546B` | Primary buttons (Reveal, Correct) |
| `--rose-gold` | `#D9A69A` | Winner highlight on the final screen only |

**Where rose appears**
- Dollar values on unused tiles
- The "Your pick" highlight on the scoreboard (a rose border or underline, not a filled block)
- Primary action buttons
- A thin rose rule under each category name
- The winner's name on the final screen

**Where rose does not appear**
- Backgrounds, full-tile fills, or gradients
- No hearts, roses, florals, sparkles, or script fonts
- Secondary buttons ("Wrong, pass", "No one got it", "Back") use a neutral outline style in `--text-muted`

**Typography**
- One clean sans-serif (for example Inter or DM Sans) for everything
- Tile values and the answer text in a heavier weight, not a decorative font

## 10. State and persistence

Store in `localStorage` after every action:
- Team names and order
- Scores
- Used tiles
- Whose pick it is
- The current open tile and which teams have tried it
- Undo history (cap at 50 steps)

On load, offer to resume a saved game.

## 11. Acceptance checklist

The build is done when all of these are true:
- [ ] Editing `questions.json` changes the board without code changes
- [ ] A tile with both images shows the question image first, then the answer image
- [ ] A tile with only one image or no images still works
- [ ] Missing images show a warning but do not break the game
- [ ] Pick rotation never changes because of a steal
- [ ] Passing goes through every team once, then forces "No one got it"
- [ ] Undo correctly reverses awards, passes, and closed tiles
- [ ] Refreshing the browser mid-game keeps everything
- [ ] The whole board fits a 1920x1080 screen with no scrolling
- [ ] Works with no internet connection

## 12. Image naming convention

Use this pattern so files are easy to match to tiles:

```
[category]-[value]-q.png    question image (text blocked out)
[category]-[value]-a.png    answer image (full reveal)
```

Examples:
```
absolut-100-q.png
absolut-100-a.png
graphs-500-q.png
graphs-500-a.png
empires-300-q.png
```

## 13. First steps for Claude Code

1. Scaffold the Vite + React + TypeScript project with the folder structure above.
2. Create a `questions.json` with 10 placeholder categories and 50 placeholder tiles, including a few with sample images, so the board is testable immediately.
3. Build the reducer and game rules first, then the screens.
4. Run through the acceptance checklist and report anything that does not pass.
