import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { withSpray } from "../src/withSpray";
import "@testing-library/jest-dom";

describe("spray", () => {
	afterEach(cleanup);

	it("assigns correct data-id from body to child", async () => {
		// Simple component
		const Child = React.forwardRef<HTMLDivElement>((props, ref) => (
			<div ref={ref} data-testid="child" {...props} />
		));
		const SprayedChild = withSpray("child")(Child);

		const Parent = React.forwardRef<HTMLElement>((props, ref) => (
			<section ref={ref} data-testid="parent" {...props}>
				<SprayedChild />
			</section>
		));
		const SprayedParent = withSpray("parent")(Parent);

		const { getByTestId } = render(<SprayedParent />);

		const parent = getByTestId("parent");
		const child = getByTestId("child");

		// Wait for data-id attributes to be set by useEffect
		await waitFor(() => {
			expect(parent).toHaveAttribute(
				"data-id",
				expect.stringContaining("body/div[0]/parent[0]")
			);
			expect(child).toHaveAttribute(
				"data-id",
				expect.stringContaining("body/div[0]/parent[0]/child[0]")
			);
		});
	});
});
