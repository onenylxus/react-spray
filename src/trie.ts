export interface TrieOptions {
  inputAttribute: string;
  outputAttributes: string[];
  separator: string;
  forceIndex: boolean;
  indexPrefix: string;
  indexSuffix: string;
}

export class Trie {
  public options: TrieOptions;
  public root: TrieNode;

  public constructor(options: Partial<TrieOptions> = {}) {
    this.options = {
      inputAttribute: 'data-spray',
      outputAttributes: ['data-id'],
      separator: '/',
      forceIndex: false,
      indexPrefix: '[',
      indexSuffix: ']',
      ...options,
    };
    this.root = new TrieNode();
  }

  private get attributeRegex(): RegExp {
    const prefix = this.options.indexPrefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    const suffix = this.options.indexSuffix.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    return new RegExp(`^(.+)${prefix}(\\d+)${suffix}$`);
  }

  private getPath(element: HTMLElement): string[] {
    const path: string[] = [];
    let currentElem: HTMLElement | null = element;

    while (currentElem && currentElem.tagName.toLowerCase() !== 'body') {
      const sprayAttr = currentElem.getAttribute(this.options.inputAttribute);
      let identifier = sprayAttr || currentElem.tagName.toLowerCase();

      // Find index among siblings with the same identifier
      if (currentElem.parentElement) {
        const siblings = Array.from(currentElem.parentElement.children);
        const sameTypeSiblings = siblings.filter(
          (sibling) =>
            (sibling.getAttribute(this.options.inputAttribute) ||
              sibling.tagName.toLowerCase()) === identifier
        );
        if (this.options.forceIndex || sameTypeSiblings.length > 1) {
          const index = sameTypeSiblings.indexOf(currentElem);
          identifier = `${identifier}${this.options.indexPrefix}${index}${this.options.indexSuffix}`;
        }
      }

      path.unshift(identifier);
      currentElem = currentElem.parentElement;
    }
    return path;
  }

  private getNodePathFromRoot(root: TrieNode, target: TrieNode): string[] {
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

  private updateNodeDataId(
    node: TrieNode,
    path: string[],
    base: string = 'body'
  ) {
    const fullPath = [base, ...path].join(this.options.separator);
    if (node.element) {
      this.options.outputAttributes.forEach((attribute) => {
        node.element!.setAttribute(attribute, fullPath);
      });
    }
    node.children.forEach((child, key) => {
      this.updateNodeDataId(child, [...path, key], base);
    });
  }

  private updateSiblingIdentifiers(
    parentNode: TrieNode,
    parentElem: HTMLElement
  ) {
    const baseIdentifiers = new Set<string>();
    parentNode.children.forEach((_, key) => {
      const match = key.match(this.attributeRegex);
      if (match) {
        baseIdentifiers.add(match[1]);
      } else {
        baseIdentifiers.add(key);
      }
    });
    baseIdentifiers.forEach((baseIdentifier) => {
      const siblings = Array.from(parentElem.children).filter(
        (sibling) =>
          (sibling.getAttribute(this.options.inputAttribute) ||
            sibling.tagName.toLowerCase()) === baseIdentifier
      );
      if (
        (this.options.forceIndex && siblings.length === 1) ||
        siblings.length > 1
      ) {
        siblings.forEach((sibling, index) => {
          const newKey = `${baseIdentifier}${this.options.indexPrefix}${index}${this.options.indexSuffix}`;
          for (const [oldKey, node] of parentNode.children) {
            if (node.element === sibling && oldKey !== newKey) {
              parentNode.children.delete(oldKey);
              parentNode.children.set(newKey, node);
              this.updateNodeDataId(
                node,
                this.getNodePathFromRoot(this.root, node)
              );
              break;
            }
          }
        });
      } else if (siblings.length === 1) {
        for (const [oldKey, node] of parentNode.children) {
          if (node.element === siblings[0] && oldKey !== baseIdentifier) {
            parentNode.children.delete(oldKey);
            parentNode.children.set(baseIdentifier, node);
            this.updateNodeDataId(
              node,
              this.getNodePathFromRoot(this.root, node)
            );
            break;
          }
        }
      }
    });
  }

  public insert(element: HTMLElement | null): void {
    if (!element) return;
    let currentNode = this.root;
    const path = this.getPath(element);

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

        let baseIdentifier = tagOrSpray;
        let index: number | null = null;
        const match = tagOrSpray.match(this.attributeRegex);
        if (match) {
          baseIdentifier = match[1];
          index = parseInt(match[2], 10);
        }
        const siblings = Array.from(parentElem.children).filter(
          (sibling) =>
            (sibling.getAttribute(this.options.inputAttribute) ||
              sibling.tagName.toLowerCase()) === baseIdentifier
        );
        if (index !== null && siblings[index]) {
          parentElem = siblings[index] as HTMLElement;
        } else if (index === null && siblings.length === 1) {
          parentElem = siblings[0] as HTMLElement;
        }
      }
      node.element = element;

      const fullId = ['body', ...path].join(this.options.separator);
      this.options.outputAttributes.forEach((attribute) => {
        element.setAttribute(attribute, fullId);
      });

      if (parentElem.parentElement) {
        const parentTrieNode = this.root.children.get('body');
        if (parentTrieNode) {
          let parentNode = parentTrieNode;
          let parentPath = this.getPath(parentElem.parentElement);
          for (const tagOrSpray of parentPath) {
            if (parentNode.children.has(tagOrSpray)) {
              parentNode = parentNode.children.get(tagOrSpray)!;
            }
          }
          this.updateSiblingIdentifiers(parentNode, parentElem.parentElement);
        }
      }
    }
  }

  public remove(element: HTMLElement | null): void {
    if (!element) return;
    let currentNode = this.root;
    const path = this.getPath(element);

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
        let index: number | null = null;
        const match = tagOrSpray.match(this.attributeRegex);
        if (match) {
          baseIdentifier = match[1];
          index = parseInt(match[2], 10);
        }
        const siblings = Array.from(parentElem.children).filter(
          (sibling) =>
            (sibling.getAttribute(this.options.inputAttribute) ||
              sibling.tagName.toLowerCase()) === baseIdentifier
        );
        if (index !== null && siblings[index]) {
          parentElem = siblings[index] as HTMLElement;
        } else if (index === null && siblings.length === 1) {
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

      if (parentElem.parentElement) {
        const parentTrieNode = this.root.children.get('body');
        if (parentTrieNode) {
          let parentNode = parentTrieNode;
          let parentPath = this.getPath(parentElem.parentElement);
          for (const tagOrSpray of parentPath) {
            if (parentNode.children.has(tagOrSpray)) {
              parentNode = parentNode.children.get(tagOrSpray)!;
            }
          }
          this.updateSiblingIdentifiers(parentNode, parentElem.parentElement);
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
