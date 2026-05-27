import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { findFoldSections, type FoldSection } from '../../utils/foldSections';

type FoldedSection = {
  bodyStart: number;
  bodyText: string;
  lineCount: number;
  title: string;
  titleLength: number;
  titleLineIndex: number;
};

type EditorMetrics = {
  lineHeight: number;
  paddingTop: number;
};

export type FoldControl = {
  badgeLabel: string;
  id: string;
  isFolded: boolean;
  title: string;
  titleLength: number;
  titleTop: number;
  toggle: () => void;
};

const defaultEditorMetrics: EditorMetrics = {
  lineHeight: 28.8,
  paddingTop: 16,
};

function getFoldPlaceholder(lineCount: number) {
  return `${lineCount} folded line${lineCount === 1 ? '' : 's'}`;
}

function getFoldedSectionAsFoldSection(
  id: string,
  foldedSection: FoldedSection,
): FoldSection {
  return {
    id,
    title: foldedSection.title,
    titleLineIndex: foldedSection.titleLineIndex,
    titleLength: foldedSection.titleLength,
    bodyStart: foldedSection.bodyStart,
    bodyEnd: foldedSection.bodyStart,
    bodyFoldEnd: foldedSection.bodyStart,
    bodyText: foldedSection.bodyText,
    bodyTextWithTerminator: foldedSection.bodyText,
    bodyLineIndex: foldedSection.titleLineIndex + 1,
    bodyLineCount: foldedSection.lineCount,
  };
}

function measureEditor(textarea: HTMLTextAreaElement | null): EditorMetrics {
  if (!textarea) {
    return defaultEditorMetrics;
  }

  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const paddingTop = Number.parseFloat(styles.paddingTop);

  return {
    lineHeight: Number.isFinite(lineHeight)
      ? lineHeight
      : defaultEditorMetrics.lineHeight,
    paddingTop: Number.isFinite(paddingTop)
      ? paddingTop
      : defaultEditorMetrics.paddingTop,
  };
}

type UseFoldControlsOptions = {
  scrollTop: number;
  text: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function useFoldControls({
  scrollTop,
  text,
  textareaRef,
}: UseFoldControlsOptions): FoldControl[] {
  const [foldedSections, setFoldedSections] = useState<
    Map<string, FoldedSection>
  >(() => new Map());
  const [editorMetrics, setEditorMetrics] = useState(defaultEditorMetrics);
  const foldSections = useMemo(() => findFoldSections(text), [text]);

  useLayoutEffect(() => {
    const measuredMetrics = measureEditor(textareaRef.current);

    setEditorMetrics((currentMetrics) => {
      if (
        currentMetrics.lineHeight === measuredMetrics.lineHeight &&
        currentMetrics.paddingTop === measuredMetrics.paddingTop
      ) {
        return currentMetrics;
      }

      return measuredMetrics;
    });
  });

  const visibleFoldSections = useMemo(
    () => [
      ...foldSections,
      ...Array.from(foldedSections, ([id, section]) =>
        getFoldedSectionAsFoldSection(id, section),
      ),
    ],
    [foldSections, foldedSections],
  );

  return visibleFoldSections.map((section) => {
    const foldedSection = foldedSections.get(section.id);
    const isFolded = Boolean(foldedSection);
    const titleTop =
      editorMetrics.paddingTop +
      section.titleLineIndex * editorMetrics.lineHeight -
      scrollTop;

    return {
      badgeLabel: getFoldPlaceholder(
        foldedSection?.lineCount ?? section.bodyLineCount,
      ),
      id: section.id,
      isFolded,
      title: section.title,
      titleLength: section.titleLength,
      titleTop,
      toggle() {
        const textarea = textareaRef.current;

        if (!textarea) {
          return;
        }

        const currentText = textarea.value;
        const replacementText = isFolded
          ? foldedSection?.bodyText ?? section.bodyTextWithTerminator
          : '';
        const replacementEnd = isFolded ? section.bodyStart : section.bodyFoldEnd;
        const nextText =
          currentText.slice(0, section.bodyStart) +
          replacementText +
          currentText.slice(replacementEnd);

        textarea.value = nextText;
        textarea.setSelectionRange(
          section.bodyStart,
          section.bodyStart + replacementText.length,
        );
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        setFoldedSections((currentSections) => {
          const nextSections = new Map(currentSections);

          if (isFolded) {
            nextSections.delete(section.id);
          } else {
            nextSections.set(section.id, {
              bodyStart: section.bodyStart,
              bodyText: section.bodyTextWithTerminator,
              lineCount: section.bodyLineCount,
              title: section.title,
              titleLength: section.titleLength,
              titleLineIndex: section.titleLineIndex,
            });
          }

          return nextSections;
        });
        textarea.focus();
      },
    };
  });
}
