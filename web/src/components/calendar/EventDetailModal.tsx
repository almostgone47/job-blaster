import type {CalendarEvent} from '../../types';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  if (!event || !isOpen) return null;

  const getEventIcon = () => {
    switch (event.type) {
      case 'interview':
        return '🎯';
      case 'deadline':
        return '⏰';
      case 'follow-up':
        return '📝';
      default:
        return '📅';
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'interview':
        return 'text-blue-400';
      case 'deadline':
        return 'text-red-400';
      case 'follow-up':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 p-6 text-left align-middle shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${getEventColor()}`}>{getEventIcon()}</div>
          <div className="flex-1">
            <h3 className="text-lg font-medium leading-6 text-white">
              {event.title}
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Company:</span> {event.company}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium">Date:</span>{' '}
                {event.date.toLocaleDateString()}
              </p>
              {event.time && (
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Time:</span> {event.time}
                </p>
              )}
              <p className="text-sm text-gray-300">
                <span className="font-medium">Status:</span> {event.status}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium">Type:</span>{' '}
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
