import { describe, expect, it } from 'vitest';
import { findFoldSections } from './foldSections';

describe('findFoldSections', () => {
  it('finds a hash title with non-empty body lines', () => {
    expect(findFoldSections('# One\nline a\nline b')).toEqual([
      {
        id: '0:# One',
        title: 'One',
        titleLineIndex: 0,
        titleLength: 5,
        bodyStart: 6,
        bodyEnd: 19,
        bodyFoldEnd: 19,
        bodyText: 'line a\nline b',
        bodyTextWithTerminator: 'line a\nline b',
        bodyLineIndex: 1,
        bodyLineCount: 2,
      },
    ]);
  });

  it('stops the section body at the first empty line', () => {
    expect(findFoldSections('# One\nline a\n\nline b')[0]).toMatchObject({
      bodyLineCount: 1,
    });
  });

  it('ignores titles without a body', () => {
    expect(findFoldSections('# One\n\n# Two')).toEqual([]);
  });
});
