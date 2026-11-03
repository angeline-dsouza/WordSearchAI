# Word Search Puzzle AI Solver Using DFS and Trie

## Abstract
A browser-based tool that solves a 10x10 word search puzzle using Depth First Search (DFS) and a Trie. The search is animated, and a DFS without Trie is compared against a DFS with Trie on the same input.

## Problem Statement
Given a grid of letters and a list of words, find every word placed in any of 8 directions, efficiently.

## Objectives
- Implement DFS on a letter grid.
- Use a Trie to prune paths that cannot form any word.
- Visualise the search and compare both approaches.

## Technologies Used
HTML, CSS, vanilla JavaScript. No libraries, no server.

## Algorithms Used
- **DFS**: starts at each cell, moves in each of 8 directions, backtracks on failure, never reuses a cell on the current path.
- **Trie**: stores all target words. Each DFS step moves down the Trie. No matching child means stop (prefix pruning).
- **Baseline**: DFS that searches each word separately without a Trie.

## System Workflow
1. Read and validate words (letters only, 2-10 letters, duplicates removed).
2. Generate the grid: hide words in random directions, fill the rest randomly.
3. Build the Trie from the words.
4. Run both algorithms on the same grid and words, and time them (average of 100 runs).
5. Run a recorded Trie search and animate its steps.
6. Show statistics, highlighted words and the comparison table.

## Features
Random 10x10 grid, custom words, animated DFS (explored / path / active / found colours), speed slider, pause/resume, reset, statistics, comparison table, built-in explanations.

## How to Run (Windows)
1. Create the folder `WordSearchAI` with `index.html`, `style.css`, `script.js`, `README.md` and a subfolder `algorithms` containing `dfs.js` and `trie.js`.
2. Open the folder in File Explorer.
3. Double-click `index.html` (opens in Chrome / Edge). No server needed.

## Algorithm Comparison
| | DFS without Trie | DFS with Trie |
|---|---|---|
| Searches | one word at a time | all words at once |
| Time | O(W x N^2 x 8 x L) | O(N^2 x 8 x L) |
| Cells explored | grows with number of words | stays almost constant |
Run the app to see actual numbers; both always find the same words.

## Conclusion
The Trie lets one DFS pass serve all words and prunes impossible paths, so it explores fewer cells than searching word by word.

## Future Scope
Bigger grids, bent (Boggle-style) paths, other algorithms such as BFS, loading word lists from files, difficulty levels.

## Educational Notes
See the "How it works" section in the app: puzzle, DFS, Trie, DFS on a grid, Trie improvement, why it is an AI search problem, complexity and limitations.
