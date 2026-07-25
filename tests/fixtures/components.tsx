import React from 'react';

export const ArrowFnComponent = (props: Record<string, unknown>) => (
  <div {...props} />
);

export function FnDeclarationComponent(props: Record<string, unknown>) {
  return <div {...props} />;
}

export const ForwardRefComponent = React.forwardRef<
  HTMLDivElement,
  Record<string, unknown>
>((props, ref) => <div ref={ref} {...props} />);

export const MemoComponent = React.memo((props: Record<string, unknown>) => (
  <div {...props} />
));

export const FragmentComponent = (props: Record<string, unknown>) => (
  <>
    <div {...props} />
  </>
);
