import type { ChinesePinyinViewState } from '../../input/modes/chinesePinyin';

type PinyinCandidateBarProps = {
  showPageCount: boolean;
  viewState: ChinesePinyinViewState;
};

export function PinyinCandidateBar({
  showPageCount,
  viewState,
}: PinyinCandidateBarProps) {
  if (viewState.buffer.length === 0) {
    return null;
  }

  return (
    <div className="pinyin-bar" aria-live="polite">
      <div className="pinyin-bar__buffer">{viewState.buffer}</div>
      {viewState.candidates.length > 0 ? (
        <>
          <ol className="pinyin-bar__candidates" aria-label="Pinyin candidates">
            {viewState.visibleCandidates.map((candidate, index) => {
              const candidateIndex = viewState.pageStartIndex + index;

              return (
                <li
                  className="pinyin-bar__candidate"
                  data-selected={
                    candidateIndex === viewState.selectedCandidateIndex
                      ? 'true'
                      : 'false'
                  }
                  key={`${candidate}-${candidateIndex}`}
                >
                  <span className="pinyin-bar__index">{index + 1}</span>
                  <span>{candidate}</span>
                </li>
              );
            })}
          </ol>
          {showPageCount && viewState.pageCount > 1 ? (
            <div className="pinyin-bar__page">
              {viewState.pageIndex + 1}/{viewState.pageCount}
            </div>
          ) : null}
        </>
      ) : viewState.dictionaryStatus === 'loading' ? (
        <div className="pinyin-bar__empty">Loading dictionary</div>
      ) : viewState.dictionaryStatus === 'error' ? (
        <div className="pinyin-bar__empty">Dictionary unavailable</div>
      ) : (
        <div className="pinyin-bar__empty">Space commits plain text</div>
      )}
    </div>
  );
}
