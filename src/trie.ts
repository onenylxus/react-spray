export class Trie {
  private static instance: Trie;
  public root: TrieNode;

  private constructor() {
    this.root = new TrieNode();
  }

  public static getInstance(): Trie {
    if (!Trie.instance) {
      Trie.instance = new Trie();
    }
    return Trie.instance;
  }

  private static getPath(element: HTMLElement | null): string[] {
    const path: string[] = [];
    let currentElem: HTMLElement | null = element;

    while (currentElem && currentElem.tagName.toLowerCase() !== 'body') {
      const sprayAttr = currentElem.getAttribute('data-spray');
      let identifier = sprayAttr
        ? sprayAttr
        : currentElem.tagName.toLowerCase();

      // Find index among siblings with the same identifier
      if (currentElem.parentElement) {
        const siblings = Array.from(currentElem.parentElement.children);
        const sameTypeSiblings = siblings.filter(
          (sib) =>
            (sib.getAttribute('data-spray') || sib.tagName.toLowerCase()) ===
            identifier
        );
        if (sameTypeSiblings.length > 1) {
          const index = sameTypeSiblings.indexOf(currentElem);
          identifier = `${identifier}[${index}]`;
        }
        // else: do not append [0] if only one sibling
      }

      path.unshift(identifier);
      currentElem = currentElem.parentElement;
    }
    return path;
  }

  private static updateSiblingIdentifiers(
    parentNode: TrieNode,
    parentElem: HTMLElement
  ) {
    // Collect all base identifiers (with and without [index])
    const baseIdentifiers = new Set<string>();
    parentNode.children.forEach((_, key) => {
      const match = key.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        baseIdentifiers.add(match[1]);
      } else {
        baseIdentifiers.add(key);
      }
    });
    baseIdentifiers.forEach((baseIdentifier) => {
      const siblings = Array.from(parentElem.children).filter(
        (sib) =>
          (sib.getAttribute('data-spray') || sib.tagName.toLowerCase()) ===
          baseIdentifier
      );
      if (siblings.length > 1) {
        siblings.forEach((sib, idx) => {
          const newKey = `${baseIdentifier}[${idx}]`;
          for (const [oldKey, node] of parentNode.children) {
            // oldKey can be baseIdentifier or baseIdentifier[idx]
            if (node.element === sib && oldKey !== newKey) {
              parentNode.children.delete(oldKey);
              parentNode.children.set(newKey, node);
              Trie.updateNodeDataId(
                node,
                Trie.getNodePathFromRoot(Trie.getInstance().root, node)
              );
              break;
            }
          }
        });
      } else if (siblings.length === 1) {
        // Only one sibling, key should be baseIdentifier (no [0])
        for (const [oldKey, node] of parentNode.children) {
          if (node.element === siblings[0] && oldKey !== baseIdentifier) {
            parentNode.children.delete(oldKey);
            parentNode.children.set(baseIdentifier, node);
            Trie.updateNodeDataId(
              node,
              Trie.getNodePathFromRoot(Trie.getInstance().root, node)
            );
            break;
          }
        }
      }
    });
  }

  // Helper to get the path from root to a node, given its parent and key
  // This version walks from the root to the node, collecting keys.
  private static getNodePathFromRoot(
    root: TrieNode,
    target: TrieNode
  ): string[] {
    const path: string[] = [];
    function dfs(node: TrieNode, currentPath: string[]): boolean {
      if (node === target) {
        path.push(...currentPath);
        return true;
      }
      for (const [key, child] of node.children) {
        if (dfs(child, [...currentPath, key])) {
          return true;
        }
      }
      return false;
    }
    dfs(root, []);
    return path;
  }

  // Helper to update the data-id of a node and all its descendants
  private static updateNodeDataId(
    node: TrieNode,
    path: string[],
    prefix: string = 'body'
  ) {
    const fullPath = [prefix, ...path].join('/');
    if (node.element) {
      node.element.setAttribute('data-id', fullPath);
    }
    node.children.forEach((child, key) => {
      Trie.updateNodeDataId(child, [...path, key], prefix);
    });
  }

  public static insert(element: HTMLElement | null): void {
    if (!element) return;

    const trie = Trie.getInstance();
    let currentNode = trie.root;

    const path = Trie.getPath(element);

    let currentElem: HTMLElement | null = element;
    while (currentElem && currentElem.tagName.toLowerCase() !== 'body') {
      currentElem = currentElem.parentElement;
    }

    if (currentElem && currentElem.tagName.toLowerCase() === 'body') {
      let node = currentNode;
      if (!node.children.has('body')) {
        node.children.set('body', new TrieNode(document.body));
      }
      node = node.children.get('body')!;

      let parentElem = document.body;
      let nodePath: string[] = [];
      for (const tagOrSpray of path) {
        nodePath.push(tagOrSpray);
        if (!node.children.has(tagOrSpray)) {
          node.children.set(tagOrSpray, new TrieNode());
        }
        node = node.children.get(tagOrSpray)!;

        // Try to find the corresponding element for updating siblings
        let baseIdentifier = tagOrSpray;
        let idx: number | null = null;
        const match = tagOrSpray.match(/^(.+)\[(\d+)\]$/);
        if (match) {
          baseIdentifier = match[1];
          idx = parseInt(match[2], 10);
        }
        const siblings = Array.from(parentElem.children).filter(
          (sib) =>
            (sib.getAttribute('data-spray') || sib.tagName.toLowerCase()) ===
            baseIdentifier
        );
        if (idx !== null && siblings[idx]) {
          parentElem = siblings[idx] as HTMLElement;
        } else if (idx === null && siblings.length === 1) {
          parentElem = siblings[0] as HTMLElement;
        }
      }
      node.element = element;

      // Set the data-id as the concatenation of identifiers from root
      const fullId = ['body', ...path].join('/');
      element.setAttribute('data-id', fullId);

      // After insertion, update sibling identifiers for the parent node
      if (parentElem.parentElement) {
        const parentTrieNode = Trie.getInstance().root.children.get('body');
        if (parentTrieNode) {
          let parentNode = parentTrieNode;
          let parentPath = Trie.getPath(parentElem.parentElement);
          for (const tagOrSpray of parentPath) {
            if (parentNode.children.has(tagOrSpray)) {
              parentNode = parentNode.children.get(tagOrSpray)!;
            }
          }
          Trie.updateSiblingIdentifiers(parentNode, parentElem.parentElement);
        }
      }
    }
  }

  public static remove(element: HTMLElement | null): void {
    if (!element) return;

    const trie = Trie.getInstance();
    let currentNode = trie.root;

    const path = Trie.getPath(element);

    let currentElem: HTMLElement | null = element;
    while (currentElem && currentElem.tagName.toLowerCase() !== 'body') {
      currentElem = currentElem.parentElement;
    }

    if (currentElem && currentElem.tagName.toLowerCase() === 'body') {
      let node = currentNode;
      const stack: [TrieNode, string][] = [];

      if (!node.children.has('body')) return;
      node = node.children.get('body')!;
      stack.push([currentNode, 'body']);

      let parentElem = document.body;
      for (const tagOrSpray of path) {
        if (!node.children.has(tagOrSpray)) return;
        stack.push([node, tagOrSpray]);
        node = node.children.get(tagOrSpray)!;

        let baseIdentifier = tagOrSpray;
        let idx: number | null = null;
        const match = tagOrSpray.match(/^(.+)\[(\d+)\]$/);
        if (match) {
          baseIdentifier = match[1];
          idx = parseInt(match[2], 10);
        }
        const siblings = Array.from(parentElem.children).filter(
          (sib) =>
            (sib.getAttribute('data-spray') || sib.tagName.toLowerCase()) ===
            baseIdentifier
        );
        if (idx !== null && siblings[idx]) {
          parentElem = siblings[idx] as HTMLElement;
        } else if (idx === null && siblings.length === 1) {
          parentElem = siblings[0] as HTMLElement;
        }
      }

      node.element = null;

      for (let i = stack.length - 1; i >= 0; i--) {
        const [parent, key] = stack[i];
        const child = parent.children.get(key)!;
        if (child.children.size === 0 && child.element === null) {
          parent.children.delete(key);
        } else {
          break;
        }
      }

      // After removal, update sibling identifiers for the parent node
      if (parentElem.parentElement) {
        const parentTrieNode = Trie.getInstance().root.children.get('body');
        if (parentTrieNode) {
          let parentNode = parentTrieNode;
          let parentPath = Trie.getPath(parentElem.parentElement);
          for (const tagOrSpray of parentPath) {
            if (parentNode.children.has(tagOrSpray)) {
              parentNode = parentNode.children.get(tagOrSpray)!;
            }
          }
          Trie.updateSiblingIdentifiers(parentNode, parentElem.parentElement);
        }
      }
    }
  }
}

export class TrieNode {
  public children: Map<string, TrieNode>;
  public element: HTMLElement | null;

  public constructor(element: HTMLElement | null = null) {
    this.children = new Map<string, TrieNode>();
    this.element = element;
  }
}
