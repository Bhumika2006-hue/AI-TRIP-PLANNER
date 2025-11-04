import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, Plane, MapPin, Calendar, DollarSign, Heart, Globe } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TripPlanner({ user, token }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [interests, setInterests] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);

  const interestOptions = [
    "Adventure", "Culture", "Food", "Nature", "Shopping", 
    "Beach", "History", "Nightlife", "Photography", "Relaxation"
  ];

  const indianDestinations = [
    "Mumbai, Maharashtra", "Delhi", "Goa", "Jaipur, Rajasthan", "Kerala", 
    "Udaipur, Rajasthan", "Varanasi, Uttar Pradesh", "Agra, Uttar Pradesh",
    "Manali, Himachal Pradesh", "Rishikesh, Uttarakhand"
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "bn", name: "বাংলা (Bengali)" }
  ];

  const handleInterestToggle = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateTrip = async (e) => {
    e.preventDefault();
    
    if (!destination || !duration || !budget || !travelStyle || interests.length === 0) {
      toast.error("Please fill in all fields and select at least one interest");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/trips`,
        {
          destination,
          duration,
          budget,
          interests,
          travel_style: travelStyle,
          language
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentItinerary(response.data);
      toast.success("Trip itinerary generated successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Failed to generate trip";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                TripGenie - Plan Your Trip
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentItinerary ? (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="trip-form">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Create Your Trip</CardTitle>
              <CardDescription className="text-base">Tell us about your dream destination and we'll create a personalized itinerary</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateTrip} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2 text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    data-testid="destination-input"
                    placeholder="e.g., Mumbai, Goa, Jaipur"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    list="indian-destinations"
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <datalist id="indian-destinations">
                    {indianDestinations.map(dest => <option key={dest} value={dest} />)}
                  </datalist>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      Duration
                    </Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration" data-testid="duration-select" className="border-gray-200">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3 days">1-3 days</SelectItem>
                        <SelectItem value="4-7 days">4-7 days</SelectItem>
                        <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                        <SelectItem value="2+ weeks">2+ weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="flex items-center gap-2 text-gray-700 font-medium">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Budget
                    </Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget" data-testid="budget-select" className="border-gray-200">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Budget-friendly (₹5,000-10,000)">Budget-friendly (₹5,000-10,000)</SelectItem>
                        <SelectItem value="Mid-range (₹10,000-30,000)">Mid-range (₹10,000-30,000)</SelectItem>
                        <SelectItem value="Luxury (₹30,000+)">Luxury (₹30,000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-style" className="text-gray-700 font-medium">Travel Style</Label>
                  <Select value={travelStyle} onValueChange={setTravelStyle}>
                    <SelectTrigger id="travel-style" data-testid="travel-style-select" className="border-gray-200">
                      <SelectValue placeholder="Select travel style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Couple">Couple</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Group">Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Globe className="w-4 h-4 text-purple-500" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" data-testid="language-select" className="border-gray-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Interests (Select at least one)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interestOptions.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          data-testid={`interest-${interest.toLowerCase()}`}
                          checked={interests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                          className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <label
                          htmlFor={interest}
                          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                        >
                          {interest}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="generate-trip-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Perfect Trip...
                    </>
                  ) : (
                    <>
                      <Plane className="w-5 h-5 mr-2" />
                      Generate Trip Itinerary
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="itinerary-result">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {currentItinerary.destination}
                  </CardTitle>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {currentItinerary.duration}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                      <DollarSign className="w-4 h-4" />
                      {currentItinerary.budget}
                    </span>
                  </div>
                </div>
                <Button onClick={() => { setCurrentItinerary(null); }} variant="outline" data-testid="plan-another-btn">
                  Plan Another
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Itinerary</h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" data-testid="itinerary-content">
                        {currentItinerary.itinerary}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Budget Breakdown</h3>
                  <Card className="border border-gray-200" data-testid="budget-breakdown">
                    <CardContent className="p-4 space-y-3">
                      {Object.entries(currentItinerary.budget_breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-600 capitalize">{key}</span>
                          <span className="text-sm font-semibold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    data-testid="back-to-dashboard-btn"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}