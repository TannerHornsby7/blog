import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { rehypeCustomSpoiler, matchSpoilerText, createSpoilerNode, modifyNode } from '../spoiler';
import { Element, Parent } from 'hast';

async function process(input: string) {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeCustomSpoiler)
    .use(rehypeStringify)
    .process(input);
  return result.toString();
}

describe('rehype-custom-spoiler', () => {
  it.each([
    ['<blockquote><p>! This is a spoiler</p></blockquote>', 'simple spoiler'],
    ['<blockquote><p>!This is a spoiler without space</p></blockquote>', 'spoiler without space'],
    ['<blockquote><p>! Multi-line\nspoiler\ncontent</p></blockquote>', 'multi-line spoiler'],
    ['<blockquote><p>! Spoiler with <em>formatting</em></p></blockquote>', 'spoiler with formatting'],
  ])('transforms spoiler blockquote to custom spoiler element (%s)', async (input, description) => {
    const output = await process(input);
    expect(output).toContain('<div class="spoiler-container">');
    expect(output).toContain('<span class="spoiler-content">');
    expect(output).toContain('<span class="spoiler-overlay">Hover or click to show</span>');
    expect(output).not.toContain('<blockquote>');
  });

  it.each([
    ['<blockquote><p>This is not a spoiler</p></blockquote>', 'regular blockquote'],
    ['<p>! This is not in a blockquote</p>', 'not in blockquote'],
  ])('does not transform non-spoiler content (%s)', async (input, description) => {
    const output = await process(input);
    expect(output).toBe(input);
  });

  it.each([
    ['!This is a spoiler', true],
    ['! This is a spoiler', true],
    ['This is not a spoiler', false],
  ])('matchSpoilerText function (%s)', (input: string, expectedSpoiler: boolean) => {
    const match = matchSpoilerText(input)
    if (expectedSpoiler) {
      expect(match).toBeTruthy()
    } else {
      expect(match).toBeFalsy()
    }
  });

  test('createSpoilerNode function', () => {
    const node = createSpoilerNode('Spoiler content') as Element;

    expect(node.tagName).toBe('div');
    expect(node.properties?.className).toContain('spoiler-container');
    expect(node.children).toHaveLength(2);
    expect((node.children[0] as Element).tagName).toBe('span');
    expect((node.children[0] as Element).properties?.className).toContain('spoiler-content');
    expect((node.children[1] as Element).tagName).toBe('span');
    expect((node.children[1] as Element).properties?.className).toContain('spoiler-overlay');
  });

  it.each([
    ['!Spoiler text', 'simple spoiler'],
    ['! Spoiler with space', 'spoiler with space'],
    ['!Multi-line\nspoiler', 'multi-line spoiler'],
  ])('modifyNode function (%s)', (spoilerText, description) => {
    const node: Element = {
      type: 'element',
      tagName: 'blockquote',
      properties: {},
      children: [{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: spoilerText }] }]
    };
    const parent: Parent = { type: 'root', children: [node] };
    modifyNode(node, 0, parent);

    expect((parent.children[0] as Element).tagName).toBe('div');
    expect((parent.children[0] as Element).properties?.className).toContain('spoiler-container');
    expect((parent.children[0] as Element).children).toHaveLength(2);
    expect(((parent.children[0] as Element).children[0] as Element).properties?.className).toContain('spoiler-content');
    expect(((parent.children[0] as Element).children[1] as Element).properties?.className).toContain('spoiler-overlay');
  });
})