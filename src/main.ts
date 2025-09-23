import { withSprayFactory } from './factory';
import { Sprayer, SprayOptions } from './sprayer';
import { getInstrinsicElements, Intrinsics } from './intrinsic';

interface ReactSpray {
  withSpray: ReturnType<typeof withSprayFactory>;
  spray: Intrinsics;
}

/**
 * Initialize a sprayer to spray components.
 *
 * @param options Spraying options
 * @returns An object containing an HOC `withSpray` and a `spray` object with intrinsic elements
 */
export default function createWithSpray(
  options: Partial<SprayOptions> = {}
): ReactSpray {
  const sprayer = new Sprayer(options);
  const withSpray = withSprayFactory(sprayer);
  return {
    withSpray,
    spray: getInstrinsicElements(withSpray),
  };
}
