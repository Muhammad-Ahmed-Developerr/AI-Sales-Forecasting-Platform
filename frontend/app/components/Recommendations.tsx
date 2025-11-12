"use client"

interface Recommendation {
  category: string
  title: string
  description: string
  priority: string
  timeframe: string
  impact: string
  ai_confidence: number
}

interface RecommendationsProps {
  businessMetrics: any
  forecast: any
  productAnalysis?: any
  recommendations: Recommendation[]
}

export default function Recommendations({ businessMetrics, forecast, productAnalysis, recommendations }: RecommendationsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return '📦'
      case 'marketing':
        return '🎯'
      case 'product':
        return '⭐'
      case 'operations':
        return '⚙️'
      case 'finance':
        return '💰'
      case 'ai':
        return '🤖'
      default:
        return '💡'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">AI-Powered Recommendations</h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10 hover-lift group">
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-2xl group-hover:scale-110 transition-transform">
                {getCategoryIcon(rec.category)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{rec.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{rec.description}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
                <span className={`text-xs ${getConfidenceColor(rec.ai_confidence)}`}>
                  {(rec.ai_confidence * 100).toFixed(0)}% AI
                </span>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-xs">Timeframe</div>
                <div className="text-slate-300 text-sm font-medium">{rec.timeframe}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Projection */}
      <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h4 className="text-xl font-semibold text-cyan-400 mb-2">Business Outlook</h4>
            <p className="text-slate-300 max-w-2xl">
              Based on AI analysis of your current trends and market patterns, here's your projected business outlook:
            </p>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-4xl font-bold gradient-text-ai mb-2">
              +{businessMetrics.growth_rate_30d?.toFixed(1) || '15'}%
            </div>
            <div className="text-slate-400">Expected 30-day growth</div>
          </div>
        </div>
        
        {businessMetrics.trend_strength && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Trend Strength:</span>
              <span className="text-cyan-400 font-medium">{(businessMetrics.trend_strength * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Momentum:</span>
              <span className="text-green-400 font-medium">{businessMetrics.momentum?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">AI Confidence:</span>
              <span className="text-purple-400 font-medium">{(forecast.metrics.model_confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💡</div>
          <p className="text-slate-400">No recommendations available</p>
          <p className="text-slate-500 text-sm mt-2">Upload more data to get personalized AI recommendations</p>
        </div>
      )}
    </div>
  )
}