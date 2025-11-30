/**
 * Enhanced Billing History with CSV Export
 *
 * Shows complete billing history with export functionality
 */

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "../../lib/api";
import { cn } from "../../lib/utils";

export default function BillingHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/stripe/billing-history");
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "Error",
        description: "Failed to load billing history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get("/api/v1/stripe/billing-history/export", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `axolop-billing-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Billing history exported to CSV",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export billing history",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "open":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "void":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "uncollectible":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "void":
        return "bg-gray-100 text-gray-700";
      case "uncollectible":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toLowerCase(),
    }).format(amount / 100);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              Billing History
            </h3>
          </div>
          <button
            onClick={exportToCSV}
            disabled={exporting || loading || invoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading billing history...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No billing history found</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <InvoiceItem
              key={invoice.id}
              invoice={invoice}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
}

function InvoiceItem({
  invoice,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="hover:bg-gray-50 transition-colors">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left side - Invoice info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(invoice.status)}
              <h4 className="font-medium text-gray-900">
                {invoice.description || "Subscription Payment"}
              </h4>
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getStatusColor(invoice.status),
                )}
              >
                {invoice.status}
              </span>
              {invoice.attempt_count > 1 && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  {invoice.attempt_count} attempts
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span>Invoice #{invoice.number || invoice.id.slice(-8)}</span>
                {invoice.subscription && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    Recurring
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Created:{" "}
                    {new Date(invoice.created * 1000).toLocaleDateString()}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      Due:{" "}
                      {new Date(invoice.due_date * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {invoice.period_start && invoice.period_end && (
                <div>
                  Period:{" "}
                  {new Date(invoice.period_start * 1000).toLocaleDateString()} -{" "}
                  {new Date(invoice.period_end * 1000).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Payment attempts details */}
            {invoice.attempt_count > 1 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Payment failed {invoice.attempt_count} times
                    </p>
                    {invoice.webhooks_delivered_at && (
                      <p className="text-xs mt-1">
                        Last attempt:{" "}
                        {new Date(
                          invoice.webhooks_delivered_at * 1000,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Amount and actions */}
          <div className="text-right ml-6">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                invoice.amount_paid || invoice.total || 0,
                invoice.currency,
              )}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {invoice.currency?.toUpperCase() || "USD"}
            </div>

            <div className="flex flex-col gap-2">
              {invoice.hosted_invoice_url && (
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Invoice
                </a>
              )}
              {invoice.invoice_pdf && (
                <a
                  href={invoice.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Download className="h-3 w-3" />
                  Download PDF
                </a>
              )}
              {invoice.status === "open" && (
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable details */}
        {invoice.lines &&
          invoice.lines.data &&
          invoice.lines.data.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showDetails ? "Hide" : "Show"} Details (
                {invoice.lines.data.length} items)
              </button>

              {showDetails && (
                <div className="mt-3 space-y-2">
                  {invoice.lines.data.map((line, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{line.description}</span>
                        <span>
                          {formatCurrency(line.amount, line.currency)}
                        </span>
                      </div>
                      {line.quantity && line.quantity > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {line.quantity} ×{" "}
                          {formatCurrency(
                            line.amount / line.quantity,
                            line.currency,
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
