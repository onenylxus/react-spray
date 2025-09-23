/**
 * Node of trie data structure.
 */
class TrieNode<T> {
  /**
   * Value stored in this node.
   */
  public value: T | null;

  /**
   * Children nodes mapped by their keys.
   */
  public children: Map<string, TrieNode<T>>;

  constructor(value: T | null = null) {
    this.value = value;
    this.children = new Map();
  }
}

/**
 * Trie data structure.
 */
export class Trie<T> {
  /**
   * Root node of the trie.
   */
  private root: TrieNode<T>;

  public constructor(value?: T) {
    this.root = new TrieNode<T>(value);
  }

  /**
   * Search for a value by its keys.
   *
   * @param keys Keys to reach the target node
   * @returns The value found at the target node, or null if not found
   */
  public search(keys: string[]): T | null {
    let node = this.root;
    for (const key of keys) {
      if (!node.children.has(key)) {
        return null;
      }
      node = node.children.get(key)!;
    }
    return node.value;
  }

  /**
   * Insert a node with given value to the trie at the position defined by keys.
   *
   * @param keys Keys to reach the target position
   * @param value Value stored in new node
   * @returns True if the insertion was successful
   */
  public insert(keys: string[], value: T): boolean {
    let node = this.root;
    for (const key of keys) {
      if (!node.children.has(key)) {
        node.children.set(key, new TrieNode<T>());
      }
      node = node.children.get(key)!;
    }
    node.value = value;
    return true;
  }

  /**
   * Remove a node from the trie at the position defined by keys.
   *
   * @param keys Keys to reach the target node
   * @returns True if the removal was successful
   */
  public remove(keys: string[]): boolean {
    const stack: [string, TrieNode<T>][] = [];
    let node = this.root;

    for (const key of keys) {
      if (!node.children.has(key)) {
        return false;
      }
      stack.push([key, node]);
      node = node.children.get(key)!;
    }
    node.value = null;

    for (let i = stack.length - 1; i >= 0; i--) {
      const [key, parent] = stack[i];
      const child = parent.children.get(key)!;
      if (child.value === null && child.children.size === 0) {
        parent.children.delete(key);
      } else {
        break;
      }
    }
    return true;
  }
}
