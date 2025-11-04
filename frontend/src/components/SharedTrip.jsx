import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, DollarSign, Loader2 } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SharedTrip() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedTrip();
  }, [shareToken]);

  const fetchSharedTrip = async () => {
    try {
      const response = await axios.get(`${API}/shared/${shareToken}`);
      setTrip(response.data);
    } catch (error) {
      setError('Trip not found or no longer shared');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <Card className="max-w-md w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Shared Trip
              </h1>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Create Your Own Trip
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="shared-trip-card">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-800">
                {trip?.destination}
              </CardTitle>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white text-gray-700 border border-gray-200 flex items-center gap-1 px-3 py-1">
                  <Calendar className="w-4 h-4" />
                  {trip?.duration}
                </Badge>
                <Badge className="bg-white text-gray-700 border border-gray-200 flex items-center gap-1 px-3 py-1">
                  <DollarSign className="w-4 h-4" />
                  {trip?.budget}
                </Badge>
                <Badge className="bg-white text-gray-700 border border-gray-200 px-3 py-1">
                  {trip?.travel_style}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {trip?.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Itinerary</h3>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {trip?.itinerary}
                    </div>
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Budget Breakdown</h3>
                <Card className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    {trip?.budget_breakdown && Object.entries(trip.budget_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 capitalize">{key}</span>
                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 mb-2 font-medium">Want to create your own trip?</p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Start Planning
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}