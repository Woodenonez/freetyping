import { describe, expect, it } from 'vitest';
import { insertTextAtSelection } from './textInsertion';

describe('insertTextAtSelection', () => {
  it('inserts text at a collapsed selection', () => {
    expect(
      insertTextAtSelection({
        value: 'helo',
        insertText: 'l',
        selectionStart: 2,
        selectionEnd: 2,
      }),
    ).toEqual({
      value: 'hello',
      selectionStart: 3,
      selectionEnd: 3,
    });
  });

  it('replaces selected text', () => {
    expect(
      insertTextAtSelection({
        value: 'abc',
        insertText: 'x',
        selectionStart: 1,
        selectionEnd: 3,
      }),
    ).toEqual({
      value: 'ax',
      selectionStart: 2,
      selectionEnd: 2,
    });
  });

  it('clamps out-of-range selections', () => {
    expect(
      insertTextAtSelection({
        value: 'abc',
        insertText: '!',
        selectionStart: 99,
        selectionEnd: 100,
      }),
    ).toEqual({
      value: 'abc!',
      selectionStart: 4,
      selectionEnd: 4,
    });
  });
});
