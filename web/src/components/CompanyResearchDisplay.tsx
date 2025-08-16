import type {CompanyResearch} from '../types';

interface CompanyResearchDisplayProps {
  research?: CompanyResearch;
  compact?: boolean;
}

export default function CompanyResearchDisplay({
  research,
  compact = false,
}: CompanyResearchDisplayProps) {
  // Handle undefined research data gracefully
  if (!research) {
    return (
      <div className="text-sm text-gray-500 italic">
        No company research available
      </div>
    );
  }

  if (compact) {
    return (
      <div className="text-sm text-gray-300 space-y-1">
        {research.website && (
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🌐</span>
            <span className="text-gray-400">{research.website}</span>
          </div>
        )}
        {research.rating && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span>{research.rating}/5</span>
          </div>
        )}
        {research.insights && (
          <div className="text-gray-400">
            {research.insights.length > 100
              ? `${research.insights.substring(0, 100)}...`
              : research.insights}
          </div>
        )}
        {((research.pros && research.pros.length > 0) ||
          (research.cons && research.cons.length > 0)) && (
          <div className="flex gap-4 text-xs">
            {research.pros && research.pros.length > 0 && (
              <div className="text-green-400">+{research.pros.length} pros</div>
            )}
            {research.cons && research.cons.length > 0 && (
              <div className="text-red-400">-{research.cons.length} cons</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
      {/* Header with Rating */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Company Research</h4>
        {research.rating && (
          <div className="flex items-center gap-1 text-yellow-400">
            <span>★</span>
            <span className="text-sm">{research.rating}/5</span>
          </div>
        )}
      </div>

      {/* Website and Domain Info */}
      {(research.website || research.domain) && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {research.website && (
            <div>
              <div className="text-gray-400 mb-1">Website</div>
              <a
                href={research.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all"
              >
                {research.website}
              </a>
            </div>
          )}
          {research.domain && (
            <div>
              <div className="text-gray-400 mb-1">Domain</div>
              <div className="text-white">{research.domain}</div>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {research.insights && (
        <div>
          <div className="text-sm text-gray-300">{research.insights}</div>
        </div>
      )}

      {/* Pros and Cons */}
      <div className="grid grid-cols-2 gap-4">
        {research.pros && research.pros.length > 0 && (
          <div>
            <div className="text-sm font-medium text-green-400 mb-2">Pros</div>
            <ul className="text-sm text-gray-300 space-y-1">
              {research.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 text-xs mt-1">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {research.cons && research.cons.length > 0 && (
          <div>
            <div className="text-sm font-medium text-red-400 mb-2">Cons</div>
            <ul className="text-sm text-gray-300 space-y-1">
              {research.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-400 text-xs mt-1">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-600">
        Updated: {new Date(research.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
