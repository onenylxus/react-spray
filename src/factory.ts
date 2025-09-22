import {
  type ComponentType,
  createElement,
  forwardRef,
  type ForwardRefExoticComponent,
  memo,
  type PropsWithoutRef,
  type RefAttributes,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Sprayer } from './sprayer';

type InputComponent<P> = ComponentType<P>;

type OutputComponent<P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<HTMLElement>
>;

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
