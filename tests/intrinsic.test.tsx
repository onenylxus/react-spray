import React from 'react';
import ReactSpray from '../src/main';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const { spray } = ReactSpray();

const htmlBlockElements = [
  'address', 'article', 'aside', 'blockquote', 'details',
  'dialog', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'noscript',
  'ol', 'p', 'pre', 'section', 'table', 'tfoot', 'ul',
];

const htmlInlineElements = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'cite',
  'code', 'data', 'datalist', 'dfn', 'em', 'i', 'img', 'input',
  'ins', 'kbd', 'label', 'legend', 'map', 'mark', 'meter',
  'object', 'optgroup', 'option', 'output', 'progress', 'q',
  'rp', 'rt', 'ruby', 's', 'samp', 'select', 'slot', 'small',
  'source', 'span', 'strong', 'sub', 'summary', 'sup', 'textarea',
  'time', 'u', 'var', 'video', 'wbr',
];

const htmlOtherElements = [
  'area', 'audio', 'base', 'canvas', 'caption', 'center',
  'col', 'colgroup', 'del', 'embed',
  'iframe', 'keygen', 'link', 'main', 'menu', 'menuitem',
  'noindex', 'param', 'picture', 'search', 'tbody',
  'td', 'template', 'tfoot', 'th', 'thead', 'tr',
  'track',
];

// These elements cannot be reliably tested as children of <div> in jsdom:
// head, html, meta, title - jsdom moves/ignores them when rendered in body

const svgElements = [
  'animate', 'animateMotion', 'animateTransform', 'circle',
  'clipPath', 'defs', 'desc', 'ellipse', 'feBlend',
  'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA',
  'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
  'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'filter', 'foreignObject', 'g', 'image',
  'line', 'linearGradient', 'marker', 'mask', 'metadata',
  'mpath', 'path', 'pattern', 'polygon', 'polyline',
  'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch',
  'symbol', 'text', 'textPath', 'tspan', 'use', 'view',
];

const otherElements = ['webview'];

const allElements = [
  ...htmlBlockElements,
  ...htmlInlineElements,
  ...htmlOtherElements,
  ...svgElements,
  ...otherElements,
];

