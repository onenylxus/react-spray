import { createElement } from 'react';
import { withSprayFactory } from './factory';
import { Sprayer, SprayOptions } from './sprayer';
import HtmlElements from './htmlElements.json';

function getSprayHtmlElements(withSpray: ReturnType<typeof withSprayFactory>) {
  return Object.fromEntries(
    HtmlElements.map((tag) => {
      const TagComponent = (props: any) => createElement(tag, props);
      return [tag, withSpray(tag)(TagComponent)];
    })
  );
}

export default function createWithSpray(options: Partial<SprayOptions> = {}) {
  const sprayer = new Sprayer(options);
  const withSpray = withSprayFactory(sprayer);
  return {
    withSpray,
    spray: getSprayHtmlElements(withSpray),
  }
}
