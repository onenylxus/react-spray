import { Trie } from './trie';

export interface SprayOptions {
  inputAttribute: string;
  outputAttribute: string;
  separator: string;
  forceIndex: boolean;
  indexPrefix: string;
  indexSuffix: string;
}

export class Sprayer {
  public options: SprayOptions;
  private trie: Trie<HTMLElement>;

  constructor(options: Partial<SprayOptions> = {}) {
    if (!document.body) {
      throw new Error('HTML body element not found');
    }
    this.options = { ...this.defaultOptions, ...options };
    this.trie = new Trie(document.body);
  }

  private get defaultOptions(): SprayOptions {
    return {
      inputAttribute: 'data-spray',
      outputAttribute: 'data-id',
      separator: '/',
      forceIndex: false,
      indexPrefix: '[',
      indexSuffix: ']',
    };
  }

  private getLabel(element: HTMLElement): string {
    return (
      element.getAttribute(this.options.inputAttribute) ||
      element.tagName.toLowerCase()
    );
  }

  private isRoot(element: HTMLElement): boolean {
    return element === document.body || this.getLabel(element) === 'body';
  }

  private getAlikeSiblings(element: HTMLElement): HTMLElement[] {
    if (!element.parentElement) {
      return [];
    }

    const label = this.getLabel(element);
    return Array.from(element.parentElement.children).filter(
      (child) => this.getLabel(child as HTMLElement) === label
    ) as HTMLElement[];
  }

  private getSegment(label: string, index?: number): string {
    if (!label) {
      return '';
    }
    return `${label}${this.options.forceIndex || index !== undefined ? `${this.options.indexPrefix}${index ?? 1}${this.options.indexSuffix}` : ''}`;
  }

  private getPath(element: HTMLElement): string[] {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && !this.isRoot(current)) {
      const label = this.getLabel(current);

      console.log(current.parentElement);
      if (current.parentElement) {
        const siblings = this.getAlikeSiblings(current);
        const index = siblings.indexOf(current) + 1;
        const segment = this.getSegment(
          label,
          siblings.length > 1 ? index : undefined
        );
        if (segment) {
          path.unshift(segment);
        }
        current = current.parentElement;
      } else {
        break;
      }
    }

    return this.isRoot(current) ? path : [];
  }

  private getAttribute(element: HTMLElement): string | undefined {
    return this.getPath(element).join(this.options.separator) || undefined;
  }

  private setAttribute(element: HTMLElement): void {
    const attribute = this.getAttribute(element);
    if (attribute) {
      element.setAttribute(this.options.outputAttribute, attribute);
    }
  }

  public search(identifier: string): HTMLElement | null {
    const segments = identifier.split(this.options.separator);
    return this.trie.search(segments);
  }

  public insert(element: HTMLElement): boolean {
    const path = this.getPath(element);
    if (path.length < 1) {
      return false;
    }

    this.trie.insert(path, element);
    this.getAlikeSiblings(element).forEach((sibling) =>
      this.setAttribute(sibling)
    );
    return true;
  }

  public remove(element: HTMLElement): boolean {
    const path = this.getPath(element);
    if (path.length < 1) {
      return false;
    }

    this.trie.remove(path);
    this.getAlikeSiblings(element).forEach((sibling) =>
      this.setAttribute(sibling)
    );
    return true;
  }
}
