import type { ChinesePinyinViewState } from '../../input/modes/chinesePinyin';

type PinyinCandidateBarProps = {
  viewState: ChinesePinyinViewState;
};

export function PinyinCandidateBar({ viewState }: PinyinCandidateBarProps) {
  if (viewState.buffer.length === 0) {
    return null;
  }

  return (
    <div className="pinyin-bar" aria-live="polite">
      <div className="pinyin-bar__buffer">{viewState.buffer}</div>
      {viewState.candidates.length > 0 ? (
        <ol className="pinyin-bar__candidates" aria-label="Pinyin candidates">
          {viewState.candidates.map((candidate, index) => (
            <li
              className="pinyin-bar__candidate"
              data-selected={
                index === viewState.selectedCandidateIndex ? 'true' : 'false'
              }
              key={`${candidate}-${index}`}
            >
              <span className="pinyin-bar__index">{index + 1}</span>
              <span>{candidate}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="pinyin-bar__empty">Space commits plain text</div>
      )}
    </div>
  );
}
