/**
 * Payment Wall
 *
 * Complete lockout screen for unpaid accounts
 * Only billing page accessible, all other navigation blocked
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  XCircle,
  LogOut,
  ExternalLink,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAccountStatus } from "../../hooks/useAccountStatus";
import { useAgency } from "../../hooks/useAgency";
import { useToast } from "@/components/ui/use-toast";
import api from "../../lib/api";
import { cn } from "../../lib/utils";

export default function PaymentWall() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription } = useAgency();
  const { getStatus } = useAccountStatus();
  const [actionLoading, setActionLoading] = useState(null);

  const status = getStatus();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    setActionLoading("portal");
    try {
      const response = await api.post("/api/v1/stripe/create-portal-session");
      if (response.data.success) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case "canceled":
        return {
          icon: XCircle,
          color: "red",
          title: "Subscription Canceled",
          description:
            "Your subscription has been canceled and access has been restricted.",
          action: "Reactivate Subscription",
        };
      case "unpaid":
        return {
          icon: AlertTriangle,
          color: "red",
          title: "Payment Required",
          description:
            "Your payment method failed. Please update your payment information to continue.",
          action: "Update Payment Method",
        };
      case "past_due":
        return {
          icon: AlertTriangle,
          color: "orange",
          title: "Payment Overdue",
          description:
            "Your payment is overdue. Please pay to avoid service interruption.",
          action: "Pay Now",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "red",
          title: "Account Restricted",
          description:
            "Please update your payment information to restore access.",
          action: "Update Payment",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Collapsed Sidebar - Only Logo and Logout */}
        <div className="w-16 bg-gray-900 h-screen flex flex-col">
          <div className="p-4">
            <img
              src="/axolop-logo.png"
              alt="Axolop CRM"
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0YwRDAyOCIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTE2IDI0SDI0VjE2SDE2VjI0Wk04IDI0SDE2VjE2SDhWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
              }}
            />
          </div>

          <div className="flex-1"></div>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content - Billing Only */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Account Status Card */}
            <div
              className={cn(
                "rounded-xl border p-6",
                statusInfo.color === "red"
                  ? "bg-red-50 border-red-200"
                  : "bg-orange-50 border-orange-200",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    statusInfo.color === "red" ? "bg-red-100" : "bg-orange-100",
                  )}
                >
                  <StatusIcon
                    className={cn(
                      "h-6 w-6",
                      statusInfo.color === "red"
                        ? "text-red-600"
                        : "text-orange-600",
                    )}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {statusInfo.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{statusInfo.description}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleManageBilling}
                      disabled={actionLoading === "portal"}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === "portal" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {statusInfo.action}
                    </button>
                    <Link
                      to="/pricing"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Plan Info */}
            {subscription && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Plan
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {subscription.tier || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.billing_interval === "yearly"
                        ? "Billed yearly"
                        : "Billed monthly"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      $
                      {subscription.amount
                        ? (subscription.amount / 100).toFixed(2)
                        : "0.00"}
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing History */}
            <BillingHistory />

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Need Help?
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  • Contact our support team for assistance with payment issues
                </p>
                <p>• Check our documentation for billing questions</p>
                <p>• View our FAQ for common payment problems</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Contact Support
                </button>
                <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified Billing History component for Payment Wall
function BillingHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/api/v1/stripe/invoices");
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No invoices found</div>
        ) : (
          invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-900">
                  ${(invoice.amount_paid / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(invoice.created * 1000).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  )}
                >
                  {invoice.status}
                </span>
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
