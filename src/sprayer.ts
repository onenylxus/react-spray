import { Trie } from './trie';

/**
 * Options for the sprayer.
 *
 * @property inputAttribute - The data attribute to mark sprayed elements (default: `'data-spray'`)
 * @property outputAttribute - The data attribute to store the generated path (default: `'data-id'`)
 * @property separator - The separator used in the generated path (default: `'/'`)
 * @property forceIndex - Whether to always include indices in the path segments (default: `false`)
 * @property indexPrefix - The prefix for indices in the path segments (default: `'['`)
 * @property indexSuffix - The suffix for indices in the path segments (default: `']'`)
 */
export interface SprayOptions {
  inputAttribute: string;
  outputAttribute: string;
  separator: string;
  forceIndex: boolean;
  indexPrefix: string;
  indexSuffix: string;
}

/**
 * Sprayer class to manage sprayed elements in the DOM.
 */
export class Sprayer {
  /**
   * Current options for the sprayer.
   */
  public options: SprayOptions;

  /**
   * A trie acting as a virtual DOM to manage elements.
   *
   * By default, `body` element is used as the root of the trie.
   */
  private trie: Trie<HTMLElement>;

  constructor(options: Partial<SprayOptions> = {}) {
    if (!document.body) {
      throw new Error('HTML body element not found');
    }
    this.options = { ...this.defaultOptions, ...options };
    this.trie = new Trie(document.body);
  }

  /**
   * Default options for the sprayer.
   */
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

  /**
   * Get the spray label of an element, or its tag name if not labeled.
   *
   * @param element Target element
   * @returns Spray label or tag name
   */
  private getLabel(element: HTMLElement): string {
    return (
      element.getAttribute(this.options.inputAttribute) ||
      element.tagName.toLowerCase()
    );
  }

  /**
   * Check if the element is the root of the trie. By default, it should be the `body` element.
   *
   * @param element Target element
   * @returns True if the element is the root, false if not
   */
  private isRoot(element: HTMLElement): boolean {
    return element === document.body || this.getLabel(element) === 'body';
  }

  /**
   * Get all sibling elements (including itself) that share the same spray label.
   *
   * @param element Target element
   * @returns An array of matching elements
   */
  private getAlikeSiblings(element: HTMLElement): HTMLElement[] {
    if (!element.parentElement) {
      return [];
    }

    const label = this.getLabel(element);
    return Array.from(element.parentElement.children).filter(
      (child) => this.getLabel(child as HTMLElement) === label
    ) as HTMLElement[];
  }

  /**
   * Generates the path segment based on the label and index.
   *
   * @param label Spray label (should not be empty)
   * @param index Index of the element among its siblings (1-based), or undefined if the element is lone child
   * @returns Generated path segment
   */
  private getSegment(label: string, index?: number): string {
    if (!label) {
      return '';
    }
    return `${label}${this.options.forceIndex || index !== undefined ? `${this.options.indexPrefix}${index ?? 1}${this.options.indexSuffix}` : ''}`;
  }

  /**
   * Find the full path of an element. If the target element is not under the root, an empty array is returned.
   *
   * @param element Target element
   * @returns Full path (as an array of segments) of the element.
   */
  private getPath(element: HTMLElement): string[] {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && !this.isRoot(current)) {
      const label = this.getLabel(current);

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

  /**
   * Get the resulting identifier to spray on the element.
   *
   * @param element Target element
   * @returns Spray identifier, or undefined if the element is not under the root
   */
  private getIdentifier(element: HTMLElement): string | undefined {
    return this.getPath(element).join(this.options.separator) || undefined;
  }

  /**
   * Spray the identifier onto the element.
   *
   * @param element Target element
   */
  private setIdentifier(element: HTMLElement): void {
    const attribute = this.getIdentifier(element);
    if (attribute) {
      element.setAttribute(this.options.outputAttribute, attribute);
    }
  }

  /**
   * Search for an element by its identifier.
   *
   * @param identifier Element identifier, under the format defined by the options
   * @returns Target element, or null if not found
   */
  public search(identifier: string): HTMLElement | null {
    const segments = identifier.split(this.options.separator);
    return this.trie.search(segments);
  }

  /**
   * Insert an element into the sprayer. The sprayer takes record of the element and updates identifiers of its alike siblings.
   *
   * @param element HTML element to insert
   * @returns True if the element is successfully inserted
   */
  public insert(element: HTMLElement): boolean {
    const path = this.getPath(element);
    if (path.length < 1) {
      return false;
    }

    this.trie.insert(path, element);
    this.getAlikeSiblings(element).forEach((sibling) =>
      this.setIdentifier(sibling)
    );
    return true;
  }

  /**
   * Remove an element from the sprayer. The sprayer removes record of the element and updates identifiers of its alike siblings.
   *
   * @param element HTML element to remove
   * @returns True if the element is successfully removed
   */
  public remove(element: HTMLElement): boolean {
    const path = this.getPath(element);
    if (path.length < 1) {
      return false;
    }

    this.trie.remove(path);
    this.getAlikeSiblings(element).forEach((sibling) =>
      this.setIdentifier(sibling)
    );
    return true;
  }
}
