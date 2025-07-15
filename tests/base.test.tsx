import React from 'react';
import ReactSpray from '../src/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const { spray } = ReactSpray();

describe('base testing set', () => {
  afterEach(cleanup);

  it('assigns correct data-id to single child', async () => {
    const { getByTestId } = render(<spray.div data-testid="test-div" />);

    const testDiv = getByTestId('test-div');

    await waitFor(() => {
      expect(testDiv).toHaveAttribute('data-id', 'body/div/div');
    });
  });

  it('assign correct data-id to multiple children', async () => {
    const { getByTestId } = render(
      <>
        <spray.div data-testid="test-div1" />
        <spray.div data-testid="test-div2" />
      </>
    );

    const testDiv1 = getByTestId('test-div1');
    const testDiv2 = getByTestId('test-div2');

    await waitFor(() => {
      expect(testDiv1).toHaveAttribute('data-id', 'body/div/div[0]');
      expect(testDiv2).toHaveAttribute('data-id', 'body/div/div[1]');
    });
  });

  it('updates data-id on sibling changes', async () => {
    const { getByTestId, rerender } = render(
      <>
        <spray.div data-testid="test-div1" />
        <spray.div data-testid="test-div2" />
      </>
    );

    const testDiv1 = getByTestId('test-div1');
    const testDiv2 = getByTestId('test-div2');

    await waitFor(() => {
      expect(testDiv1).toHaveAttribute('data-id', 'body/div/div[0]');
      expect(testDiv2).toHaveAttribute('data-id', 'body/div/div[1]');
    });

    rerender(
      <>
        <spray.div data-testid="test-div3" />
        <spray.div data-testid="test-div4" />
      </>
    );

    const testDiv3 = getByTestId('test-div3');
    const testDiv4 = getByTestId('test-div4');

    await waitFor(() => {
      expect(testDiv3).toHaveAttribute('data-id', 'body/div/div[0]');
      expect(testDiv4).toHaveAttribute('data-id', 'body/div/div[1]');
    });
  });
});
