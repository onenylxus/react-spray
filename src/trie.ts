class TrieNode<T> {
  public value: T | null;
  public children: Map<string, TrieNode<T>>;

  constructor(value: T | null = null) {
    this.value = value;
    this.children = new Map();
  }
}

export class Trie<T> {
  private root: TrieNode<T>;

  public constructor(value?: T) {
    this.root = new TrieNode<T>(value);
  }

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
