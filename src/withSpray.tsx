import React from "react";

export function withSpray(spray: string) {
	return function <P extends object>(Component: React.ComponentType<P>) {
		return function (props: P) {
			return <Component {...props} data-spray={spray} />;
		};
	};
}
