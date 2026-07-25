import React, { createRef } from 'react';
import ReactSpray from '../src/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ArrowFnComponent,
  FnDeclarationComponent,
  ForwardRefComponent,
  MemoComponent,
  FragmentComponent,
} from './fixtures/components';

const { withSpray, spray } = ReactSpray();

const SprayedArrowFn = withSpray('arrow')(ArrowFnComponent);
const SprayedFnDecl = withSpray('func')(FnDeclarationComponent);
const SprayedForwardRef = withSpray('fwd-ref')(ForwardRefComponent);
const SprayedMemo = withSpray('memo')(MemoComponent);
const SprayedFragment = withSpray('frag')(FragmentComponent);

describe('components testing set', () => {
  afterEach(cleanup);

  it('works with arrow function components', async () => {
    const { getByTestId } = render(<SprayedArrowFn data-testid="target" />);
    await waitFor(() => {
      expect(getByTestId('target')).toHaveAttribute('data-id', 'div/arrow');
    });
  });

  it('works with function declaration components', async () => {
    const { getByTestId } = render(<SprayedFnDecl data-testid="target" />);
    await waitFor(() => {
      expect(getByTestId('target')).toHaveAttribute('data-id', 'div/func');
    });
  });

  it('works with forwardRef components', async () => {
    const { getByTestId } = render(<SprayedForwardRef data-testid="target" />);
    await waitFor(() => {
      expect(getByTestId('target')).toHaveAttribute('data-id', 'div/fwd-ref');
    });
  });

  it('works with memoized components', async () => {
    const { getByTestId } = render(<SprayedMemo data-testid="target" />);
    await waitFor(() => {
      expect(getByTestId('target')).toHaveAttribute('data-id', 'div/memo');
    });
  });

  it('works with fragment-based components', async () => {
    const { getByTestId } = render(<SprayedFragment data-testid="target" />);
    await waitFor(() => {
      expect(getByTestId('target')).toHaveAttribute('data-id', 'div/frag');
    });
  });

  it('disambiguates same-label siblings with indices', async () => {
    const { getByTestId } = render(
      <>
        <SprayedArrowFn data-testid="first" />
        <SprayedArrowFn data-testid="second" />
      </>
    );
    await waitFor(() => {
      expect(getByTestId('first')).toHaveAttribute('data-id', 'div/arrow[1]');
      expect(getByTestId('second')).toHaveAttribute('data-id', 'div/arrow[2]');
    });
  });

  it('disambiguates different-label siblings without indices', async () => {
    const { getByTestId } = render(
      <>
        <SprayedArrowFn data-testid="arrow" />
        <SprayedFnDecl data-testid="func" />
        <SprayedForwardRef data-testid="fwd" />
      </>
    );
    await waitFor(() => {
      expect(getByTestId('arrow')).toHaveAttribute('data-id', 'div/arrow');
      expect(getByTestId('func')).toHaveAttribute('data-id', 'div/func');
      expect(getByTestId('fwd')).toHaveAttribute('data-id', 'div/fwd-ref');
    });
  });

  it('works with mixed HTML element types as siblings', async () => {
    const { getByTestId } = render(
      <>
        <spray.div data-testid="div-1" />
        <spray.span data-testid="span" />
        <spray.div data-testid="div-2" />
      </>
    );
    await waitFor(() => {
      expect(getByTestId('div-1')).toHaveAttribute('data-id', 'div/div[1]');
      expect(getByTestId('span')).toHaveAttribute('data-id', 'div/span');
      expect(getByTestId('div-2')).toHaveAttribute('data-id', 'div/div[2]');
    });
  });

  it('works with nested wrapped components', async () => {
    const Inner = (props: Record<string, unknown>) => <span {...props} />;
    const SprayedInner = withSpray('inner')(Inner);
    const Outer = (props: Record<string, unknown>) => (
      <div {...props}>
        <SprayedInner data-testid="inner" />
      </div>
    );
    const SprayedOuter = withSpray('outer')(Outer);

    const { getByTestId } = render(<SprayedOuter data-testid="outer" />);
    await waitFor(() => {
      expect(getByTestId('outer')).toHaveAttribute('data-id', 'div/outer');
      expect(getByTestId('inner')).toHaveAttribute(
        'data-id',
        'div/outer/inner'
      );
    });
  });

  it('works with conditional rendering', async () => {
    const Conditional = (
      props: { show: boolean } & Record<string, unknown>
    ) => {
      const { show, ...rest } = props;
      return <div {...rest}>{show && <spray.span data-testid="child" />}</div>;
    };
    const SprayedConditional = withSpray('conditional')(Conditional);

    const { getByTestId, rerender } = render(
      <SprayedConditional show={true} data-testid="parent" />
    );
    await waitFor(() => {
      expect(getByTestId('parent')).toHaveAttribute(
        'data-id',
        'div/conditional'
      );
      expect(getByTestId('child')).toHaveAttribute(
        'data-id',
        'div/conditional/span'
      );
    });

    rerender(<SprayedConditional show={false} data-testid="parent" />);
    await waitFor(() => {
      expect(getByTestId('parent')).toHaveAttribute(
        'data-id',
        'div/conditional'
      );
      expect(
        document.querySelector('[data-testid="child"]')
      ).not.toBeInTheDocument();
    });
  });

  it('updates indices when siblings are added or removed', async () => {
    const { getByTestId, rerender } = render(
      <>
        <SprayedArrowFn data-testid="a" />
        <SprayedArrowFn data-testid="b" />
      </>
    );
    await waitFor(() => {
      expect(getByTestId('a')).toHaveAttribute('data-id', 'div/arrow[1]');
      expect(getByTestId('b')).toHaveAttribute('data-id', 'div/arrow[2]');
    });

    rerender(<SprayedArrowFn data-testid="a" />);
    await waitFor(() => {
      expect(getByTestId('a')).toHaveAttribute('data-id', 'div/arrow');
    });
  });

  it('forwards refs to the underlying DOM element', async () => {
    const ref = createRef<HTMLElement>();
    const { getByTestId } = render(
      <SprayedArrowFn data-testid="target" ref={ref} />
    );
    await waitFor(() => {
      expect(ref.current).toBe(getByTestId('target'));
    });
  });
});
