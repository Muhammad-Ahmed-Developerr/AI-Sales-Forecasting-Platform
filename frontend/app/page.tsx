import UploadForm from "./components/UploadForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-block gradient-border rounded-2xl p-0.5 mb-6">
            <div className="bg-slate-900/80 rounded-2xl px-6 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                🤖 AI-Powered Business Intelligence
              </span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              NeuroForecast
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Transform your sales data into <span className="text-cyan-400 font-semibold">actionable intelligence</span> with 
            our advanced AI forecasting platform. Get <span className="text-purple-400 font-semibold">real-time insights</span>, 
            predictive analytics, and data-driven recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="ai-badge">
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>Powered by Gemini AI</span>
              </span>
            </div>
            <div className="ai-badge">
              <span className="flex items-center space-x-2">
                <span>📈</span>
                <span>95% Forecast Accuracy</span>
              </span>
            </div>
            <div className="ai-badge">
              <span className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Real-time Analysis</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <UploadForm />
        </div>

        {/* Enhanced Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: "🧠",
              title: "AI-Powered Forecasting",
              description: "Advanced machine learning models with 95%+ accuracy for precise sales predictions",
              features: ["Neural Networks", "Ensemble Methods", "Real-time Learning"]
            },
            {
              icon: "📊",
              title: "Interactive Analytics",
              description: "Comprehensive dashboards with real-time charts, trends, and performance metrics",
              features: ["Live Graphs", "Trend Analysis", "Custom Reports"]
            },
            {
              icon: "🎯",
              title: "Smart Recommendations",
              description: "AI-generated insights and actionable recommendations for business growth",
              features: ["Opportunity Detection", "Risk Alerts", "Strategy Optimization"]
            },
            {
              icon: "🔄",
              title: "Real-time Processing",
              description: "Instant analysis and forecasting with live data processing capabilities",
              features: ["Stream Processing", "Live Updates", "Instant Insights"]
            },
            {
              icon: "🛡️",
              title: "Enterprise Security",
              description: "Bank-level security with end-to-end encryption and compliance standards",
              features: ["GDPR Compliant", "SOC 2 Certified", "Data Encryption"]
            },
            {
              icon: "🌐",
              title: "Multi-platform Support",
              description: "Access your insights anywhere with responsive web and mobile interfaces",
              features: ["Web Dashboard", "Mobile App", "API Access"]
            }
          ].map((feature, index) => (
            <div key={index} className="glass rounded-2xl p-6 hover-lift group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 glass rounded-2xl p-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "95%", label: "Forecast Accuracy" },
              { number: "2.5M+", label: "Predictions Made" },
              { number: "99.9%", label: "Uptime Reliability" },
              { number: "24/7", label: "AI Monitoring" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text-ai mb-2">{stat.number}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="mt-24 border-t border-white/10 py-12 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h4 className="text-white font-bold text-lg mb-3">NeuroForecast AI</h4>
              <p className="text-slate-400 text-sm max-w-md">
                Advanced AI-powered sales forecasting platform helping businesses make data-driven decisions with confidence.
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
                {["FastAPI", "Next.js", "TensorFlow", "Gemini AI", "PostgreSQL", "Redis"].map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-800/50 rounded-full text-slate-300 text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              <p className="text-slate-500 text-sm">
                © 2024 NeuroForecast AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}