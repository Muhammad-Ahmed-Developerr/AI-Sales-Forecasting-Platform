"use client"

interface AIAnalysisProps {
  analysis: {
    trend_analysis?: {
      primary_trend: string
      trend_confidence: number
      acceleration_rate: number
      key_drivers: string[]
    }
    seasonality_analysis?: {
      seasonal_strength: number
      peak_periods: string[]
      seasonal_impact: number
    }
    anomaly_detection?: {
      anomalies_detected: number
      anomaly_impact: string
      recommended_actions: string[]
    }
    growth_potential?: {
      estimated_potential: number
      growth_levers: string[]
      timeline: string
    }
  }
}

export default function AIAnalysis({ analysis }: AIAnalysisProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'upward': return 'text-green-400'
      case 'downward': return 'text-red-400'
      case 'stable': return 'text-yellow-400'
      default: return 'text-slate-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="glass-ai rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
        <span>🤖</span>
        <span>AI-Powered Deep Analysis</span>
      </h3>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-cyan-400 flex items-center space-x-2">
            <span>📈</span>
            <span>Trend Analysis</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Primary Trend</span>
              <span className={`font-semibold ${getTrendColor(analysis.trend_analysis?.primary_trend || '')}`}>
                {analysis.trend_analysis?.primary_trend || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Trend Confidence</span>
              <span className="text-white font-semibold">
                {analysis.trend_analysis ? `${(analysis.trend_analysis.trend_confidence * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Acceleration Rate</span>
              <span className="text-green-400 font-semibold">
                {analysis.trend_analysis?.acceleration_rate || 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-300 block mb-2">Key Drivers</span>
              <div className="flex flex-wrap gap-2">
                {analysis.trend_analysis?.key_drivers.map((driver, idx) => (
                  <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seasonality Analysis */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-400 flex items-center space-x-2">
            <span>🌊</span>
            <span>Seasonality Analysis</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Seasonal Strength</span>
              <span className="text-white font-semibold">
                {analysis.seasonality_analysis ? `${(analysis.seasonality_analysis.seasonal_strength * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Seasonal Impact</span>
              <span className="text-purple-400 font-semibold">
                {analysis.seasonality_analysis?.seasonal_impact || 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-300 block mb-2">Peak Periods</span>
              <div className="flex flex-wrap gap-2">
                {analysis.seasonality_analysis?.peak_periods.map((period, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                    {period}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-orange-400 flex items-center space-x-2">
            <span>⚡</span>
            <span>Anomaly Detection</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Anomalies Detected</span>
              <span className="text-white font-semibold">
                {analysis.anomaly_detection?.anomalies_detected || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Impact Level</span>
              <span className={`font-semibold ${getImpactColor(analysis.anomaly_detection?.anomaly_impact || '')}`}>
                {analysis.anomaly_detection?.anomaly_impact || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-300 block mb-2">Recommended Actions</span>
              <div className="space-y-2">
                {analysis.anomaly_detection?.recommended_actions.map((action, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Growth Potential */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-green-400 flex items-center space-x-2">
            <span>🚀</span>
            <span>Growth Potential</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Estimated Potential</span>
              <span className="text-green-400 font-semibold text-xl">
                {analysis.growth_potential?.estimated_potential || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Timeline</span>
              <span className="text-white font-semibold">
                {analysis.growth_potential?.timeline || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-300 block mb-2">Growth Levers</span>
              <div className="flex flex-wrap gap-2">
                {analysis.growth_potential?.growth_levers.map((lever, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    {lever}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}