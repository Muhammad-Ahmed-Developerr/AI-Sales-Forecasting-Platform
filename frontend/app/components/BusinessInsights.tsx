"use client"

interface BusinessInsight {
  type: string
  title: string
  description: string
  impact: string
  action: string
  confidence: number
}

interface BusinessInsightsProps {
  insights: BusinessInsight[]
}

export default function BusinessInsights({ insights }: BusinessInsightsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return '🚀'
      case 'warning':
        return '⚠️'
      case 'info':
        return '💡'
      case 'opportunity':
        return '🎯'
      case 'ai':
        return '🤖'
      default:
        return '📊'
    }
  }

  const getColorClass = (type: string) => {
    switch (type) {
      case 'positive':
        return 'from-green-500/10 to-emerald-500/10 border-green-500/20'
      case 'warning':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
      case 'info':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
      case 'opportunity':
        return 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
      case 'ai':
        return 'from-purple-500/10 to-indigo-500/10 border-purple-500/20'
      default:
        return 'from-slate-500/10 to-slate-600/10 border-slate-500/20'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return 'High'
    if (confidence >= 0.7) return 'Medium'
    return 'Low'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
        <span>🧠</span>
        <span>AI Business Insights</span>
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {insights.map((insight, idx) => (
          <div 
            key={idx}
            className={`bg-gradient-to-br rounded-2xl p-6 border hover-lift ${getColorClass(insight.type)}`}
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-3xl">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">{insight.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{insight.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                  {insight.impact.toUpperCase()} IMPACT
                </span>
                <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                  {getConfidenceLevel(insight.confidence)} Confidence
                </span>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm font-medium">AI Recommendation</p>
                <p className="text-slate-300 text-sm">{insight.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">No insights generated for this dataset</p>
          <p className="text-slate-500 text-sm mt-2">Upload more data to get AI-powered insights</p>
        </div>
      )}
    </div>
  )
}