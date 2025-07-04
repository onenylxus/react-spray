import React from "react";
import { useEffect } from "react";
import { Trie } from "./trie";

export function withSpray(spray: string) {
	return function <P extends object>(
		Component: React.ComponentType<P>
	): React.ForwardRefExoticComponent<
		React.PropsWithoutRef<P> & React.RefAttributes<HTMLElement>
	> {
		const Wrapped = React.forwardRef<HTMLElement, P>((props, ref) => {
			const innerRef = React.useRef<HTMLElement>(null);

			// Combine refs
			const combinedRef = (node: HTMLElement | null) => {
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					(ref as React.RefObject<HTMLElement | null>).current = node;
				}
				innerRef.current = node;
			};

			useEffect(() => {
				const node = innerRef.current;
				if (!node) return;

				Trie.insert(node);

				return () => {
					Trie.remove(node);
				};
			}, [innerRef.current]);

			const componentProps = { ...props, "data-spray": spray } as P & {
				"data-spray": string;
			};

			return React.createElement(Component, {
				...(Component.prototype && "isReactComponent" in Component.prototype
					? { ref: combinedRef }
					: {}),
				...componentProps,
				ref: combinedRef
			});
		});
		Wrapped.displayName = `Spray(${Component.displayName || Component.name})`;
		return Wrapped;
	};
}
