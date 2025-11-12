interface BusinessMetrics {
  total_revenue: number
  average_daily_sales: number
  max_daily_sales: number
  min_daily_sales: number
  sales_std_dev: number
  total_days: number
  growth_rate_30d: number
  growth_rate_7d: number
  volatility: number
  momentum: number
  trend_strength: number
  consistency_score: number
  prediction_confidence: number
}

interface ForecastMetrics {
  mape?: number
  rmse?: number
  r_squared?: number
  samples_evaluated?: number
  model_confidence: number
  prediction_accuracy: number
}

interface KPICardsProps {
  businessMetrics: BusinessMetrics
  forecastMetrics: ForecastMetrics
  modelType: string
}

export default function KPICards({ businessMetrics, forecastMetrics, modelType }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(businessMetrics.total_revenue),
      change: `+${businessMetrics.growth_rate_30d.toFixed(1)}%`,
      changeType: businessMetrics.growth_rate_30d >= 0 ? 'positive' : 'negative',
      icon: "💰",
      description: "Lifetime revenue",
      gradient: "from-cyan-500/10 to-blue-500/10",
      border: "border-cyan-500/20"
    },
    {
      title: "Avg Daily Sales",
      value: formatCurrency(businessMetrics.average_daily_sales),
      change: `+${businessMetrics.growth_rate_7d.toFixed(1)}%`,
      changeType: businessMetrics.growth_rate_7d >= 0 ? 'positive' : 'negative',
      icon: "📈",
      description: "Per day average",
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/20"
    },
    {
      title: "30-Day Growth",
      value: `${businessMetrics.growth_rate_30d.toFixed(1)}%`,
      change: `${businessMetrics.momentum.toFixed(1)} pts`,
      changeType: businessMetrics.momentum >= 0 ? 'positive' : 'negative',
      icon: "🚀",
      description: "Monthly growth rate",
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "AI Accuracy",
      value: `${forecastMetrics.prediction_accuracy.toFixed(1)}%`,
      change: `${forecastMetrics.model_confidence.toFixed(1)}% conf`,
      changeType: 'positive',
      icon: "🤖",
      description: "Prediction accuracy",
      gradient: "from-orange-500/10 to-red-500/10",
      border: "border-orange-500/20"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br rounded-2xl p-6 border hover-lift kpi-card ${kpi.gradient} ${kpi.border}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{kpi.icon}</div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              kpi.changeType === 'positive' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {kpi.change}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-slate-300 text-sm font-medium">{kpi.title}</div>
            <div className="text-slate-400 text-xs">{kpi.description}</div>
          </div>

          {/* Progress indicator for accuracy */}
          {kpi.title === "AI Accuracy" && (
            <div className="mt-4">
              <div className="progress-bar">
                <div 
                  className="progress-fill ai"
                  style={{ width: `${forecastMetrics.prediction_accuracy}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}