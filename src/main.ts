import { getHTMLElements } from './htmlElements';
import { Trie, TrieOptions } from './trie';
import { withSprayFactory } from './withSpray';

export default function createWithSpray(options: Partial<TrieOptions> = {}) {
  const trie = new Trie(options);
  const withSpray = withSprayFactory(trie);
  const htmlElements = getHTMLElements(withSpray);

  return {
    withSpray,
    spray: { ...htmlElements },
  };
}
