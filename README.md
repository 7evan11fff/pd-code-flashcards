# PD Code Flashcards

A zero-dependency, single-page flashcard web app for memorizing US law-enforcement
radio codes: **10-codes**, **11-codes**, **signal codes**, and the **NATO phonetic alphabet**.

> Codes vary by agency. This is the common APCO / industry reference set
> compiled from [zipscanners.com/blogs/learn/police-codes](https://www.zipscanners.com/blogs/learn/police-codes).
> Use as a study reference only.

## Features

- 4 decks + an "All decks" combined view (~190+ cards total)
- Direction modes: **Code → Meaning**, **Meaning → Code**, or **Mixed**
- **Sequential** or **Shuffled** order (deterministic per session)
- Filter to **Still learning** to drill weak cards
- Per-card "Got it" / "Still learning" tracking with **localStorage** persistence
- Smooth 3D flip animation, keyboard-first UX
- Fully responsive (works great on phone)
- No build step, no framework, no dependencies

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Flip card |
| `←` / `→` | Previous / next |
| `K` | Mark **known** |
| `L` | Mark **still learning** |
| `S` | Toggle shuffle |

## Run it

It's a static site — just open the file:

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup + layout |
| `styles.css` | Dark dispatch-themed UI |
| `app.js` | State machine, rendering, persistence, hotkeys |
| `data.js` | All code data (single source of truth) |

## Adding / editing codes

Edit `data.js`. Each deck has the shape:

```js
{
  label: "10-Codes",
  description: "...",
  cards: [
    { code: "10-4", meaning: "Acknowledgment (OK)", notes: "Most famous" },
    ...
  ]
}
```

## License

MIT — data sourced from a public reference page; meanings are public-domain shorthand
used across US public-safety radio.
