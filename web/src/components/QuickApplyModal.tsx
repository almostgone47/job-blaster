import {useState} from 'react';

export default function QuickApplyModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (coverNote?: string) => void;
}) {
  const [note, setNote] = useState('');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mark as Applied</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium">
            Cover note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Short blurb you used / plan to use…"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note || undefined)}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm "
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
