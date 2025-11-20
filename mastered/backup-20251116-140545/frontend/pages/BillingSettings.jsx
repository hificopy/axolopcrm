import { useState } from 'react';
import { CreditCard, Calendar, Shield, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BillingSettings() {
  const [activeTab, setActiveTab] = useState('billing');
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: '**** **** **** 1234',
    cardExpiry: '12/26',
    cardCvv: '***',
    cardHolder: 'Juan D. Romero',
    billingAddress: '123 Main St, Tampa, FL 33601',
    billingEmail: 'juan@axolop.com',
    plan: 'Professional',
    nextBilling: 'Dec 1, 2025',
    amount: '$49.00',
    currency: 'USD'
  });

  const [usageData, setUsageData] = useState({
    leadsCreated: 142,
    outboundCalls: 87,
    inboundCalls: 43,
    sentEmails: 256,
    receivedEmails: 312,
    opportunitiesCreated: 23
  });

  const [invoices, setInvoices] = useState([
    { id: 'INV-001', date: '2025-10-01', amount: '$49.00', status: 'Paid', download: '#' },
    { id: 'INV-002', date: '2025-09-01', amount: '$49.00', status: 'Paid', download: '#' },
    { id: 'INV-003', date: '2025-08-01', amount: '$49.00', status: 'Paid', download: '#' },
  ]);

  const handleUpdatePayment = () => {
    // In a real app, this would open a payment update modal
    alert('Payment method update functionality would be implemented here');
  };

  const handleDownloadInvoice = (invoiceId) => {
    // In a real app, this would download the invoice
    console.log(`Downloading invoice: ${invoiceId}`);
    alert(`Downloading invoice ${invoiceId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Billing Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your subscription and usage
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg border border-crm-border p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'billing'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'usage'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Usage</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-crm-border p-6">
                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-white rounded-lg border border-crm-border p-6">
                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Current Plan</h2>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-crm-text-primary">{billingInfo.plan}</h3>
                          <p className="text-crm-text-secondary">Professional plan with advanced features</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-crm-text-primary">{billingInfo.amount}/{billingInfo.currency}</p>
                          <p className="text-sm text-crm-text-secondary">Bills on {billingInfo.nextBilling}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg border border-crm-border p-6">
                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Payment Method</h2>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-crm-text-primary">Visa ending in {billingInfo.cardNumber.slice(-4)}</p>
                              <p className="text-sm text-crm-text-secondary">Expires {billingInfo.cardExpiry}</p>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={handleUpdatePayment}>
                          Update Payment Method
                        </Button>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="bg-white rounded-lg border border-crm-border p-6">
                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Billing Information</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-crm-text-secondary mb-1">Cardholder Name</label>
                          <p className="text-crm-text-primary">{billingInfo.cardHolder}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-crm-text-secondary mb-1">Billing Address</label>
                          <p className="text-crm-text-primary">{billingInfo.billingAddress}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-crm-text-secondary mb-1">Billing Email</label>
                          <p className="text-crm-text-primary">{billingInfo.billingEmail}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-crm-text-secondary mb-1">Next Billing Date</label>
                          <p className="text-crm-text-primary">{billingInfo.nextBilling}</p>
                        </div>
                      </div>
                    </div>

                    {/* Invoices */}
                    <div className="bg-white rounded-lg border border-crm-border p-6">
                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Recent Invoices</h2>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-crm-border">
                              <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Invoice ID</th>
                              <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Date</th>
                              <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Amount</th>
                              <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Status</th>
                              <th className="text-right py-2 text-sm font-medium text-crm-text-secondary">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="border-b border-gray-100 last:border-b-0">
                                <td className="py-3">{invoice.id}</td>
                                <td className="py-3">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="py-3">{invoice.amount}</td>
                                <td className="py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                  >
                                    Download
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Subscription Management */}
                    <div className="bg-white rounded-lg border border-crm-border p-6">
                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Subscription Management</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h3 className="font-medium text-crm-text-primary">Cancel Subscription</h3>
                              <p className="text-sm text-crm-text-secondary">This will end your subscription immediately</p>
                            </div>
                          </div>
                          <Button variant="destructive">Cancel Subscription</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <h3 className="font-medium text-crm-text-primary">Change Plan</h3>
                            <p className="text-sm text-crm-text-secondary">Upgrade or downgrade your subscription</p>
                          </div>
                          <Button variant="outline">View Plans</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Usage</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* Leads Created */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Leads Created</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.leadsCreated}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>

                      {/* Outbound Calls */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Outbound Calls</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.outboundCalls}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>

                      {/* Inbound Calls */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Inbound Calls</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.inboundCalls}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>

                      {/* Sent Emails */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Sent Emails</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.sentEmails}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>

                      {/* Received Emails */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Received Emails</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.receivedEmails}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>

                      {/* Opportunities Created */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-crm-border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-crm-text-secondary">Opportunities Created</h3>
                        </div>
                        <p className="text-2xl font-bold text-crm-text-primary">{usageData.opportunitiesCreated}</p>
                        <p className="text-sm text-crm-text-secondary mt-1">This period</p>
                      </div>
                    </div>

                    <div className="bg-white border border-crm-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-crm-text-primary mb-4">Usage Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-crm-text-primary mb-2">Plan Limits</h4>
                          <ul className="space-y-2 text-sm text-crm-text-secondary">
                            <li className="flex justify-between">
                              <span>Monthly Leads</span>
                              <span>142 / 500</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Storage</span>
                              <span>2.4 GB / 10 GB</span>
                            </li>
                            <li className="flex justify-between">
                              <span>API Calls</span>
                              <span>1,245 / 10,000</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-crm-text-primary mb-2">Billing Period</h4>
                          <p className="text-sm text-crm-text-secondary">Nov 1, 2025 - Nov 30, 2025</p>
                          <p className="text-sm text-crm-text-secondary mt-2">Next billing: Dec 1, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}