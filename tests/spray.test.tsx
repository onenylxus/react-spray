import React from 'react';
import ReactSpray from '../dist/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const withSpray = ReactSpray();

describe('spray', () => {
  afterEach(cleanup);

  it('assigns correct data-id from body to child', async () => {
    const Child = (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} />
    );
    const SprayedChild = withSpray('child')(Child);

    const Parent = (props: React.HTMLAttributes<HTMLElement>) => (
      <section data-testid="parent" {...props}>
        <SprayedChild data-testid="child0" />
        <SprayedChild data-testid="child1" />
      </section>
    );
    const SprayedParent = withSpray('parent')(Parent);

    const { getByTestId } = render(<SprayedParent />);

    const parent = getByTestId('parent');
    const child0 = getByTestId('child0');
    const child1 = getByTestId('child1');

    await waitFor(() => {
      expect(parent).toHaveAttribute('data-id', 'body/div/parent');
      expect(child0).toHaveAttribute('data-id', 'body/div/parent/child[0]');
      expect(child1).toHaveAttribute('data-id', 'body/div/parent/child[1]');
    });
  });
});
