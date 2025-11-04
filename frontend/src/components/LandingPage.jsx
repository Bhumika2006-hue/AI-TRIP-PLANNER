import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Sparkles, MapPin, MessageSquare, Users, Shield, Globe, DollarSign, Zap, CheckCircle } from "lucide-react";

export default function LandingPage({ onAuthClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI Trip Planner
              </h1>
            </div>
            <Button 
              onClick={onAuthClick}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              data-testid="header-login-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Plan Your Perfect Trip
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              with AI in Minutes
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get personalized itineraries, budget estimates, and smart recommendations for your dream vacation. 
            All powered by advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onAuthClick}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl"
              data-testid="hero-cta-btn"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Planning Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-blue-200 hover:bg-blue-50"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600">Comprehensive travel planning tools in one platform</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI Itinerary Generator",
                description: "Create personalized travel plans instantly based on your preferences and budget"
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Smart Recommendations",
                description: "Get AI-powered suggestions for destinations, routes, and hidden gems"
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "AI Travel Chatbot",
                description: "Real-time assistance for all your travel questions and concerns"
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: "Budget Estimator",
                description: "Automatic cost calculation and optimization for your trip budget"
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Multi-language Support",
                description: "Plan trips in your preferred language with automatic translation"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Trip Sharing",
                description: "Share itineraries and co-plan trips with friends and family"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Generation",
                description: "Get complete trip plans in seconds, not hours"
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Easy to Use",
                description: "Simple interface designed for everyone"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Choose the perfect plan for your travel needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "forever",
                features: ["2 trip plans/month", "10 AI chats", "Basic features", "Community support"]
              },
              {
                name: "Pro",
                price: "₹499",
                period: "per month",
                features: ["Unlimited trips", "Unlimited AI chats", "Hotel & flight integration", "Priority support"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "₹1,999",
                period: "per month",
                features: ["Everything in Pro", "Custom branding", "API access", "Advanced analytics"]
              }
            ].map((plan, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-2xl transition-all ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} bg-white/80 backdrop-blur-sm relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={onAuthClick}
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of travelers planning their perfect trips with AI</p>
          <Button 
            onClick={onAuthClick}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6 shadow-xl"
            data-testid="footer-cta-btn"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Planning Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Trip Planner</span>
          </div>
          <p className="text-sm mb-4">Powered by advanced AI technology</p>
          <p className="text-xs">&copy; 2025 AI Trip Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}