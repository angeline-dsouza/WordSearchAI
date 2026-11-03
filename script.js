const SIZE = 10;
let grid = [], cellEls = [], words = [], steps = [], stepIndex = 0;
let timer = null, running = false, paused = false, lastResult = null;
let prevActive = null, prevPath = [];
const $ = id => document.getElementById(id);
const rand = n => Math.floor(Math.random() * n);

/* ----- Words ----- */
function parseWords() {
  const raw = $('wordsInput').value.toUpperCase().split(/[\s,;]+/);
  const valid = [], ignored = [];
  for (const w of raw) {
    if (!w) continue;
    if (!/^[A-Z]+$/.test(w)) ignored.push(w + ' (letters only)');
    else if (w.length < 2) ignored.push(w + ' (too short)');
    else if (w.length > SIZE) ignored.push(w + ' (longer than grid)');
    else if (!valid.includes(w)) valid.push(w);
  }
  return { valid: valid, ignored: ignored };
}

function renderWordList() {
  const p = parseWords();
  words = p.valid;
  $('wordList').innerHTML = words.map(w => '<li id="word-' + w + '">' + w + '</li>').join('');
  showMessage(p.ignored.length ? 'Ignored: ' + p.ignored.join(', ') : '');
}

function showMessage(text) { $('message').textContent = text; }

/* ----- Grid ----- */
function makeGrid(wordList) {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
  const failed = [];
  for (const w of wordList) {            // hide each word in a random direction
    let placed = false;
    for (let t = 0; t < 200 && !placed; t++) {
      const d = DIRECTIONS[rand(8)], r = rand(SIZE), c = rand(SIZE);
      const er = r + d[0] * (w.length - 1), ec = c + d[1] * (w.length - 1);
      if (er < 0 || ec < 0 || er >= SIZE || ec >= SIZE) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const ch = g[r + d[0] * i][c + d[1] * i];
        if (ch !== '' && ch !== w[i]) ok = false;
      }
      if (!ok) continue;
      for (let i = 0; i < w.length; i++) g[r + d[0] * i][c + d[1] * i] = w[i];
      placed = true;
    }
    if (!placed) failed.push(w);
  }
  for (let r = 0; r < SIZE; r++)         // fill the rest with random letters
    for (let c = 0; c < SIZE; c++)
      if (g[r][c] === '') g[r][c] = String.fromCharCode(65 + rand(26));
  return { g: g, failed: failed };
}

function renderGrid() {
  const el = $('grid');
  el.innerHTML = '';
  cellEls = [];
  for (let r = 0; r < SIZE; r++) {
    cellEls.push([]);
    for (let c = 0; c < SIZE; c++) {
      const d = document.createElement('div');
      d.className = 'cell';
      d.textContent = grid[r][c];
      el.appendChild(d);
      cellEls[r].push(d);
    }
  }
}

function generateGrid() {
  resetAll();
  renderWordList();
  const result = makeGrid(words);
  grid = result.g;
  renderGrid();
  if (result.failed.length) showMessage('Could not place: ' + result.failed.join(', '));
}

/* ----- Reset ----- */
function clearHighlights() {
  for (const row of cellEls)
    for (const d of row) d.classList.remove('explored', 'path', 'active', 'found');
  prevActive = null; prevPath = [];
  for (const li of document.querySelectorAll('#wordList li')) li.classList.remove('found', 'missing');
  for (const id of ['sTotal', 'sFound', 'sMissing', 'sExplored', 'sTime']) $(id).textContent = '-';
  $('compareBody').innerHTML = '';
}

function resetAll() {
  clearTimeout(timer);
  running = false; paused = false;
  $('pauseBtn').textContent = 'Pause';
  clearHighlights();
}

/* ----- Animation ----- */
function applyStep(s) {
  if (prevActive) prevActive.classList.remove('active');
  for (const p of prevPath) cellEls[p[0]][p[1]].classList.remove('path');
  if (s.found) {
    for (const p of s.cells) cellEls[p[0]][p[1]].classList.add('found');
    $('word-' + s.found).classList.add('found');
    prevActive = null; prevPath = [];
    return;
  }
  cellEls[s.r][s.c].classList.add('explored');
  for (const p of s.path) cellEls[p[0]][p[1]].classList.add('path');
  prevActive = cellEls[s.r][s.c];
  prevActive.classList.add('active');
  prevPath = s.path;
}

function tick() {
  if (paused) return;
  const speed = Number($('speed').value);               // 1 (slow) .. 10 (fast)
  const delay = Math.round(500 / (speed * speed));
  const batch = speed >= 8 ? (speed - 6) * 3 : 1;
  for (let i = 0; i < batch && stepIndex < steps.length; i++) applyStep(steps[stepIndex++]);
  $('sExplored').textContent = stepIndex;
  if (stepIndex < steps.length) timer = setTimeout(tick, delay);  // keeps browser responsive
  else finish();
}

function finish() {
  running = false;
  if (prevActive) prevActive.classList.remove('active');
  for (const p of prevPath) cellEls[p[0]][p[1]].classList.remove('path');
  const a = lastResult.withTrie, b = lastResult.noTrie;
  const found = Object.keys(a.res.found).length;
  for (const w of words) if (!a.res.found[w]) $('word-' + w).classList.add('missing');
  $('sTotal').textContent = words.length;
  $('sFound').textContent = found;
  $('sMissing').textContent = words.length - found;
  $('sExplored').textContent = a.res.explored;
  $('sTime').textContent = a.ms.toFixed(3) + ' ms';
  const row = (name, x) => '<tr><td>' + name + '</td><td>' + x.ms.toFixed(3) + ' ms</td><td>' +
    x.res.explored + '</td><td>' + Object.keys(x.res.found).length + '</td></tr>';
  $('compareBody').innerHTML = row('DFS without Trie', b) + row('DFS with Trie', a);
}

function timeIt(fn, runs) {
  const t0 = performance.now();
  let res;
  for (let i = 0; i < runs; i++) res = fn();
  return { res: res, ms: (performance.now() - t0) / runs };   // average per run
}

/* ----- Buttons ----- */
function solvePuzzle() {
  if (running) return;
  clearHighlights();
  renderWordList();
  if (words.length === 0) { showMessage('Enter at least one valid word (letters only, 2-10 letters).'); return; }
  const trie = new Trie();
  for (const w of words) trie.insert(w);
  // Same grid + same words for both algorithms; time = average of 100 runs
  const withTrie = timeIt(() => solveWithTrie(grid, trie, false), 100);
  const noTrie = timeIt(() => solveWithoutTrie(grid, words, false), 100);
  lastResult = { withTrie: withTrie, noTrie: noTrie };
  steps = solveWithTrie(grid, trie, true).steps;        // recorded run, used for animation
  stepIndex = 0; running = true; paused = false;
  $('pauseBtn').textContent = 'Pause';
  tick();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  $('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
  if (paused) clearTimeout(timer); else tick();
}

$('newBtn').onclick = generateGrid;
$('solveBtn').onclick = solvePuzzle;
$('pauseBtn').onclick = togglePause;
$('resetBtn').onclick = resetAll;
$('wordsInput').oninput = function () { if (!running) renderWordList(); };
generateGrid();
