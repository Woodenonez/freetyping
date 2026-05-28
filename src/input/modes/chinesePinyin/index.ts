import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InputMode } from '../../types';
import {
  getCandidatePageState,
  getPinyinCandidates,
} from './candidates';
import { loadGeneratedPinyinDictionary } from './dictionaryLoader';

export const chinesePinyinInputMode: InputMode = {
  id: 'zh-pinyin',
  label: 'Chinese Pinyin',
  language: 'zh-CN',
  description: 'Dictionary-backed web Pinyin input method.',
};

export type ChinesePinyinViewState = {
  buffer: string;
  candidates: string[];
  dictionaryStatus: 'idle' | 'loading' | 'ready' | 'error';
  pageCount: number;
  pageIndex: number;
  pageStartIndex: number;
  selectedCandidateIndex: number;
  visibleCandidates: string[];
};

const emptyViewState: ChinesePinyinViewState = {
  buffer: '',
  candidates: [],
  dictionaryStatus: 'idle',
  pageCount: 0,
  pageIndex: 0,
  pageStartIndex: 0,
  selectedCandidateIndex: 0,
  visibleCandidates: [],
};

export type ChinesePinyinOptions = {
  fuzzyMatching: boolean;
};

const chinesePunctuationByKey: Record<string, string> = {
  ',': '，',
  '.': '。',
  '?': '？',
  '!': '！',
  ';': '；',
  ':': '：',
};

function isLetterKey(event: KeyboardEvent): boolean {
  return (
    /^[a-z]$/i.test(event.key) &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}

function isNumberSelectionKey(event: KeyboardEvent): boolean {
  return /^[1-9]$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey;
}

function isCandidateNavigationKey(key: string): boolean {
  return (
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown'
  );
}

function getChinesePunctuation(event: KeyboardEvent): string | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }

  return chinesePunctuationByKey[event.key] ?? null;
}

export function useChinesePinyinController(
  active: boolean,
  options: ChinesePinyinOptions,
): {
  inputMode: InputMode;
  viewState: ChinesePinyinViewState;
  reset: () => void;
} {
  const [viewState, setViewState] =
    useState<ChinesePinyinViewState>(emptyViewState);

  const reset = useCallback(() => {
    setViewState((currentState) => ({
      ...emptyViewState,
      dictionaryStatus: currentState.dictionaryStatus,
    }));
  }, []);

  const updateBuffer = useCallback((buffer: string) => {
    const candidates = getPinyinCandidates(buffer, {
      fuzzyMatching: options.fuzzyMatching,
    });
    const pageState = getCandidatePageState(candidates, 0);
    setViewState({
      dictionaryStatus: viewState.dictionaryStatus,
      buffer,
      candidates,
      ...pageState,
      selectedCandidateIndex: 0,
    });
  }, [options.fuzzyMatching, viewState.dictionaryStatus]);

  useEffect(() => {
    if (!active || viewState.dictionaryStatus !== 'idle') {
      return;
    }

    setViewState((currentState) => ({
      ...currentState,
      dictionaryStatus: 'loading',
    }));

    void loadGeneratedPinyinDictionary()
      .then(() => {
        setViewState((currentState) => {
          const candidates = getPinyinCandidates(currentState.buffer, {
            fuzzyMatching: options.fuzzyMatching,
          });
          const selectedCandidateIndex = Math.min(
            currentState.selectedCandidateIndex,
            Math.max(0, candidates.length - 1),
          );
          const pageState = getCandidatePageState(
            candidates,
            selectedCandidateIndex,
          );

          return {
            ...currentState,
            ...pageState,
            candidates,
            dictionaryStatus: 'ready',
            selectedCandidateIndex,
          };
        });
      })
      .catch(() => {
        setViewState((currentState) => ({
          ...currentState,
          dictionaryStatus: 'error',
        }));
      });
  }, [active, options.fuzzyMatching, viewState.dictionaryStatus]);

  const selectCandidate = useCallback((selectedCandidateIndex: number) => {
    setViewState((currentState) => {
      if (currentState.candidates.length === 0) {
        return currentState;
      }

      const lastCandidateIndex = currentState.candidates.length - 1;
      const nextSelectedCandidateIndex = Math.max(
        0,
        Math.min(selectedCandidateIndex, lastCandidateIndex),
      );
      const pageState = getCandidatePageState(
        currentState.candidates,
        nextSelectedCandidateIndex,
      );

      return {
        ...currentState,
        ...pageState,
        selectedCandidateIndex: nextSelectedCandidateIndex,
      };
    });
  }, []);

  const inputMode = useMemo<InputMode>(
    () => ({
      ...chinesePinyinInputMode,
      onKeyDown(event, context) {
        if (!active || context.isComposing) {
          return null;
        }

        if (isLetterKey(event)) {
          updateBuffer(`${viewState.buffer}${event.key.toLowerCase()}`);
          return {
            handled: true,
            preventDefault: true,
          };
        }

        const chinesePunctuation = getChinesePunctuation(event);

        if (viewState.buffer.length === 0) {
          if (chinesePunctuation) {
            return {
              handled: true,
              insertText: chinesePunctuation,
              preventDefault: true,
            };
          }

          return null;
        }

        if (chinesePunctuation) {
          const commitText =
            viewState.candidates[viewState.selectedCandidateIndex] ??
            viewState.buffer;
          reset();
          return {
            handled: true,
            insertText: `${commitText}${chinesePunctuation}`,
            preventDefault: true,
          };
        }

        if (event.key === 'Backspace') {
          const nextBuffer = viewState.buffer.slice(0, -1);

          if (nextBuffer.length === 0) {
            reset();
          } else {
            updateBuffer(nextBuffer);
          }

          return {
            handled: true,
            preventDefault: true,
          };
        }

        if (event.key === 'Escape') {
          reset();
          return {
            handled: true,
            preventDefault: true,
          };
        }

        if (event.key === ' ') {
          const commitText =
            viewState.candidates[viewState.selectedCandidateIndex] ??
            viewState.buffer;
          reset();
          return {
            handled: true,
            insertText: commitText,
            preventDefault: true,
          };
        }

        if (isCandidateNavigationKey(event.key)) {
          if (viewState.candidates.length === 0) {
            return {
              handled: true,
              preventDefault: true,
            };
          }

          if (event.key === 'ArrowLeft') {
            selectCandidate(viewState.selectedCandidateIndex - 1);
          }

          if (event.key === 'ArrowRight') {
            selectCandidate(viewState.selectedCandidateIndex + 1);
          }

          if (event.key === 'ArrowUp') {
            selectCandidate(0);
          }

          if (event.key === 'ArrowDown') {
            selectCandidate(viewState.candidates.length - 1);
          }

          return {
            handled: true,
            preventDefault: true,
          };
        }

        if (isNumberSelectionKey(event)) {
          const candidateIndex =
            viewState.pageStartIndex + Number(event.key) - 1;
          const candidate = viewState.candidates[candidateIndex];

          if (!candidate) {
            return {
              handled: true,
              preventDefault: true,
            };
          }

          reset();
          return {
            handled: true,
            insertText: candidate,
            preventDefault: true,
          };
        }

        return null;
      },
    }),
    [active, reset, selectCandidate, updateBuffer, viewState],
  );

  return {
    inputMode,
    viewState,
    reset,
  };
}
