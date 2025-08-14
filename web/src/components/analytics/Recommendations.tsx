interface CompanyData {
  company: string;
  offer_count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
}

interface StatsData {
  averageSalary: number;
  medianSalary: number;
  p25: number;
  p75: number;
  totalOffers: number;
}

interface RecommendationsProps {
  companies: CompanyData[];
  stats: StatsData;
  offers: any[];
}

export default function Recommendations({
  companies,
  stats,
}: RecommendationsProps) {
  if (!companies || companies.length === 0 || !stats) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">Not enough data for recommendations</p>
      </div>
    );
  }

  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate insights based on data patterns
  const generateInsights = () => {
    const insights = [];

    // Company insights
    const topCompany = companies[0];
    const topCompanyAvg = topCompany.avgSalary;
    const overallAvg = stats.averageSalary;

    if (topCompanyAvg >= overallAvg * 1.15) {
      insights.push({
        type: 'company',
        priority: 'high',
        title: 'Focus on High-Paying Companies',
        message: `${topCompany.company} pays ~${Math.round(
          (topCompanyAvg / overallAvg - 1) * 100,
        )}% above your market average. Target similar companies for better compensation.`,
        action: 'Apply to companies in the same tier as ' + topCompany.company,
        icon: '🏢',
      });
    }

    // Market positioning insights
    if (stats.p75 - stats.medianSalary <= stats.medianSalary * 0.05) {
      insights.push({
        type: 'market',
        priority: 'medium',
        title: 'Tight Market Conditions',
        message:
          'Your offers cluster tightly around the median, suggesting a competitive market with limited salary variation.',
        action:
          'Anchor negotiations closer to the top of your range and emphasize unique strengths',
        icon: '📊',
      });
    }

    // Salary distribution insights
    if (stats.averageSalary > stats.medianSalary * 1.1) {
      insights.push({
        type: 'distribution',
        priority: 'medium',
        title: 'High Outliers Present',
        message:
          'You have several high-paying offers pulling your average up. Use these as leverage in negotiations.',
        action:
          'Lead with your highest offers when discussing salary expectations',
        icon: '🚀',
      });
    }

    // Data quality insights
    if (stats.totalOffers < 10) {
      insights.push({
        type: 'data',
        priority: 'low',
        title: 'Limited Data Sample',
        message: `With only ${stats.totalOffers} offers, your insights may not be fully representative of the market.`,
        action: 'Continue collecting offer data for more accurate analytics',
        icon: '📈',
      });
    }

    // Negotiation strategy insights
    if (stats.p75 - stats.p25 >= stats.medianSalary * 0.3) {
      insights.push({
        type: 'strategy',
        priority: 'high',
        title: 'Wide Salary Range',
        message:
          'Your offers span a wide range, indicating significant negotiation potential.',
        action:
          'Aim for the 75th percentile in negotiations, using your top offers as evidence',
        icon: '🎯',
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 'low':
        return 'border-blue-500/30 bg-blue-900/20';
      default:
        return 'border-gray-500/30 bg-gray-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Smart Recommendations
      </h2>

      {/* Executive Summary */}
      <div className="bg-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          Executive Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400 mb-2">
              {formatSalary(stats.averageSalary)}
            </p>
            <p className="text-gray-400">Target Salary</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400 mb-2">
              {formatSalary(stats.p75)}
            </p>
            <p className="text-gray-400">Negotiation Ceiling</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400 mb-2">
              {insights.length}
            </p>
            <p className="text-gray-400">Action Items</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-6 ${getPriorityColor(
              insight.priority,
            )}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">{insight.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm">
                    {getPriorityIcon(insight.priority)}
                  </span>
                  <h4 className="text-lg font-semibold text-white">
                    {insight.title}
                  </h4>
                </div>
                <p className="text-gray-300 mb-3">{insight.message}</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">
                    💡 <strong>Action:</strong>
                  </p>
                  <p className="text-white">{insight.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-2xl mr-3">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            📊 Export for Negotiations
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            🎯 Set Salary Target
          </button>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mt-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 <strong>Pro tip:</strong> Use these insights to prepare for salary
          negotiations. Having data-backed evidence significantly improves your
          bargaining position.
        </p>
      </div>
    </div>
  );
}
