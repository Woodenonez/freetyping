import { useCallback, useMemo, useState } from 'react';
import type { InputMode } from '../../types';
import { getPinyinCandidates } from './candidates';

export const chinesePinyinInputMode: InputMode = {
  id: 'zh-pinyin',
  label: 'Chinese Pinyin',
  language: 'zh-CN',
  description: 'Minimal dictionary-backed web Pinyin input method.',
};

export type ChinesePinyinViewState = {
  buffer: string;
  candidates: string[];
  selectedCandidateIndex: number;
};

const emptyViewState: ChinesePinyinViewState = {
  buffer: '',
  candidates: [],
  selectedCandidateIndex: 0,
};

function isLetterKey(event: KeyboardEvent): boolean {
  return /^[a-z]$/i.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey;
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

export function useChinesePinyinController(active: boolean): {
  inputMode: InputMode;
  viewState: ChinesePinyinViewState;
  reset: () => void;
} {
  const [viewState, setViewState] =
    useState<ChinesePinyinViewState>(emptyViewState);

  const reset = useCallback(() => {
    setViewState(emptyViewState);
  }, []);

  const updateBuffer = useCallback((buffer: string) => {
    const candidates = getPinyinCandidates(buffer);
    setViewState({
      buffer,
      candidates,
      selectedCandidateIndex: 0,
    });
  }, []);

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

      return {
        ...currentState,
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

        if (viewState.buffer.length === 0) {
          return null;
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
          const candidateIndex = Number(event.key) - 1;
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
