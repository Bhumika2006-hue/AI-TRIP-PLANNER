import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Loader2, Crown } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Pricing({ user, token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "2 trip plans per month",
        "10 AI chat messages",
        "Basic trip features",
        "Community support",
        "Email notifications"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "₹499",
      period: "per month",
      description: "For frequent travelers",
      features: [
        "Unlimited trip plans",
        "Unlimited AI chats",
        "Hotel & flight integration",
        "Budget optimizer",
        "Multi-language support",
        "Trip sharing & collaboration",
        "Priority support",
        "Advanced analytics"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "₹1,999",
      period: "per month",
      description: "For travel agencies & businesses",
      features: [
        "Everything in Pro",
        "Custom branding",
        "API access",
        "Advanced analytics dashboard",
        "Team collaboration tools",
        "Dedicated account manager",
        "SLA guarantee",
        "White-label options"
      ]
    }
  ];

  const handleUpgrade = async (planId) => {
    if (planId === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    if (user.subscription_plan === planId) {
      toast.info(`You are already on the ${planId} plan`);
      return;
    }

    setLoading(planId);
    try {
      // Create order
      const orderResponse = await axios.post(
        `${API}/subscription/create-order`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderResponse.data.mock) {
        // Mock payment for development
        await axios.post(
          `${API}/subscription/verify`,
          { mock: true, plan: planId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Upgraded to ${planId.toUpperCase()} plan!`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        // Real Razorpay payment would be initialized here
        toast.info('Payment integration coming soon');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Upgrade failed';
      toast.error(errorMsg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Pricing Plans
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Current Plan: {user.subscription_plan.toUpperCase()}</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600">Select the perfect plan for your travel needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-0 shadow-xl hover:shadow-2xl transition-all relative ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${user.subscription_plan === plan.id ? 'ring-2 ring-green-500' : ''} bg-white/80 backdrop-blur-sm`}
              data-testid={`plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              {user.subscription_plan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Current
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || user.subscription_plan === plan.id}
                  className={`w-full ${
                    plan.popular || plan.id === 'enterprise'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  data-testid={`upgrade-${plan.id}-btn`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : user.subscription_plan === plan.id ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Downgrade'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">All plans include secure payment processing and data protection</p>
          <p className="text-sm text-gray-500">Prices are in Indian Rupees (₹). Cancel anytime.</p>
        </div>
      </main>
    </div>
  );
}