import React from 'react';
import ReactSpray from '../src/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const { spray } = ReactSpray({
  inputAttribute: 'data-input',
  outputAttributes: ['data-eid'],
  separator: '-',
  forceIndex: true,
  indexPrefix: ':',
  indexSuffix: '',
});

describe('config testing set', () => {
  afterEach(cleanup);

  it('assigns correct data-id to single child', async () => {
      const { getByTestId } = render(<spray.div data-testid="test-div" />);
  
      const testDiv = getByTestId('test-div');
  
      await waitFor(() => {
        expect(testDiv).toHaveAttribute('data-eid', 'body-div:0-div:0');
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
        expect(testDiv1).toHaveAttribute('data-eid', 'body-div:0-div:0');
        expect(testDiv2).toHaveAttribute('data-eid', 'body-div:0-div:1');
      });
    });
});
