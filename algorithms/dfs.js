// The 8 directions as [rowChange, colChange]: up, down, left, right + 4 diagonals
const DIRECTIONS = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

function newContext(grid, record) {
  const visited = grid.map(row => row.map(() => false));
  return { visited: visited, explored: 0, found: {}, steps: record ? [] : null };
}

// Count one explored cell, and (only for animation runs) remember it as a step
function logStep(ctx, r, c, path) {
  ctx.explored++;
  if (ctx.steps) ctx.steps.push({ r: r, c: c, path: path.concat([[r, c]]) });
}

function recordFound(ctx, word, path) {
  const cells = path.map(p => [p[0], p[1]]);
  ctx.found[word] = cells;
  if (ctx.steps) ctx.steps.push({ found: word, cells: cells });
}

function outside(grid, r, c) {
  return r < 0 || c < 0 || r >= grid.length || c >= grid[0].length;
}

/* ---------- DFS WITH TRIE ----------
   One search looks for ALL words at once. We walk down the Trie while
   walking through the grid. If the Trie has no child for the current letter,
   no word can continue, so we stop (prune). */
function trieDFS(grid, r, c, dr, dc, node, path, ctx) {
  if (outside(grid, r, c) || ctx.visited[r][c]) return;
  logStep(ctx, r, c, path);
  const next = node.children[grid[r][c]];
  if (!next) return;                       // prefix check failed -> prune
  ctx.visited[r][c] = true;
  path.push([r, c]);
  if (next.word && !ctx.found[next.word]) recordFound(ctx, next.word, path);
  trieDFS(grid, r + dr, c + dc, dr, dc, next, path, ctx);
  path.pop();                              // backtrack
  ctx.visited[r][c] = false;
}

function solveWithTrie(grid, trie, record) {
  const ctx = newContext(grid, record);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      logStep(ctx, r, c, []);
      const first = trie.root.children[grid[r][c]];
      if (!first) continue;                // no word starts with this letter
      ctx.visited[r][c] = true;
      for (const d of DIRECTIONS) {
        trieDFS(grid, r + d[0], c + d[1], d[0], d[1], first, [[r, c]], ctx);
      }
      ctx.visited[r][c] = false;
    }
  }
  return ctx;
}

/* ---------- DFS WITHOUT TRIE ----------
   Each word is searched separately, one after another. */
function plainDFS(grid, r, c, dr, dc, word, index, path, ctx) {
  if (outside(grid, r, c) || ctx.visited[r][c]) return;
  logStep(ctx, r, c, path);
  if (grid[r][c] !== word[index]) return;  // letter mismatch -> stop this path
  ctx.visited[r][c] = true;
  path.push([r, c]);
  if (index === word.length - 1) recordFound(ctx, word, path);
  else plainDFS(grid, r + dr, c + dc, dr, dc, word, index + 1, path, ctx);
  path.pop();
  ctx.visited[r][c] = false;
}

function solveWithoutTrie(grid, words, record) {
  const ctx = newContext(grid, record);
  for (const word of words) {
    for (let r = 0; r < grid.length && !ctx.found[word]; r++) {
      for (let c = 0; c < grid[0].length && !ctx.found[word]; c++) {
        logStep(ctx, r, c, []);
        if (grid[r][c] !== word[0]) continue;
        ctx.visited[r][c] = true;
        for (const d of DIRECTIONS) {
          plainDFS(grid, r + d[0], c + d[1], d[0], d[1], word, 1, [[r, c]], ctx);
          if (ctx.found[word]) break;      // word found -> stop searching it
        }
        ctx.visited[r][c] = false;
      }
    }
  }
  return ctx;
}
