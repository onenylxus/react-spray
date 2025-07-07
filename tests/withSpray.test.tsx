import React from 'react';
import ReactSpray from '../dist/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const withSpray = ReactSpray();

describe('withSpray', () => {
  afterEach(cleanup);

  it('assigns correct data-id to single child', async () => {
    const TestDiv = (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} />
    );
    const SprayedDiv = withSpray('testDiv')(TestDiv);

    const { getByTestId } = render(<SprayedDiv data-testid="test-div" />);

    const testDiv = getByTestId('test-div');

    await waitFor(() => {
      expect(testDiv).toHaveAttribute('data-id', 'body/div/testDiv');
    });
  });

  it('assign correct data-id to multiple children', async () => {
    const TestDiv = (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} />
    );
    const SprayedDiv = withSpray('testDiv')(TestDiv);

    const { getByTestId } = render(
      <>
        <SprayedDiv data-testid="test-div1" />
        <SprayedDiv data-testid="test-div2" />
      </>
    );

    const testDiv1 = getByTestId('test-div1');
    const testDiv2 = getByTestId('test-div2');

    await waitFor(() => {
      expect(testDiv1).toHaveAttribute('data-id', 'body/div/testDiv[0]');
      expect(testDiv2).toHaveAttribute('data-id', 'body/div/testDiv[1]');
    });
  });

  it('updates data-id on sibling changes', async () => {
    const TestDiv = (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} />
    );
    const SprayedDiv = withSpray('testDiv')(TestDiv);

    const { getByTestId, rerender } = render(
      <>
        <SprayedDiv data-testid="test-div1" />
        <SprayedDiv data-testid="test-div2" />
      </>
    );

    const testDiv1 = getByTestId('test-div1');
    const testDiv2 = getByTestId('test-div2');

    await waitFor(() => {
      expect(testDiv1).toHaveAttribute('data-id', 'body/div/testDiv[0]');
      expect(testDiv2).toHaveAttribute('data-id', 'body/div/testDiv[1]');
    });

    rerender(
      <>
        <SprayedDiv data-testid="test-div3" />
        <SprayedDiv data-testid="test-div4" />
      </>
    );

    const testDiv3 = getByTestId('test-div3');
    const testDiv4 = getByTestId('test-div4');

    await waitFor(() => {
      expect(testDiv3).toHaveAttribute('data-id', 'body/div/testDiv[0]');
      expect(testDiv4).toHaveAttribute('data-id', 'body/div/testDiv[1]');
    });
  });
});
