/**
 * Payment Methods Management Component
 *
 * Handles multiple payment methods for billing
 */

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "../../lib/api";
import { cn } from "../../lib/utils";

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/stripe/payment-methods");
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      setActionLoading(`default-${paymentMethodId}`);
      const response = await api.put(
        `/api/v1/stripe/payment-methods/${paymentMethodId}/default`,
      );

      if (response.data.success) {
        // Update local state
        setPaymentMethods((methods) =>
          methods.map((method) => ({
            ...method,
            metadata: {
              ...method.metadata,
              is_default: method.id === paymentMethodId ? "true" : "false",
            },
          })),
        );

        toast({
          title: "Success",
          description: "Default payment method updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (paymentMethodId) => {
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return;
    }

    try {
      setActionLoading(`remove-${paymentMethodId}`);
      const response = await api.delete(
        `/api/v1/stripe/payment-methods/${paymentMethodId}`,
      );

      if (response.data.success) {
        setPaymentMethods((methods) =>
          methods.filter((method) => method.id !== paymentMethodId),
        );
        toast({
          title: "Success",
          description: "Payment method removed",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setActionLoading("add");
      const response = await api.post("/api/v1/stripe/create-setup-session");

      if (response.data.success) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open payment method setup",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getCardBrand = (brand) => {
    const brandMap = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      jcb: "JCB",
      unionpay: "UnionPay",
    };
    return brandMap[brand?.toLowerCase()] || brand;
  };

  const getCardIcon = (brand) => {
    // Simple card icon based on brand
    return <CreditCard className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 text-center mt-2">
          Loading payment methods...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Methods
            </h3>
          </div>
          <button
            onClick={handleAddPaymentMethod}
            disabled={actionLoading === "add"}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === "add" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No payment methods
            </h4>
            <p className="text-gray-500 mb-4">
              Add a payment method to manage your subscription
            </p>
            <button
              onClick={handleAddPaymentMethod}
              disabled={actionLoading === "add"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSetDefault={() => handleSetDefault(method.id)}
                onRemove={() => handleRemove(method.id)}
                isLoading={
                  actionLoading === `default-${method.id}` ||
                  actionLoading === `remove-${method.id}`
                }
                getCardBrand={getCardBrand}
                getCardIcon={getCardIcon}
                paymentMethods={paymentMethods}
              />
            ))}
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Payment Processing</p>
              <p>
                Your payment information is encrypted and securely processed by
                Stripe. We never store your card details on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
  isLoading,
  getCardBrand,
  getCardIcon,
  paymentMethods,
}) {
  const isDefault = method.metadata?.is_default === "true";
  const isExpired =
    method.card?.exp_year < new Date().getFullYear() ||
    (method.card?.exp_year === new Date().getFullYear() &&
      method.card?.exp_month < new Date().getMonth() + 1);

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all",
        isDefault
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300",
        isExpired && "border-red-200 bg-red-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Card Icon */}
          <div
            className={cn(
              "w-12 h-8 rounded flex items-center justify-center",
              isDefault ? "bg-blue-100" : "bg-gray-100",
            )}
          >
            {getCardIcon(method.card?.brand)}
          </div>

          {/* Card Details */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {getCardBrand(method.card?.brand)} •••• {method.card?.last4}
              </span>
              {isDefault && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Default
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Expires {method.card?.exp_month}/
              {method.card?.exp_year?.toString().slice(-2)}
            </div>
            {method.billing_details?.name && (
              <div className="text-sm text-gray-500">
                {method.billing_details.name}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isDefault && !isExpired && (
            <button
              onClick={onSetDefault}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Make Default"
              )}
            </button>
          )}

          <button
            onClick={onRemove}
            disabled={isLoading || (isDefault && paymentMethods.length === 1)}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                Remove
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
