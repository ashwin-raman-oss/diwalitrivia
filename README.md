# Trivia Board

A Jeopardy-style board for a party TV. Full build spec: `SPEC.md`.

## Run it

```
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/, works offline and from any folder
npm run preview    # serve the built dist/
```

## Change the questions

Edit `public/questions.json` and refresh the page. Put images in `public/images/`
and reference them as `/images/name.png`. Missing images are listed on the setup
screen and those tiles fall back to text.

Naming convention: `[category]-[value]-q.png` (clue, text blocked out) and
`[category]-[value]-a.png` (full reveal). Keep category names short (under
about 20 characters) so they stay large on the board.

## Keys

| Key | Action |
|---|---|
| Space | Reveal answer |
| 1-4 | Team 1-4 got it (answer screen) |
| N | No one got it |
| Esc | Back to board (tile stays unused) |
| H | Show/hide host accept note |
| F | Full screen |
| Ctrl/Cmd+Z | Undo |

Game state is saved in the browser's localStorage after every action.

## Live site

Every push to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`) at https://ashwin-raman-oss.github.io/diwalitrivia/.
One-time setup: repo Settings → Pages → Source: **GitHub Actions**.
