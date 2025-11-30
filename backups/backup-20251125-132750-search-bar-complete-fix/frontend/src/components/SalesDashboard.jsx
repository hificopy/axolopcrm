import { useState } from "react";
import {
  Search,
  Bell,
  User,
  Plus,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Filter,
  MoreVertical,
} from "lucide-react";

const SalesDashboard = () => {
  const [selectedStage, setSelectedStage] = useState("all");

  // Mock data for deals
  const deals = {
    "Lead Qualification": [
      {
        id: 1,
        contact: "Sarah Chen",
        company: "TechCorp Inc",
        value: 25000,
        tag: "Hot Lead",
        avatar: "SC",
      },
      {
        id: 2,
        contact: "Mike Johnson",
        company: "Global Solutions",
        value: 6000,
        tag: "New",
        avatar: "MJ",
      },
    ],
    "Needs Analysis": [
      {
        id: 3,
        contact: "Emily Davis",
        company: "StartUp Hub",
        value: 4500,
        tag: "In Progress",
        avatar: "ED",
      },
    ],
    "Value Proposition": [
      {
        id: 4,
        contact: "Alex Rivera",
        company: "Innovation Labs",
        value: 12000,
        tag: "Qualified",
        avatar: "AR",
      },
      {
        id: 5,
        contact: "Lisa Wang",
        company: "Digital Dynamics",
        value: 8500,
        tag: "Follow-up",
        avatar: "LW",
      },
      {
        id: 6,
        contact: "Tom Wilson",
        company: "Cloud Systems",
        value: 5000,
        tag: "New",
        avatar: "TW",
      },
    ],
    "Proposal/Price Quote": [
      {
        id: 7,
        contact: "Rachel Green",
        company: "Enterprise Co",
        value: 45000,
        tag: "Proposal Sent",
        avatar: "RG",
      },
      {
        id: 8,
        contact: "David Kim",
        company: "Tech Starters",
        value: 15000,
        tag: "Review",
        avatar: "DK",
      },
      {
        id: 9,
        contact: "Jennifer Lee",
        company: "Global Tech",
        value: 25000,
        tag: "Negotiating",
        avatar: "JL",
      },
      {
        id: 10,
        contact: "Chris Martin",
        company: "Innovation Corp",
        value: 15000,
        tag: "Proposal Sent",
        avatar: "CM",
      },
      {
        id: 11,
        contact: "Amanda White",
        company: "Solutions Inc",
        value: 10000,
        tag: "Review",
        avatar: "AW",
      },
    ],
    Negotiation: [
      {
        id: 12,
        contact: "Robert Taylor",
        company: "Mega Corporation",
        value: 15000,
        tag: "Final Stage",
        avatar: "RT",
      },
      {
        id: 13,
        contact: "Sophie Brown",
        company: "Tech Giants",
        value: 7000,
        tag: "Verbal",
        avatar: "SB",
      },
    ],
    "Closed Won": [
      {
        id: 14,
        contact: "James Miller",
        company: "Fortune 500",
        value: 35000,
        tag: "Closed",
        avatar: "JM",
      },
      {
        id: 15,
        contact: "Nina Patel",
        company: "Global Enterprises",
        value: 28000,
        tag: "Closed",
        avatar: "NP",
      },
      {
        id: 16,
        contact: "Carlos Rodriguez",
        company: "Tech Solutions",
        value: 22000,
        tag: "Closed",
        avatar: "CR",
      },
      {
        id: 17,
        contact: "Diana Prince",
        company: "Innovation Labs",
        value: 18000,
        tag: "Closed",
        avatar: "DP",
      },
      {
        id: 18,
        contact: "Frank Smith",
        company: "Digital Agency",
        value: 15000,
        tag: "Closed",
        avatar: "FS",
      },
      {
        id: 19,
        contact: "Grace Chen",
        company: "Startup Valley",
        value: 14000,
        tag: "Closed",
        avatar: "GC",
      },
    ],
  };

  const stages = Object.keys(deals);

  const calculateStageTotal = (stageDeals) => {
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const totalDeals = Object.values(deals).flat().length;
  const totalValue = Object.values(deals)
    .flat()
    .reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-semibold text-lg lg:text-xl">
                Axolop CRM
              </span>
            </div>
            <nav className="hidden lg:flex space-x-6">
              <a href="#" className="text-blue-600 font-medium">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Pipeline
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Deals
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contacts
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Companies
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Tasks
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Projects
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                More
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="relative hidden lg:block">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="grid grid-cols-2 lg:flex lg:items-center lg:space-x-8 gap-4 lg:gap-0">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                <span className="text-lg lg:text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </span>
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Total Pipeline Value
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                <span className="text-lg lg:text-2xl font-bold">
                  {totalDeals}
                </span>
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Active Deals
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                <span className="text-lg lg:text-2xl font-bold">28%</span>
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Conversion Rate
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                <span className="text-lg lg:text-2xl font-bold">
                  ${Math.round(totalValue / totalDeals).toLocaleString()}
                </span>
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Avg Deal Size
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Deal</span>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content - Kanban Board */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              All Deals
            </h1>
            <p className="text-gray-600">Manage your sales pipeline</p>
          </div>

          <div className="overflow-x-auto">
            <div className="flex space-x-3 lg:space-x-4 min-w-max">
              {stages.map((stage) => (
                <div key={stage} className="w-72 lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{stage}</h3>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          {deals[stage].length} deals
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ${calculateStageTotal(deals[stage]).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 min-h-[400px]">
                      {deals[stage].map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {deal.avatar}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {deal.contact}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {deal.company}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {deal.tag}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              ${deal.value.toLocaleString()}
                            </span>
                            <div className="flex space-x-1">
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Phone className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Mail className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Calendar className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Deal</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 lg:w-80 bg-white border-l border-gray-200 p-4 lg:p-6 space-y-4 lg:space-y-6 hidden lg:block">
          {/* Activity Feed */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Call with Sarah Chen</p>
                  <p className="text-xs text-gray-500">
                    TechCorp Inc • 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Email sent to Mike Johnson
                  </p>
                  <p className="text-xs text-gray-500">
                    Global Solutions • 4 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Meeting scheduled</p>
                  <p className="text-xs text-gray-500">
                    Emily Davis • 6 hours ago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Monthly Performance
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Target vs Actual</span>
                <span className="text-sm font-semibold text-green-600">
                  75%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold">$150K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold">$112.5K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-yellow-500">🥇</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">John Doe</p>
                  <p className="text-xs text-gray-500">12 deals</p>
                </div>
                <span className="text-sm font-bold text-green-600">$45K</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-400">🥈</span>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">AS</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Alice Smith</p>
                  <p className="text-xs text-gray-500">10 deals</p>
                </div>
                <span className="text-sm font-bold text-green-600">$38K</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-orange-600">🥉</span>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">BJ</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Bob Johnson</p>
                  <p className="text-xs text-gray-500">8 deals</p>
                </div>
                <span className="text-sm font-bold text-green-600">$32K</span>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recent Leads</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Mark Thompson</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    New
                  </span>
                </div>
                <p className="text-xs text-gray-600">Innovation Corp</p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span>mark@innovation.com</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Lisa Anderson</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Hot
                  </span>
                </div>
                <p className="text-xs text-gray-600">Tech Solutions</p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>+1 555-0123</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
                New Deal
              </button>
              <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium">
                Add Contact
              </button>
              <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium">
                Log Activity
              </button>
              <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium">
                Create Task
              </button>
              <button className="p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 text-sm font-medium col-span-2">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
