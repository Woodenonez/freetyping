import type { TypingStats } from '../../utils/typingStats';

type StatsBarProps = {
  isTimerRunning: boolean;
  onResetTimer: () => void;
  onToggleTimer: () => void;
  stats: TypingStats;
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function StatsBar({
  isTimerRunning,
  onResetTimer,
  onToggleTimer,
  stats,
}: StatsBarProps) {
  return (
    <dl className="stats-bar" aria-label="Typing stats">
      <div className="stats-bar__item">
        <dt>Chars</dt>
        <dd>{stats.characterCount}</dd>
      </div>
      <div className="stats-bar__item">
        <dt>Words</dt>
        <dd>{stats.wordCount}</dd>
      </div>
      <div className="stats-bar__item">
        <dt>WPM</dt>
        <dd>{isTimerRunning ? stats.wordsPerMinute : '-'}</dd>
      </div>
      <div className="stats-bar__item">
        <dt>Time</dt>
        <dd className="stats-bar__time">
          <span>{formatDuration(stats.sessionSeconds)}</span>
          <span className="stats-bar__time-divider" aria-hidden="true" />
          <span className="stats-bar__timer-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
              onClick={onToggleTimer}
            >
              {isTimerRunning ? '⏸' : '▶'}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Reset timer"
              onClick={onResetTimer}
            >
              ↺
            </button>
          </span>
        </dd>
      </div>
    </dl>
  );
}
