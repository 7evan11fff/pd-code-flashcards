(function () {
  "use strict";

  const STORAGE_KEY = "pd-flashcards.v1";
  const DECK_KEYS = Object.keys(DATA);
  const ALL_KEY = "all";

  const state = loadState();

  // ---------- Persistence ----------
  function defaultState() {
    return {
      deck: "10-codes",
      direction: "code",   // "code" | "meaning" | "mixed"
      order: "sequential", // "sequential" | "shuffle"
      filter: "all",       // "all" | "unknown"
      index: 0,
      known: {},           // { deckKey: { cardId: true } }
      seed: Date.now()
    };
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (_) {
      return defaultState();
    }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  // ---------- Deck helpers ----------
  function buildAllDeck() {
    const cards = [];
    for (const key of DECK_KEYS) {
      for (const c of DATA[key].cards) cards.push(Object.assign({ _deck: key }, c));
    }
    return { label: "All Decks", description: "Every code combined.", cards };
  }

  function getDeck(key) {
    if (key === ALL_KEY) return buildAllDeck();
    const d = DATA[key];
    return { label: d.label, description: d.description,
             cards: d.cards.map(c => Object.assign({ _deck: key }, c)) };
  }

  function cardId(card) {
    return (card._deck || state.deck) + "::" + card.code;
  }

  function isKnown(card) {
    const k = state.known[card._deck || state.deck] || {};
    return !!k[card.code];
  }

  function setKnown(card, val) {
    const dk = card._deck || state.deck;
    if (!state.known[dk]) state.known[dk] = {};
    if (val) state.known[dk][card.code] = true;
    else delete state.known[dk][card.code];
    saveState();
  }

  // Deterministic shuffle so order is stable per session
  function seededShuffle(arr, seed) {
    const a = arr.slice();
    let s = seed >>> 0;
    function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    }
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function currentCards() {
    const deck = getDeck(state.deck);
    let cards = deck.cards;
    if (state.filter === "unknown") cards = cards.filter(c => !isKnown(c));
    if (state.order === "shuffle") cards = seededShuffle(cards, state.seed);
    return cards;
  }

  // ---------- Rendering ----------
  const els = {
    deckChips: document.getElementById("deck-chips"),
    chips: document.querySelectorAll(".chip[data-direction], .chip[data-order], .chip[data-filter]"),
    flashcard: document.getElementById("flashcard"),
    frontLabel: document.getElementById("front-label"),
    frontValue: document.getElementById("front-value"),
    backLabel: document.getElementById("back-label"),
    backValue: document.getElementById("back-value"),
    backNotes: document.getElementById("back-notes"),
    pos: document.getElementById("pos"),
    len: document.getElementById("len"),
    fill: document.getElementById("progress-fill"),
    statKnown: document.getElementById("stat-known"),
    statTotal: document.getElementById("stat-total"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnFlip: document.getElementById("btn-flip"),
    btnKnown: document.getElementById("btn-known"),
    btnLearning: document.getElementById("btn-learning"),
    btnReset: document.getElementById("reset-progress"),
    empty: document.getElementById("empty-state"),
    emptySwitch: document.getElementById("empty-switch")
  };

  function renderDeckChips() {
    const chips = [];
    chips.push(chipHTML(ALL_KEY, "All"));
    for (const k of DECK_KEYS) chips.push(chipHTML(k, DATA[k].label));
    els.deckChips.innerHTML = chips.join("");
    els.deckChips.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        state.deck = btn.dataset.deck;
        state.index = 0;
        state.seed = Date.now();
        saveState();
        renderAll();
      });
    });
  }
  function chipHTML(key, label) {
    return `<button class="chip" data-deck="${key}">${label}</button>`;
  }

  function setActiveChips() {
    els.deckChips.querySelectorAll(".chip").forEach(b => {
      b.classList.toggle("is-active", b.dataset.deck === state.deck);
    });
    els.chips.forEach(b => {
      const k = b.dataset.direction ? "direction"
              : b.dataset.order     ? "order"
              : b.dataset.filter    ? "filter"
              : null;
      if (!k) return;
      b.classList.toggle("is-active", b.dataset[k] === state[k]);
    });
  }

  function frontBackFor(card) {
    let showCode;
    if (state.direction === "code") showCode = true;
    else if (state.direction === "meaning") showCode = false;
    else {
      const h = hashStr(cardId(card));
      showCode = (h % 2) === 0;
    }
    return showCode
      ? { frontLabel: "CODE",    front: card.code,    backLabel: "MEANING", back: card.meaning }
      : { frontLabel: "MEANING", front: card.meaning, backLabel: "CODE",    back: card.code };
  }
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  function renderCard() {
    const cards = currentCards();
    const total = cards.length;
    els.len.textContent = total;

    if (total === 0) {
      els.empty.hidden = false;
      els.flashcard.style.visibility = "hidden";
      els.fill.style.width = "0%";
      els.pos.textContent = "0";
      return;
    }
    els.empty.hidden = true;
    els.flashcard.style.visibility = "visible";

    if (state.index >= total) state.index = 0;
    if (state.index < 0) state.index = total - 1;

    const card = cards[state.index];
    const fb = frontBackFor(card);

    els.frontLabel.textContent = fb.frontLabel;
    els.frontValue.textContent = fb.front;
    els.backLabel.textContent  = fb.backLabel;
    els.backValue.textContent  = fb.back;
    els.backNotes.textContent  = card.notes || "";

    els.flashcard.classList.remove("is-flipped");

    els.pos.textContent = (state.index + 1);
    els.fill.style.width = ((state.index + 1) / total * 100) + "%";

    // Update Known / Learning button state
    const known = isKnown(card);
    els.btnKnown.textContent = known ? "✓ Known" : "Got it";
    els.btnKnown.style.opacity = known ? "0.6" : "1";
  }

  function renderStats() {
    const deck = getDeck(state.deck);
    const total = deck.cards.length;
    let knownCount = 0;
    for (const c of deck.cards) if (isKnown(c)) knownCount++;
    els.statKnown.textContent = knownCount;
    els.statTotal.textContent = total;
  }

  function renderAll() {
    setActiveChips();
    renderCard();
    renderStats();
  }

  // ---------- Actions ----------
  function flip()       { els.flashcard.classList.toggle("is-flipped"); }
  function next()       { state.index += 1; saveState(); renderCard(); }
  function prev()       { state.index -= 1; saveState(); renderCard(); }
  function markKnown()  {
    const cards = currentCards();
    if (!cards.length) return;
    setKnown(cards[state.index], true);
    renderStats();
    // advance
    if (state.filter === "unknown") {
      // List shrinks; index stays, but clamp
      renderCard();
    } else {
      next();
    }
  }
  function markLearning() {
    const cards = currentCards();
    if (!cards.length) return;
    setKnown(cards[state.index], false);
    renderStats();
    next();
  }
  function resetProgress() {
    const deck = state.deck;
    if (deck === ALL_KEY) {
      if (!confirm("Reset progress for ALL decks?")) return;
      state.known = {};
    } else {
      if (!confirm(`Reset progress for "${DATA[deck].label}"?`)) return;
      state.known[deck] = {};
    }
    state.index = 0;
    saveState();
    renderAll();
  }

  // ---------- Events ----------
  function bindEvents() {
    els.flashcard.addEventListener("click", flip);
    els.flashcard.addEventListener("keydown", (e) => {
      if (e.key === "Enter") flip();
    });
    els.btnFlip.addEventListener("click", flip);
    els.btnPrev.addEventListener("click", prev);
    els.btnNext.addEventListener("click", next);
    els.btnKnown.addEventListener("click", markKnown);
    els.btnLearning.addEventListener("click", markLearning);
    els.btnReset.addEventListener("click", resetProgress);

    els.emptySwitch.addEventListener("click", () => {
      state.filter = "all";
      state.index = 0;
      saveState();
      renderAll();
    });

    els.chips.forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.direction) state.direction = btn.dataset.direction;
        if (btn.dataset.order)     {
          state.order = btn.dataset.order;
          if (state.order === "shuffle") state.seed = Date.now();
        }
        if (btn.dataset.filter)    state.filter = btn.dataset.filter;
        state.index = 0;
        saveState();
        renderAll();
      });
    });

    document.addEventListener("keydown", (e) => {
      // Ignore when typing in inputs
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault(); flip(); break;
        case "ArrowRight": e.preventDefault(); next(); break;
        case "ArrowLeft":  e.preventDefault(); prev(); break;
        case "k": case "K": markKnown(); break;
        case "l": case "L": markLearning(); break;
        case "s": case "S":
          state.order = state.order === "shuffle" ? "sequential" : "shuffle";
          if (state.order === "shuffle") state.seed = Date.now();
          state.index = 0;
          saveState();
          renderAll();
          break;
      }
    });
  }

  // ---------- Boot ----------
  function init() {
    renderDeckChips();
    bindEvents();
    renderAll();
  }
  init();
})();
