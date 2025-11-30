import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabaseClient';
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Users,
  Settings,
  BarChart3,
  Plus,
  Copy,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  UserCheck,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Target,
  DollarSign,
  Percent,
  TrendingUpDown,
  CalendarDays,
  UserX,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useToast } from '../components/ui/use-toast';
import CreateBookingDialog from '../components/meetings/CreateBookingDialog';
import BookingEmbedModal from '../components/meetings/BookingEmbedModal';

/**
 * Meetings Page - Advanced Scheduling with Analytics
 *
 * Features:
 * - Booking link management
 * - Sales call analytics
 * - General scheduling analytics
 * - Lead qualification (2-step scheduler)
 * - Performance dashboard
 */
export default function Meetings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingLinks, setBookingLinks] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedBookingLink, setSelectedBookingLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [generalAnalytics, setGeneralAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLinkData, setNewLinkData] = useState({
    name: '',
    duration: 30,
    meetingType: 'phone',
    description: '',
  });

  // Utility functions for dynamic calculations
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getShowRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    return calculatePercentage(
      salesAnalytics.conversionFunnel.showed,
      salesAnalytics.conversionFunnel.booked
    );
  };

  const getCloseRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    return calculatePercentage(
      salesAnalytics.conversionFunnel.closed,
      salesAnalytics.conversionFunnel.showed
    );
  };

  const getDropOffRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    const { booked, closed } = salesAnalytics.conversionFunnel;
    return calculatePercentage(booked - closed, booked);
  };

  const getOutcomePercentages = () => {
    if (!salesAnalytics?.outcomes) return { won: 0, lost: 0, pending: 0 };
    const { won, lost, pending } = salesAnalytics.outcomes;
    const total = won + lost + pending;
    return {
      won: calculatePercentage(won, total),
      lost: calculatePercentage(lost, total),
      pending: calculatePercentage(pending, total),
    };
  };

  const getAttendanceRate = () => {
    if (!generalAnalytics) return 0;
    const { noShowRate = 0, cancellationRate = 0 } = generalAnalytics;
    return 100 - noShowRate - cancellationRate;
  };

  const getMaxValue = (array, key) => {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item[key] || 0));
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          loadBookingLinks(),
          loadAnalytics(),
          loadSalesAnalytics(),
          loadGeneralAnalytics(),
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const loadBookingLinks = async () => {
    try {
      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No authentication session');
        setBookingLinks([]);
        return;
      }

      const response = await fetch('/api/meetings/booking-links', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookingLinks(data);
      } else {
        // Fallback to empty array if API fails
        console.error('Failed to load booking links');
        setBookingLinks([]);
      }
    } catch (error) {
      console.error('Error loading booking links:', error);
      setBookingLinks([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/meetings/analytics/overview', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Fallback to empty state if API fails
        setAnalytics({
          totalBookings: 0,
          showRate: 0,
          closeRate: 0,
          avgBookingValue: 0,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        totalBookings: 0,
        showRate: 0,
        closeRate: 0,
        avgBookingValue: 0,
      });
    }
  };

  const loadSalesAnalytics = async () => {
    try {
      const response = await fetch('/api/meetings/analytics/sales', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSalesAnalytics(data);
      } else {
        setSalesAnalytics({
          conversionFunnel: { booked: 0, showed: 0, closed: 0 },
          outcomes: { won: 0, lost: 0, pending: 0 },
          topObjections: [],
          revenueMetrics: { totalRevenue: 0, avgDealSize: 0, pipelineValue: 0 },
          topClosers: [],
          leadSources: [],
        });
      }
    } catch (error) {
      console.error('Error loading sales analytics:', error);
      setSalesAnalytics({
        conversionFunnel: { booked: 0, showed: 0, closed: 0 },
        outcomes: { won: 0, lost: 0, pending: 0 },
        topObjections: [],
        revenueMetrics: { totalRevenue: 0, avgDealSize: 0, pipelineValue: 0 },
        topClosers: [],
        leadSources: [],
      });
    }
  };

  const loadGeneralAnalytics = async () => {
    try {
      const response = await fetch('/api/meetings/analytics/scheduling', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeneralAnalytics(data);
      } else {
        setGeneralAnalytics({
          bookingTrends: [],
          cancellationRate: 0,
          rescheduleRate: 0,
          noShowRate: 0,
          popularTimeSlots: [],
          eventTypes: [],
          busiestDays: [],
        });
      }
    } catch (error) {
      console.error('Error loading general analytics:', error);
      setGeneralAnalytics({
        bookingTrends: [],
        cancellationRate: 0,
        rescheduleRate: 0,
        noShowRate: 0,
        popularTimeSlots: [],
        eventTypes: [],
        busiestDays: [],
      });
    }
  };

  const copyBookingLink = (slug) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Booking link copied to clipboard',
    });
  };

  const handleCreateLink = async (bookingData) => {
    try {
      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/meetings/booking-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking link');
      }

      const newLink = await response.json();

      // Reload booking links list
      await loadBookingLinks();

      setShowCreateDialog(false);

      toast({
        title: 'Booking link created!',
        description: `Your booking link "${newLink.name}" is ready to share`,
      });

      // Optionally copy link to clipboard
      const bookingUrl = `${window.location.origin}/book/${newLink.slug}`;
      await navigator.clipboard.writeText(bookingUrl);

      toast({
        title: 'Link copied!',
        description: 'Booking link URL copied to clipboard',
      });
    } catch (error) {
      console.error('Error creating booking link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="border rounded-lg p-6">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="p-6">
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">
            Manage booking links, qualify leads, and track performance
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Booking Link
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales-analytics" className="gap-2">
            <Target className="h-4 w-4" />
            Sales Analytics
          </TabsTrigger>
          <TabsTrigger value="scheduling-analytics" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Scheduling Analytics
          </TabsTrigger>
          <TabsTrigger value="booking-links" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Booking Links
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Merged Analytics Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Show Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.showRate || 0}%</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Above average</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Close Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.closeRate || 0}%</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+5% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Booking Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.avgBookingValue?.toLocaleString() || 0}</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+8% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales & Scheduling Analytics Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Analytics Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  Sales Performance
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('sales-analytics')}>
                  View All →
                </Button>
              </div>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion Funnel</CardTitle>
                  <CardDescription>Track your sales pipeline progression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Booked</span>
                      <span className="text-sm font-bold">{salesAnalytics?.conversionFunnel.booked || 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-teal-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Showed Up</span>
                      <span className="text-sm font-bold">{salesAnalytics?.conversionFunnel.showed || 0} ({getShowRate()}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-teal-600 h-3 rounded-full" style={{ width: `${getShowRate()}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Closed</span>
                      <span className="text-sm font-bold">{salesAnalytics?.conversionFunnel.closed || 0} ({getCloseRate()}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${calculatePercentage(salesAnalytics?.conversionFunnel.closed, salesAnalytics?.conversionFunnel.booked)}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(salesAnalytics?.revenueMetrics.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Deal Size</span>
                      <span className="text-sm font-semibold">
                        ${(salesAnalytics?.revenueMetrics.avgDealSize || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pipeline Value</span>
                      <span className="text-sm font-semibold">
                        ${(salesAnalytics?.revenueMetrics.pipelineValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Objections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Common Objections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {salesAnalytics?.topObjections.map((objection, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{objection.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${objection.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-10 text-right">
                          {objection.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Scheduling Analytics Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Scheduling Insights
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('scheduling-analytics')}>
                  View All →
                </Button>
              </div>

              {/* Booking Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Trends</CardTitle>
                  <CardDescription>Last 5 months performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generalAnalytics?.bookingTrends.map((trend, idx) => {
                      const maxBooked = getMaxValue(generalAnalytics.bookingTrends, 'booked');
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium w-12">{trend.month}</span>
                          <div className="flex-1 mx-3">
                            <div className="flex gap-1">
                              <div className="flex-1 bg-blue-100 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(trend.booked / maxBooked) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">{trend.booked}</span>
                            <span className="text-xs text-gray-500 ml-1">booked</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Health Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">No-show Rate</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {generalAnalytics?.noShowRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Cancellation Rate</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      {generalAnalytics?.cancellationRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Reschedule Rate</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {generalAnalytics?.rescheduleRate || 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Popular Time Slots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {generalAnalytics?.popularTimeSlots.map((slot, idx) => {
                    const maxBookings = getMaxValue(generalAnalytics.popularTimeSlots, 'bookings');
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{slot.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(slot.bookings / maxBookings) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8 text-right">
                            {slot.bookings}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales-analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(salesAnalytics?.revenueMetrics.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">From {salesAnalytics?.conversionFunnel.closed || 0} closed deals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(salesAnalytics?.revenueMetrics.avgDealSize || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Per closed opportunity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${(salesAnalytics?.revenueMetrics.pipelineValue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">{salesAnalytics?.outcomes.pending || 0} pending deals</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Conversion Funnel</CardTitle>
                <CardDescription>Track every stage of your sales process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Calls Booked</span>
                    <span className="font-bold text-lg">{salesAnalytics?.conversionFunnel.booked || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ width: '100%' }}>
                      100%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Showed Up</span>
                    <span className="font-bold text-lg">{salesAnalytics?.conversionFunnel.showed || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ width: `${getShowRate()}%` }}>
                      {getShowRate()}% show rate
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Deals Closed</span>
                    <span className="font-bold text-lg">{salesAnalytics?.conversionFunnel.closed || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ width: `${getCloseRate()}%` }}>
                      {getCloseRate()}% close rate
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Drop-off Rate</span>
                    <span className="text-sm font-semibold text-red-600">{getDropOffRate()}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>Win/Loss/Pending breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Won Deals</p>
                        <p className="text-xs text-green-700">Successfully closed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{salesAnalytics?.outcomes.won || 0}</p>
                      <p className="text-xs text-green-700">{getOutcomePercentages().won}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">Lost Deals</p>
                        <p className="text-xs text-red-700">Did not convert</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{salesAnalytics?.outcomes.lost || 0}</p>
                      <p className="text-xs text-red-700">{getOutcomePercentages().lost}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-900">Pending</p>
                        <p className="text-xs text-orange-700">Follow-up required</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">{salesAnalytics?.outcomes.pending || 0}</p>
                      <p className="text-xs text-orange-700">{getOutcomePercentages().pending}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Your highest-performing closers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesAnalytics?.topClosers.map((closer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:border-teal-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{closer.name}</p>
                          <p className="text-xs text-gray-500">{closer.calls} calls • {closer.closed} closed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${closer.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{closer.rate}% close rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Source Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Performance</CardTitle>
                <CardDescription>Conversion rates by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesAnalytics?.leadSources.map((source, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.name}</span>
                        <span className="text-sm font-bold">{source.rate}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                            style={{ width: `${source.rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-20 text-right">
                          {source.conversions}/{source.bookings}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduling Analytics Tab */}
        <TabsContent value="scheduling-analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">No-show Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{generalAnalytics?.noShowRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">Below industry avg (12%)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cancellation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{generalAnalytics?.cancellationRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">Within normal range</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Reschedule Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{generalAnalytics?.rescheduleRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">Flexibility appreciated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getAttendanceRate()}%</div>
                <p className="text-xs text-gray-500 mt-1">Above industry avg</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Monthly comparison of booked vs occurred meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generalAnalytics?.bookingTrends.map((trend, idx) => {
                    const maxBooked = getMaxValue(generalAnalytics.bookingTrends, 'booked');
                    const maxOccurred = getMaxValue(generalAnalytics.bookingTrends, 'occurred');
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{trend.month}</span>
                          <div className="text-sm">
                            <span className="font-bold text-blue-600">{trend.booked}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="font-bold text-green-600">{trend.occurred}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(trend.booked / maxBooked) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(trend.occurred / maxOccurred) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-600">Occurred</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Busiest Days */}
            <Card>
              <CardHeader>
                <CardTitle>Busiest Days</CardTitle>
                <CardDescription>Weekly booking distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generalAnalytics?.busiestDays.map((day, idx) => {
                    const maxBookings = getMaxValue(generalAnalytics.busiestDays, 'bookings');
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{day.day}</span>
                          <span className="text-sm font-bold">{day.bookings} bookings</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                            style={{ width: `${(day.bookings / maxBookings) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Popular Time Slots - Extended */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Booking Hours</CardTitle>
                <CardDescription>Most requested time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generalAnalytics?.popularTimeSlots.map((slot, idx) => {
                    const maxBookings = getMaxValue(generalAnalytics.popularTimeSlots, 'bookings');
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{slot.time}</span>
                            <span className="text-sm font-bold">{slot.bookings}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(slot.bookings / maxBookings) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Event Type Performance</CardTitle>
                <CardDescription>Breakdown by meeting type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generalAnalytics?.eventTypes.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-600 transition-colors">
                      <div>
                        <p className="font-semibold">{event.name}</p>
                        <p className="text-xs text-gray-500">{event.avgDuration} min avg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{event.bookings}</p>
                        <p className="text-xs text-gray-600">bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Booking Links Tab */}
        <TabsContent value="booking-links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Booking Links</CardTitle>
              <CardDescription>Create and manage your meeting booking links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingLinks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No booking links yet</h3>
                  <p className="text-gray-600 mb-4">Create your first booking link to start accepting meetings</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Booking Link
                  </Button>
                </div>
              ) : (
                bookingLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-teal-600 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{link.name}</h3>
                          <Badge variant={link.is_active ? 'default' : 'secondary'}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {link.type === 'sales' ? 'Sales' : 'General'}
                          </Badge>
                        </div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {window.location.origin}/book/{link.slug}
                        </code>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {link.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <PhoneCall className="h-3 w-3" />
                            {link.total_bookings} bookings
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {link.conversion_rate}% conversion
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyBookingLink(link.slug)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBookingLink(link);
                          setShowEmbedModal(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Settings</CardTitle>
              <CardDescription>Configure global meeting preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">Settings panel coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Booking Link Dialog - Full Scheduling Features */}
      <CreateBookingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateLink}
      />

      {/* Booking Embed Modal - Show embed options */}
      <BookingEmbedModal
        open={showEmbedModal}
        onOpenChange={setShowEmbedModal}
        bookingLink={selectedBookingLink}
      />
    </div>
  );
}
