import {
  createElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  type ComponentType,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import { Sprayer } from './sprayer';

type InputComponent<P> = ComponentType<P>;

export type OutputComponent<P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<HTMLElement>
>;

/**
 * Factory function to create a higher-order component that sprays components.
 * 
 * @param sprayer Sprayer instance
 * @returns Higher-order component
 */
export function withSprayFactory(sprayer: Sprayer) {
  return function withSpray(label: string) {
    return function <P extends object>(
      Component: InputComponent<P>
    ): OutputComponent<P> {
      const Wrapped = forwardRef<HTMLElement, P>((props, ref) => {
        const innerRef = useRef<HTMLElement | null>(null);

        const combinedRef = useCallback(
          (element: HTMLElement | null) => {
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
            innerRef.current = element;
          },
          [ref]
        );

        useEffect(() => {
          const element = innerRef.current;
          if (!element) return;

          sprayer.insert(element);
          return () => {
            sprayer.remove(element);
          };
        }, [innerRef.current, sprayer]);

        return createElement(memo(Component), {
          ...props,
          ref: combinedRef,
          [sprayer.options.inputAttribute]: label,
        });
      });

      Wrapped.displayName = Component.displayName || Component.name;
      return Wrapped;
    };
  };
}
