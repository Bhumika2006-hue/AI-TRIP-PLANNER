import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plane, MapPin, Calendar, DollarSign, Heart, Trash2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [showForm, setShowForm] = useState(true);

  const interestOptions = [
    "Adventure", "Culture", "Food", "Nature", "Shopping", 
    "Beach", "History", "Nightlife", "Photography", "Relaxation"
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`);
      setSavedTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

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
      const response = await axios.post(`${API}/generate-trip`, {
        destination,
        duration,
        budget,
        interests,
        travel_style: travelStyle
      });
      
      setCurrentItinerary(response.data);
      setShowForm(false);
      toast.success("Trip itinerary generated successfully!");
      fetchTrips();
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.error("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await axios.delete(`${API}/trips/${tripId}`);
      toast.success("Trip deleted successfully");
      fetchTrips();
      if (currentItinerary?.id === tripId) {
        setCurrentItinerary(null);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  };

  const handleViewTrip = (trip) => {
    setCurrentItinerary(trip);
    setShowForm(false);
  };

  const handleNewTrip = () => {
    setDestination("");
    setDuration("");
    setBudget("");
    setTravelStyle("");
    setInterests([]);
    setCurrentItinerary(null);
    setShowForm(true);
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    AI Trip Planner
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Plan your perfect journey with AI</p>
                </div>
              </div>
              <Button 
                onClick={handleNewTrip}
                variant="outline"
                className="gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                data-testid="new-trip-btn"
              >
                <Sparkles className="w-4 h-4" />
                New Trip
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Trip Form / Current Itinerary */}
            <div className="lg:col-span-2">
              {showForm ? (
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="trip-form-card">
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
                          placeholder="e.g., Paris, France"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        />
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
                              <SelectItem value="Budget-friendly">Budget-friendly</SelectItem>
                              <SelectItem value="Mid-range">Mid-range</SelectItem>
                              <SelectItem value="Luxury">Luxury</SelectItem>
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
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Trip Itinerary
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="itinerary-card">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-gray-800">
                          {currentItinerary?.destination}
                        </CardTitle>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                            <Calendar className="w-4 h-4" />
                            {currentItinerary?.duration}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                            <DollarSign className="w-4 h-4" />
                            {currentItinerary?.budget}
                          </span>
                          <span className="bg-white px-3 py-1 rounded-full">
                            {currentItinerary?.travel_style}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentItinerary?.interests.map((interest) => (
                            <span key={interest} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" data-testid="itinerary-content">
                          {currentItinerary?.itinerary}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Saved Trips Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-24" data-testid="saved-trips-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Saved Trips</CardTitle>
                  <CardDescription>Your travel history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    {savedTrips.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No saved trips yet</p>
                    ) : (
                      <div className="space-y-3">
                        {savedTrips.map((trip) => (
                          <div
                            key={trip.id}
                            className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                            data-testid={`saved-trip-${trip.id}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 
                                className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors"
                                onClick={() => handleViewTrip(trip)}
                              >
                                {trip.destination}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                data-testid={`delete-trip-${trip.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {trip.duration}
                              </p>
                              <p className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {trip.budget}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {trip.interests.slice(0, 3).map((interest) => (
                                <span key={interest} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {interest}
                                </span>
                              ))}
                              {trip.interests.length > 3 && (
                                <span className="text-xs text-gray-500">+{trip.interests.length - 3}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;