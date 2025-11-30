// src/pages/AffiliatePortal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Copy,
  Check,
  Download,
  Lightbulb,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from 'lucide-react';
import axios from 'axios';
import { useSupabase } from '../context/SupabaseContext';

const AffiliatePortal = () => {
  const { supabase, user } = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [materials, setMaterials] = useState([]);

  // Helper to get auth headers from Supabase session
  const getAuthHeaders = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { 'Authorization': `Bearer ${session.access_token}` };
      }
    } catch (error) {
      console.error('Error getting auth session:', error);
    }
    return {};
  }, [supabase]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadMarketingMaterials();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/dashboard`, {
        headers: authHeaders,
      });
      setDashboardData(response.data);
    } catch (error) {
      // If user doesn't have an affiliate account yet, show join screen
      if (error.response?.status === 404) {
        setDashboardData(null);
      } else {
        console.error('Error loading dashboard:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const joinAffiliateProgram = async () => {
    try {
      setLoading(true);
      const authHeaders = await getAuthHeaders();
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/join`, {}, {
        headers: authHeaders,
      });
      if (response.data.success) {
        // Reload dashboard data after joining
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error joining affiliate program:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketingMaterials = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/materials`, {
        headers: authHeaders,
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const handleCopyLink = () => {
    if (dashboardData?.affiliate?.referral_code) {
      const affiliateLink = `${window.location.origin}/landing?ref=${dashboardData.affiliate.referral_code}`;
      navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading affiliate dashboard...</div>
      </div>
    );
  }

  // If user hasn't joined affiliate program yet
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Portal</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Join our affiliate program and start earning commissions
            </p>
          </div>
        </div>

        {/* Join Program Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Axolop Affiliate Program
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Earn up to 40% commission for every referral who becomes a paying customer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <DollarSign className="text-3xl text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">High Commission</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Earn up to 40% recurring commission on every referral
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <Users className="text-3xl text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Referrals</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Share your unique link with your network
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <TrendingUp className="text-3xl text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor your referrals and earnings in real-time
                </p>
              </div>
            </div>

            <button
              onClick={joinAffiliateProgram}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg transition-colors text-lg"
            >
              Join Affiliate Program
            </button>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              By joining, you agree to our affiliate terms and conditions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const monthly = dashboardData?.monthly || {};
  const affiliate = dashboardData?.affiliate || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Portal</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your affiliate account and track your earnings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'reports', 'payment', 'payment-history', 'invoice', 'strategies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<DollarSign />}
                title="Total Earnings"
                value={`$${stats.total_earnings?.toFixed(2) || '0.00'}`}
                subtitle={`$${monthly.earnings?.toFixed(2) || '0.00'} this month`}
                color="green"
              />
              <StatCard
                icon={<Users />}
                title="Total Referrals"
                value={stats.total_referrals || 0}
                subtitle={`${monthly.referrals || 0} this month`}
                color="blue"
              />
              <StatCard
                icon={<TrendingUp />}
                title="Active Referrals"
                value={stats.active_referrals || 0}
                subtitle={`${stats.successful_referrals || 0} successful`}
                color="purple"
              />
              <StatCard
                icon={<Clock />}
                title="Pending Earnings"
                value={`$${stats.pending_earnings?.toFixed(2) || '0.00'}`}
                subtitle={`${stats.commission_rate}% commission rate`}
                color="orange"
              />
            </div>

            {/* Referral Link Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Referral Link
              </h3>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <input
                  type="text"
                  value={`${window.location.origin}/landing?ref=${affiliate.referral_code}`}
                  readOnly
                  className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Commissions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Commissions
                </h3>
                <div className="space-y-3">
                  {dashboardData?.recent_commissions?.length > 0 ? (
                    dashboardData.recent_commissions.map((commission) => (
                      <div
                        key={commission.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {commission.type}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            +${commission.amount}
                          </p>
                          <p className={`text-xs ${
                            commission.status === 'paid' ? 'text-green-600' :
                            commission.status === 'pending' ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {commission.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No commissions yet. Start sharing your referral link!
                    </p>
                  )}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Clicks this month</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {monthly.clicks || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((monthly.clicks || 0) / 100 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {monthly.referrals || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((monthly.referrals || 0) / 50 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {monthly.clicks > 0 ? ((monthly.referrals / monthly.clicks) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${monthly.clicks > 0 ? Math.min((monthly.referrals / monthly.clicks) * 100, 100) : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Promoter Reports
            </h3>
            <div className="space-y-4">
              {dashboardData?.referrals?.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Referral #{referral.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {referral.status} • Joined: {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${referral.total_commission_earned?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      LTV: ${referral.customer_lifetime_value?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Payment Details
            </h3>
            <form className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>PayPal</option>
                  <option>Stripe</option>
                  <option>Bank Transfer</option>
                  <option>Crypto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="your-email@example.com"
                />
              </div>
              <button className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
                Update Payment Details
              </button>
            </form>
          </div>
        )}

        {activeTab === 'payment-history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Payment History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Method
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No payment history yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Invoice History
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No invoices available
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-6">
            {/* Promotional Strategies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="text-yellow-500 text-2xl" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Promotional Strategies
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StrategyCard
                  title="Email Your Network"
                  description="Send personalized emails to your contacts introducing Axolop"
                  icon={<Mail className="h-5 w-5" />}
                  tips={[
                    'Personalize each email',
                    'Share your experience',
                    'Offer to answer questions',
                    'Include your referral link',
                  ]}
                />
                <StrategyCard
                  title="Social Media Posts"
                  description="Share on LinkedIn, Twitter, Facebook, and Instagram"
                  icon={<Twitter className="h-5 w-5" />}
                  tips={[
                    'Share success stories',
                    'Post screenshots of wins',
                    'Tag relevant people',
                    'Use relevant hashtags',
                  ]}
                />
                <StrategyCard
                  title="Content Marketing"
                  description="Create blog posts, videos, or tutorials about Axolop"
                  icon={<BarChart3 className="h-5 w-5" />}
                  tips={[
                    'Write comparison articles',
                    'Create tutorial videos',
                    'Share case studies',
                    'Review Axolop features',
                  ]}
                />
                <StrategyCard
                  title="Community Engagement"
                  description="Participate in forums and communities where your audience hangs out"
                  icon={<Users className="h-5 w-5" />}
                  tips={[
                    'Join relevant Slack/Discord',
                    'Answer questions on Reddit',
                    'Participate in Facebook groups',
                    'Provide genuine value first',
                  ]}
                />
              </div>
            </div>

            {/* Marketing Materials */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Marketing Materials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {material.title}
                      </h4>
                      <Download className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {material.description}
                    </p>
                    <button className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium transition-colors">
                      Copy Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Strategy Card Component
const StrategyCard = ({ title, description, icon, tips }) => {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <ul className="ml-11 space-y-1">
        {tips.map((tip, index) => (
          <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
            • {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AffiliatePortal;
