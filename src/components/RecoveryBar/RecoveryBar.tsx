type RecoveryBarProps = {
  reason: string;
  onDismiss: () => void;
  onRestore: () => void;
};

export function RecoveryBar({ reason, onDismiss, onRestore }: RecoveryBarProps) {
  return (
    <div className="recovery-bar" role="status">
      <span>{reason}</span>
      <div className="recovery-bar__actions">
        <button type="button" onClick={onRestore} aria-label="Restore previous text">
          Restore
        </button>
        <button type="button" onClick={onDismiss} aria-label="Dismiss restore option">
          Dismiss
        </button>
      </div>
    </div>
  );
}
