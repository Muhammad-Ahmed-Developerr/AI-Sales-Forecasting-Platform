"use client"
import type React from "react"
import { useState } from "react"
import Charts from "./Charts"
import KPICards from "./KPICards"
import ProductAnalysis from "./ProductAnalysis"
import Recommendations from "./Recommendations"
import BusinessInsights from "./BusinessInsights"
import AIAnalysis from "./AIAnalysis"

interface ForecastResult {
  status: string
  filename: string
  column_info?: {
    sales_column: string
    date_column: string
    product_column?: string
    region_column?: string
    customer_column?: string
    additional_columns: string[]
  }
  data_validation: {
    is_valid: boolean
    issues: string[]
    warnings: string[]
    data_quality_score: number
    ai_confidence: number
  }
  business_metrics: {
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
  forecast: {
    model: string
    predictions: Array<{
      date: string
      predicted_sales: number
      lower_bound?: number
      upper_bound?: number
      confidence?: number
      trend: string
    }>
    metrics: {
      mape?: number
      rmse?: number
      r_squared?: number
      samples_evaluated?: number
      model_confidence: number
      prediction_accuracy: number
    }
    confidence_intervals: boolean
    periods: number
    ai_model_used: string
  }
  product_analysis?: {
    top_products: Array<{
      product: string
      revenue: number
      growth: number
      margin: number
    }>
    growth_opportunities: Array<{
      product: string
      potential: number
      reason: string
    }>
    performance_metrics: {
      product_concentration: number
      average_margin: number
      growth_variance: number
    }
  }
  business_insights?: Array<{
    type: string
    title: string
    description: string
    impact: string
    action: string
    confidence: number
  }>
  recommendations?: Array<{
    category: string
    title: string
    description: string
    priority: string
    timeframe: string
    impact: string
    ai_confidence: number
  }>
  ai_analysis?: {
    trend_analysis: {
      primary_trend: string
      trend_confidence: number
      acceleration_rate: number
      key_drivers: string[]
    }
    seasonality_analysis: {
      seasonal_strength: number
      peak_periods: string[]
      seasonal_impact: number
    }
    anomaly_detection: {
      anomalies_detected: number
      anomaly_impact: string
      recommended_actions: string[]
    }
    growth_potential: {
      estimated_potential: number
      growth_levers: string[]
      timeline: string
    }
  }
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ForecastResult | null>(null)
  const [error, setError] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.match(/\.(csv|xls|xlsx)$/i)) {
        setFile(droppedFile)
        setError("")
        simulateUploadProgress()
      } else {
        setError("Please upload a CSV or Excel file")
      }
    }
  }

  const simulateUploadProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError("Please select a file")
      return
    }

    setLoading(true)
    setError("")
    setUploadProgress(90)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"
      console.log("Uploading to API:", apiUrl)

      const response = await fetch(`${apiUrl}/api/v1/forecast`, {
        method: "POST",
        body: fd,
      })

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          const text = await response.text()
          if (text) {
            errorMessage = text
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("AI Analysis successful:", data)
      setResult(data)
      setUploadProgress(100)
    } catch (err) {
      console.error("Analysis error:", err)
      const errorMsg = err instanceof Error ? err.message : "Upload failed. Please try again."
      setError(errorMsg)
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const getColumnInfo = () => {
    if (!result?.column_info) {
      return {
        sales_column: 'sales',
        date_column: 'date', 
        product_column: undefined,
        region_column: undefined,
        customer_column: undefined,
        additional_columns: []
      }
    }
    return result.column_info
  }

  const getBusinessInsights = () => {
    return result?.business_insights || []
  }

  const getRecommendations = () => {
    return result?.recommendations || []
  }

  const getProductAnalysis = () => {
    return result?.product_analysis || {
      top_products: [],
      growth_opportunities: [],
      performance_metrics: {}
    }
  }

  const getAIAnalysis = () => {
    return result?.ai_analysis || {
      trend_analysis: {},
      seasonality_analysis: {},
      anomaly_detection: {},
      growth_potential: {}
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Upload Section */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        {/* AI Background Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Upload Your Sales Data
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Get AI-powered sales forecasts, real-time insights, and actionable recommendations. 
            Our advanced algorithms analyze your data to drive business growth.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden ${
              dragActive 
                ? "border-cyan-400 bg-cyan-400/10 scale-105 ai-pulse" 
                : "border-slate-600 hover:border-slate-500 hover:bg-white/5"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 float-animation">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div className="space-y-3">
                <p className="text-2xl font-semibold text-white">
                  {file ? "📁 File Ready for Analysis" : "Drag & Drop Your File"}
                </p>
                <p className="text-slate-400 text-lg">
                  {file ? file.name : "Supports CSV, XLS, XLSX files with sales data"}
                </p>
                <p className="text-slate-500">
                  We automatically detect sales, date, product columns and apply AI analysis
                </p>
              </div>

              <label className="cursor-pointer">
                <span className="btn-primary inline-flex items-center space-x-3">
                  <span>Choose File</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null)
                    setError("")
                    if (e.target.files?.[0]) {
                      simulateUploadProgress()
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <div className="flex items-center space-x-3 text-red-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <button
            disabled={loading || !file}
            className="w-full btn-ai disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-semibold">AI Analyzing Your Data...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="font-semibold">Start AI Analysis</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            )}
            
            {/* Button shine effect */}
            <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-white/10"></div>
          </button>
        </form>
      </div>

      {/* Enhanced Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* AI Confidence Header */}
          <div className="glass-ai rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Analysis Complete</h3>
                <p className="text-slate-300">
                  Your sales data has been processed with advanced AI algorithms
                </p>
              </div>
              <div className="text-right">
                <div className="ai-badge text-lg">
                  <span className="flex items-center space-x-2">
                    <span>🤖</span>
                    <span>AI Confidence: {(result.data_validation.ai_confidence * 100).toFixed(0)}%</span>
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">Model: {result.forecast.ai_model_used}</p>
              </div>
            </div>
          </div>

          {/* Data Quality Assessment */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Data Quality Assessment</h3>
              <div className="flex items-center space-x-4">
                <div className={`confidence-${result.data_validation.data_quality_score > 0.8 ? 'high' : result.data_validation.data_quality_score > 0.6 ? 'medium' : 'low'}`}>
                  Score: {(result.data_validation.data_quality_score * 100).toFixed(0)}%
                </div>
                <div className="ai-badge">
                  AI Validated
                </div>
              </div>
            </div>
            
            {(result.data_validation.warnings.length > 0 || result.data_validation.issues.length > 0) && (
              <div className="space-y-3 mb-6">
                {result.data_validation.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-red-200 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{issue}</span>
                  </div>
                ))}
                {result.data_validation.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-yellow-200 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Column Information */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center space-x-2">
                <span>🔍</span>
                <span>AI-Detected Data Structure</span>
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-slate-400">Sales Column:</span>
                  <span className="text-white font-medium">{getColumnInfo().sales_column}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-400">Date Column:</span>
                  <span className="text-white font-medium">{getColumnInfo().date_column}</span>
                </div>
                {getColumnInfo().product_column && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-slate-400">Product Column:</span>
                    <span className="text-white font-medium">{getColumnInfo().product_column}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-400">Additional Columns:</span>
                  <span className="text-white font-medium">{getColumnInfo().additional_columns.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards
            businessMetrics={result.business_metrics}
            forecastMetrics={result.forecast.metrics}
            modelType={result.forecast.model}
          />

          {/* AI Analysis Dashboard */}
          <AIAnalysis analysis={getAIAnalysis()} />

          {/* Business Insights */}
          {getBusinessInsights().length > 0 && (
            <BusinessInsights insights={getBusinessInsights()} />
          )}

          {/* Charts */}
          <div className="glass rounded-2xl p-6">
            <Charts 
              historicalData={[]} 
              forecastData={result.forecast.predictions} 
              modelType={result.forecast.model}
              businessMetrics={result.business_metrics}
            />
          </div>

          {/* Product Analysis */}
          {getProductAnalysis().top_products && getProductAnalysis().top_products.length > 0 && (
            <ProductAnalysis analysis={getProductAnalysis()} />
          )}

          {/* Recommendations */}
          <Recommendations 
            businessMetrics={result.business_metrics}
            forecast={result.forecast}
            productAnalysis={getProductAnalysis()}
            recommendations={getRecommendations()}
          />

          {/* Forecast Details Table */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>📋</span>
              <span>Detailed Forecast Predictions</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Predicted Sales</th>
                    <th className="text-left p-4 font-semibold">Confidence Range</th>
                    <th className="text-left p-4 font-semibold">Trend</th>
                    <th className="text-left p-4 font-semibold">AI Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.forecast.predictions.slice(0, 10).map((pred, idx) => (
                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{pred.date}</td>
                      <td className="p-4 font-mono text-cyan-400">${pred.predicted_sales.toFixed(2)}</td>
                      <td className="p-4 font-mono text-green-400">
                        ${pred.lower_bound?.toFixed(2) || "N/A"} - ${pred.upper_bound?.toFixed(2) || "N/A"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pred.trend === 'upward' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pred.trend}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${(pred.confidence || 0.5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-300 min-w-10">
                            {((pred.confidence || 0.5) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center text-slate-400">
              Showing first 10 of {result.forecast.predictions.length} AI-generated predictions
            </div>
          </div>
        </div>
      )}
    </div>
  )
}