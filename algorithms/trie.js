// Trie: a tree where each path from the root spells a prefix of a word.
class TrieNode {
  constructor() {
    this.children = {};  // letter -> TrieNode
    this.word = null;    // set to the full word if a word ends here
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.word = word;
  }
}
