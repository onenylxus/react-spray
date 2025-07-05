import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { withSpray } from '../src/withSpray';
import '@testing-library/jest-dom';

describe('spray', () => {
  afterEach(cleanup);

  it('assigns correct data-id from body to child', async () => {
    // Simple component
    const Child = React.forwardRef<HTMLDivElement>((props, ref) => (
      <div ref={ref} {...props} />
    ));
    const SprayedChild = withSpray('child')(Child);

    const Parent = React.forwardRef<HTMLElement>((props, ref) => (
      <section ref={ref} data-testid="parent" {...props}>
        <SprayedChild data-testid="child0" />
        <SprayedChild data-testid="child1" />
      </section>
    ));
    const SprayedParent = withSpray('parent')(Parent);

    const { getByTestId } = render(<SprayedParent />);

    const parent = getByTestId('parent');
    const child0 = getByTestId('child0');
    const child1 = getByTestId('child1');

    // Wait for data-id attributes to be set by useEffect
    await waitFor(() => {
      expect(parent).toHaveAttribute(
        'data-id',
        expect.stringContaining('body/div/parent')
      );
      expect(child0).toHaveAttribute(
        'data-id',
        expect.stringContaining('body/div/parent/child[0]')
      );
      expect(child1).toHaveAttribute(
        'data-id',
        expect.stringContaining('body/div/parent/child[1]')
      );
    });
  });
});
