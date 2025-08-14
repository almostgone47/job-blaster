interface CollectMoreDataProps {
  offerCount: number;
  className?: string;
}

export function CollectMoreData({
  offerCount,
  className = '',
}: CollectMoreDataProps) {
  const getGuidance = () => {
    if (offerCount === 0) {
      return {
        title: 'Start Building Your Salary Profile',
        description:
          "You don't have any salary data yet. Here's how to get started:",
        examples: [
          'Add salary information when creating new job applications',
          'Update existing jobs with salary details from job postings',
          'Track salary offers you receive during interviews',
          'Record your current salary and any raises/promotions',
        ],
      };
    } else if (offerCount < 3) {
      return {
        title: 'Need More Data for Reliable Insights',
        description:
          'With just a few data points, your analytics may not be accurate. Add more to get better insights:',
        examples: [
          "Add salary ranges from job postings you're interested in",
          'Track salary offers from different companies',
          'Record salary data from your network and industry research',
          'Include benefits and equity information when available',
        ],
      };
    } else {
      return {
        title: 'Almost There!',
        description:
          'A few more data points will give you much more reliable insights:',
        examples: [
          'Add salary data from recent job applications',
          'Track any new offers or salary discussions',
          'Include location-specific salary information',
          'Record industry-specific compensation data',
        ],
      };
    }
  };

  const guidance = getGuidance();

  return (
    <div
      className={`bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-xl p-8 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-white mb-2">{guidance.title}</h2>
        <p className="text-blue-200 text-lg">{guidance.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
            <span className="text-2xl mr-3">💡</span>
            Quick Actions
          </h3>
          <ul className="space-y-3 text-blue-200">
            {guidance.examples.slice(0, 2).map((example, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            Pro Tips
          </h3>
          <ul className="space-y-3 text-purple-200">
            {guidance.examples.slice(2).map((example, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-4 py-2">
          <span className="text-blue-300">📈</span>
          <span className="text-blue-200 text-sm">
            Target: {offerCount < 3 ? '5+ offers' : '10+ offers'} for reliable
            insights
          </span>
        </div>
      </div>
    </div>
  );
}
