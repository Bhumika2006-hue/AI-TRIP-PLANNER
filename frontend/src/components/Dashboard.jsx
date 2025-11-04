import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane, Plus, MessageSquare, CreditCard, LogOut, Bell, Trash2, Share2, Calendar, DollarSign, MapPin, Settings } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTrips();
    fetchNotifications();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await axios.delete(`${API}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Trip deleted successfully');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleShareTrip = async (tripId) => {
    try {
      const response = await axios.post(`${API}/trips/${tripId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const shareUrl = `${window.location.origin}${response.data.share_url}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      await axios.put(`${API}/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const planLimits = {
    free: { trips: 2, chats: 10 },
    pro: { trips: -1, chats: -1 },
    enterprise: { trips: -1, chats: -1 }
  };

  const currentLimits = planLimits[user.subscription_plan];
  const tripUsage = currentLimits.trips === -1 ? 'Unlimited' : `${user.trips_this_month}/${currentLimits.trips}`;
  const chatUsage = currentLimits.chats === -1 ? 'Unlimited' : `${user.chats_this_month}/${currentLimits.chats}`;

  return (
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  TripGenie
                </h1>
                <p className="text-xs text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={fetchNotifications} data-testid="notifications-btn">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} data-testid="logout-btn">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                </div>
                <div className="bg-cyan-100 p-3 rounded-lg">
                  <Plane className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/plan')}
            className="h-24 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg shadow-xl"
            data-testid="create-trip-btn"
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Trip
          </Button>
          <Button
            onClick={() => navigate('/chat')}
            variant="outline"
            className="h-24 border-2 border-purple-200 hover:bg-purple-50 text-lg"
            data-testid="ai-chat-btn"
          >
            <MessageSquare className="w-6 h-6 mr-2" />
            AI Travel Assistant
          </Button>
          <Button
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="h-24 border-2 border-green-200 hover:bg-green-50 text-lg"
            data-testid="upgrade-plan-btn"
          >
            <CreditCard className="w-6 h-6 mr-2" />
            {user.subscription_plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Trips */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="trips-section">
              <CardHeader>
                <CardTitle className="text-2xl">Your Trips</CardTitle>
                <CardDescription>Manage and view your travel plans</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {trips.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No trips yet</p>
                      <Button onClick={() => navigate('/plan')} data-testid="create-first-trip-btn">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Trip
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trips.map((trip) => (
                        <Card key={trip.id} className="border border-gray-200 hover:shadow-md transition-shadow" data-testid={`trip-${trip.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.destination}</h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {trip.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {trip.budget}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {trip.interests.slice(0, 3).map((interest) => (
                                    <Badge key={interest} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                  {trip.interests.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">+{trip.interests.length - 3}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleShareTrip(trip.id)}
                                  data-testid={`share-trip-${trip.id}`}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTrip(trip.id)}
                                  className="hover:text-red-600"
                                  data-testid={`delete-trip-${trip.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Sidebar */}
          <div>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-testid="notifications-section">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>{unreadCount} unread</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No notifications</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                          }`}
                          onClick={() => !notif.read && markNotificationRead(notif.id)}
                          data-testid={`notification-${notif.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{notif.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
  );
}