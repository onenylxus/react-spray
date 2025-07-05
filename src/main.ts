import { Trie, TrieOptions } from './trie';
import { withSprayFactory } from './withSpray';

export default function createWithSpray(options: Partial<TrieOptions> = {}) {
  const trie = new Trie(options);
  return withSprayFactory(trie);
}