describe('intrinsic elements', () => {
  afterEach(cleanup);

  describe.each(allElements)('%s', (tag) => {
    it('renders and gets correct data-spray and data-id', async () => {
      const Component = (spray as Record<string, React.ComponentType<Record<string, unknown>>>)[tag];
      if (!Component) return;

      const testId = `test-${tag}`;
      const { getByTestId } = render(<Component data-testid={testId} />);
      const element = getByTestId(testId);

      await waitFor(() => {
        expect(element).toHaveAttribute('data-spray', tag);
        expect(element).toHaveAttribute('data-id');
      });
    });
  });

  describe.each(allElements)('%s with sibling', (tag) => {
    it('gets indexed data-id when another of the same type is present', async () => {
      const Component = (spray as Record<string, React.ComponentType<Record<string, unknown>>>)[tag];
      if (!Component) return;

      const testId1 = `test-${tag}-1`;
      const testId2 = `test-${tag}-2`;
      const { getByTestId } = render(
        <>
          <Component data-testid={testId1} />
          <Component data-testid={testId2} />
        </>
      );

      await waitFor(() => {
        expect(getByTestId(testId1)).toHaveAttribute('data-id', `div/${tag}[1]`);
        expect(getByTestId(testId2)).toHaveAttribute('data-id', `div/${tag}[2]`);
      });
    });
  });

  describe('mixed HTML elements', () => {
    it('assigns correct indexed paths to mixed element types', async () => {
      const { getByTestId } = render(
        <>
          <spray.div data-testid="div-1" />
          <spray.span data-testid="span" />
          <spray.section data-testid="section" />
          <spray.div data-testid="div-2" />
          <spray.span data-testid="span-2" />
          <spray.p data-testid="p" />
          <spray.div data-testid="div-3" />
        </>
      );

      await waitFor(() => {
        expect(getByTestId('div-1')).toHaveAttribute('data-id', 'div/div[1]');
        expect(getByTestId('span')).toHaveAttribute('data-id', 'div/span[1]');
        expect(getByTestId('section')).toHaveAttribute('data-id', 'div/section');
        expect(getByTestId('div-2')).toHaveAttribute('data-id', 'div/div[2]');
        expect(getByTestId('span-2')).toHaveAttribute('data-id', 'div/span[2]');
        expect(getByTestId('p')).toHaveAttribute('data-id', 'div/p');
        expect(getByTestId('div-3')).toHaveAttribute('data-id', 'div/div[3]');
      });
    });
  });

  describe('nested intrinsic elements', () => {
    it('generates hierarchical paths for nested elements', async () => {
      const { getByTestId } = render(
        <spray.div data-testid="parent">
          <spray.span data-testid="child1">
            <spray.i data-testid="child2" />
          </spray.span>
        </spray.div>
      );

      await waitFor(() => {
        expect(getByTestId('parent')).toHaveAttribute('data-id', 'div/div');
        expect(getByTestId('child1')).toHaveAttribute('data-id', 'div/div/span');
        expect(getByTestId('child2')).toHaveAttribute('data-id', 'div/div/span/i');
      });
    });

    it('handles deep nesting with multiple element types', async () => {
      const { getByTestId } = render(
        <spray.section data-testid="section">
          <spray.article data-testid="article">
            <spray.header data-testid="header">
              <spray.h1 data-testid="h1">Title</spray.h1>
            </spray.header>
            <spray.p data-testid="p1">Content</spray.p>
            <spray.p data-testid="p2">More content</spray.p>
          </spray.article>
        </spray.section>
      );

      await waitFor(() => {
        expect(getByTestId('section')).toHaveAttribute('data-id', 'div/section');
        expect(getByTestId('article')).toHaveAttribute('data-id', 'div/section/article');
        expect(getByTestId('header')).toHaveAttribute('data-id', 'div/section/article/header');
        expect(getByTestId('h1')).toHaveAttribute('data-id', 'div/section/article/header/h1');
        expect(getByTestId('p1')).toHaveAttribute('data-id', 'div/section/article/p[1]');
        expect(getByTestId('p2')).toHaveAttribute('data-id', 'div/section/article/p[2]');
      });
    });
  });

  describe('form elements', () => {
    it('assigns correct paths to form control elements', async () => {
      const { getByTestId } = render(
        <spray.form data-testid="form">
          <spray.input data-testid="input" />
          <spray.textarea data-testid="textarea" />
          <spray.select data-testid="select">
            <spray.option data-testid="option">Option</spray.option>
          </spray.select>
          <spray.button data-testid="button">Submit</spray.button>
          <spray.label data-testid="label">
            <spray.input data-testid="input2" />
          </spray.label>
        </spray.form>
      );

      await waitFor(() => {
        expect(getByTestId('form')).toHaveAttribute('data-id', 'div/form');
        expect(getByTestId('input')).toHaveAttribute('data-id', 'div/form/input');
        expect(getByTestId('textarea')).toHaveAttribute('data-id', 'div/form/textarea');
        expect(getByTestId('select')).toHaveAttribute('data-id', 'div/form/select');
        expect(getByTestId('button')).toHaveAttribute('data-id', 'div/form/button');
        expect(getByTestId('label')).toHaveAttribute('data-id', 'div/form/label');
        expect(getByTestId('input2')).toHaveAttribute('data-id', 'div/form/label/input');
      });
    });
  });

  describe('list elements', () => {
    it('assigns correct paths to list elements', async () => {
      const { getByTestId } = render(
        <spray.ul data-testid="ul">
          <spray.li data-testid="li1">Item 1</spray.li>
          <spray.li data-testid="li2">Item 2</spray.li>
          <spray.li data-testid="li3">Item 3</spray.li>
        </spray.ul>
      );

      await waitFor(() => {
        expect(getByTestId('ul')).toHaveAttribute('data-id', 'div/ul');
        expect(getByTestId('li1')).toHaveAttribute('data-id', 'div/ul/li[1]');
        expect(getByTestId('li2')).toHaveAttribute('data-id', 'div/ul/li[2]');
        expect(getByTestId('li3')).toHaveAttribute('data-id', 'div/ul/li[3]');
      });
    });
  });

  describe('table elements', () => {
    it('assigns correct paths to table structure elements', async () => {
      const { getByTestId } = render(
        <spray.table data-testid="table">
          <spray.thead data-testid="thead">
            <spray.tr data-testid="tr1">
              <spray.th data-testid="th1">Header</spray.th>
            </spray.tr>
          </spray.thead>
          <spray.tbody data-testid="tbody">
            <spray.tr data-testid="tr2">
              <spray.td data-testid="td1">Data</spray.td>
            </spray.tr>
          </spray.tbody>
          <spray.tfoot data-testid="tfoot">
            <spray.tr data-testid="tr3">
              <spray.td data-testid="td2">Footer</spray.td>
            </spray.tr>
          </spray.tfoot>
        </spray.table>
      );

      await waitFor(() => {
        expect(getByTestId('table')).toHaveAttribute('data-id', 'div/table');
        expect(getByTestId('thead')).toHaveAttribute('data-id', 'div/table/thead');
        expect(getByTestId('tbody')).toHaveAttribute('data-id', 'div/table/tbody');
        expect(getByTestId('tfoot')).toHaveAttribute('data-id', 'div/table/tfoot');
        expect(getByTestId('tr1')).toHaveAttribute('data-id', 'div/table/thead/tr');
        expect(getByTestId('tr2')).toHaveAttribute('data-id', 'div/table/tbody/tr');
        expect(getByTestId('tr3')).toHaveAttribute('data-id', 'div/table/tfoot/tr');
      });
    });
  });

  describe('media elements', () => {
    it('assigns correct paths to media elements', async () => {
      const { getByTestId } = render(
        <>
          <spray.audio data-testid="audio" />
          <spray.video data-testid="video" />
          <spray.img data-testid="img" />
          <spray.canvas data-testid="canvas" />
          <spray.picture data-testid="picture" />
          <spray.figure data-testid="figure">
            <spray.figcaption data-testid="figcaption">Caption</spray.figcaption>
          </spray.figure>
        </>
      );

      await waitFor(() => {
        expect(getByTestId('audio')).toHaveAttribute('data-id', 'div/audio');
        expect(getByTestId('video')).toHaveAttribute('data-id', 'div/video');
        expect(getByTestId('img')).toHaveAttribute('data-id', 'div/img');
        expect(getByTestId('canvas')).toHaveAttribute('data-id', 'div/canvas');
        expect(getByTestId('picture')).toHaveAttribute('data-id', 'div/picture');
        expect(getByTestId('figure')).toHaveAttribute('data-id', 'div/figure');
        expect(getByTestId('figcaption')).toHaveAttribute('data-id', 'div/figure/figcaption');
      });
    });
  });

  describe('phrase elements', () => {
    it('assigns correct paths to inline phrase elements', async () => {
      const { getByTestId } = render(
        <spray.p data-testid="p">
          <spray.strong data-testid="strong">
            <spray.em data-testid="em">
              <spray.code data-testid="code">code</spray.code>
            </spray.em>
          </spray.strong>
          <spray.span data-testid="span">
            <spray.a data-testid="a" href="#">link</spray.a>
          </spray.span>
          <spray.mark data-testid="mark">marked</spray.mark>
          <spray.small data-testid="small">small</spray.small>
        </spray.p>
      );

      await waitFor(() => {
        expect(getByTestId('p')).toHaveAttribute('data-id', 'div/p');
        expect(getByTestId('strong')).toHaveAttribute('data-id', 'div/p/strong');
        expect(getByTestId('em')).toHaveAttribute('data-id', 'div/p/strong/em');
        expect(getByTestId('code')).toHaveAttribute('data-id', 'div/p/strong/em/code');
        expect(getByTestId('span')).toHaveAttribute('data-id', 'div/p/span');
        expect(getByTestId('a')).toHaveAttribute('data-id', 'div/p/span/a');
        expect(getByTestId('mark')).toHaveAttribute('data-id', 'div/p/mark');
        expect(getByTestId('small')).toHaveAttribute('data-id', 'div/p/small');
      });
    });
  });

  describe('interactive elements', () => {
    it('assigns correct paths to interactive/details elements', async () => {
      const { getByTestId } = render(
        <spray.details data-testid="details" open>
          <spray.summary data-testid="summary">Summary</spray.summary>
          <spray.p data-testid="p">Details content</spray.p>
        </spray.details>
      );

      await waitFor(() => {
        expect(getByTestId('details')).toHaveAttribute('data-id', 'div/details');
        expect(getByTestId('summary')).toHaveAttribute('data-id', 'div/details/summary');
        expect(getByTestId('p')).toHaveAttribute('data-id', 'div/details/p');
      });
    });
  });
});
