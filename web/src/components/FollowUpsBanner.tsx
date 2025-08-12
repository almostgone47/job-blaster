import {useQuery} from '@tanstack/react-query';
import {getApplicationsDueToday} from '../api';

export default function FollowUpsBanner() {
  const {data: dueApplications, isLoading} = useQuery({
    queryKey: ['applications', 'due-today'],
    queryFn: getApplicationsDueToday,
  });

  if (isLoading || !dueApplications || dueApplications.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-yellow-800">
            Follow-ups due today ({dueApplications.length})
          </h3>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {dueApplications.slice(0, 3).map((app) => (
          <div key={app.id} className="text-sm text-yellow-700">
            • {app.job.title} at {app.job.company}
          </div>
        ))}
        {dueApplications.length > 3 && (
          <div className="text-sm text-yellow-600">
            ...and {dueApplications.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
