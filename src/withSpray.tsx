import {
  createElement,
  forwardRef,
  memo,
  useEffect,
  useRef,
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { Trie } from './trie';

export function withSprayFactory(trie: Trie) {
  return function withSpray(spray: string) {
    return function <P extends object>(
      Component: ComponentType<P>
    ): ForwardRefExoticComponent<
      PropsWithoutRef<P> & RefAttributes<HTMLElement>
    > {
      const Wrapped = forwardRef<HTMLElement, P>((props, ref) => {
        const innerRef = useRef<HTMLElement>(null);

        // Combine refs
        const combinedRef = (node: HTMLElement | null) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          innerRef.current = node;
        };

        useEffect(() => {
          const node = innerRef.current;
          if (!node) return;

          trie.insert(node);
          return () => trie.remove(node);
        }, [innerRef.current]);

        return createElement(memo(Component), {
          ...props,
          ref: combinedRef,
          [trie.options.inputAttribute]: spray,
        });
      });
      Wrapped.displayName = Component.displayName || Component.name;
      return Wrapped;
    };
  };
}
