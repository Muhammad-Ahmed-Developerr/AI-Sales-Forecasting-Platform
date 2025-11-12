"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, BarChart, Bar } from "recharts"

interface ForecastData {
  date: string
  predicted_sales: number
  lower_bound?: number
  upper_bound?: number
  confidence?: number
  trend: string
}

interface BusinessMetrics {
  trend_strength: number
  volatility: number
  consistency_score: number
  growth_rate_30d: number
  momentum: number
}

interface ChartsProps {
  historicalData: Array<{ date: string; sales: number }>
  forecastData: ForecastData[]
  modelType: string
  businessMetrics?: BusinessMetrics
}

export default function Charts({ historicalData, forecastData, modelType, businessMetrics }: ChartsProps) {
  if (!forecastData.length) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No forecast data available</div>
      </div>
    )
  }

  const chartData = [
    ...forecastData.map((item) => ({
      date: item.date,
      sales: item.predicted_sales,
      lower_bound: item.lower_bound,
      upper_bound: item.upper_bound,
      type: "forecast" as const,
    })),
  ]

  // Prepare data for bar chart (monthly aggregation)
  const monthlyData = forecastData.reduce((acc: any[], item) => {
    const date = new Date(item.date)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    
    const existing = acc.find(a => a.month === monthKey)
    if (existing) {
      existing.sales += item.predicted_sales
    } else {
      acc.push({
        month: monthKey,
        sales: item.predicted_sales,
        name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      })
    }
    return acc
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">AI Sales Forecast</h2>
          {businessMetrics && (
            <div className="flex items-center space-x-6 mt-3 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Trend Strength: <span className="text-cyan-400 font-semibold">{(businessMetrics.trend_strength * 100).toFixed(0)}%</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Growth Rate: <span className="text-green-400 font-semibold">{businessMetrics.growth_rate_30d.toFixed(1)}%</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Momentum: <span className="text-orange-400 font-semibold">{businessMetrics.momentum.toFixed(1)}%</span></span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 text-slate-300">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span>Predicted Sales</span>
          </div>
          {forecastData[0]?.lower_bound && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Confidence Range</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF" }}
              axisLine={{ stroke: "#4B5563" }}
              tickFormatter={formatDate}
            />
            <YAxis 
              tick={{ fill: "#9CA3AF" }} 
              axisLine={{ stroke: "#4B5563" }} 
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
              }}
              formatter={(value: number) => [formatCurrency(value), "Sales"]}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
            />
            <Legend />

            {forecastData[0]?.lower_bound && forecastData[0]?.upper_bound && (
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="none"
                fill="#10B981"
                fillOpacity={0.1}
                name="Confidence Range"
              />
            )}
            {forecastData[0]?.lower_bound && forecastData[0]?.upper_bound && (
              <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#10B981" fillOpacity={0.1} />
            )}

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#06B6D4"
              strokeWidth={3}
              dot={false}
              name="Predicted Sales"
              activeDot={{ r: 6, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Monthly Sales Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#9CA3AF" }}
                axisLine={{ stroke: "#4B5563" }}
              />
              <YAxis 
                tick={{ fill: "#9CA3AF" }} 
                axisLine={{ stroke: "#4B5563" }} 
                tickFormatter={formatCurrency}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "white",
                }}
                formatter={(value: number) => [formatCurrency(value), "Sales"]}
              />
              <Bar 
                dataKey="sales" 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                name="Monthly Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Info Footer */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <div className="flex items-center space-x-4">
            <div>
              Model: <span className="text-cyan-400 font-semibold capitalize">{modelType}</span>
            </div>
            <div>
              Forecast Period: <span className="text-cyan-400 font-semibold">{forecastData.length} days</span>
            </div>
            <div>
              Data Points: <span className="text-cyan-400 font-semibold">{chartData.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              Confidence Intervals: <span className="text-green-400 font-semibold">
                {forecastData[0]?.lower_bound ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="ai-badge">
              AI Enhanced
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}