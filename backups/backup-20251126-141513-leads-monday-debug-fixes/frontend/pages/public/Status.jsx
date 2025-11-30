import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Bell, ExternalLink } from 'lucide-react';

/**
 * Status Page - System status and uptime monitoring
 */

const SERVICES = [
  { name: 'Web Application', status: 'operational', uptime: '99.99%' },
  { name: 'API', status: 'operational', uptime: '99.98%' },
  { name: 'Database', status: 'operational', uptime: '99.99%' },
  { name: 'Email Delivery', status: 'operational', uptime: '99.95%' },
  { name: 'File Storage', status: 'operational', uptime: '99.99%' },
  { name: 'Calendar Sync', status: 'operational', uptime: '99.97%' },
  { name: 'AI Services', status: 'operational', uptime: '99.90%' },
  { name: 'Webhooks', status: 'operational', uptime: '99.96%' },
];

const INCIDENTS = [
  {
    date: 'November 20, 2025',
    title: 'Scheduled Maintenance Completed',
    status: 'resolved',
    description: 'Database optimization completed successfully. No service interruption occurred.',
    updates: [
      { time: '03:00 UTC', text: 'Maintenance started' },
      { time: '03:45 UTC', text: 'Database optimization complete' },
      { time: '03:50 UTC', text: 'All services verified operational' },
    ],
  },
  {
    date: 'November 15, 2025',
    title: 'Email Delivery Delays',
    status: 'resolved',
    description: 'Some users experienced delays in email delivery. Issue has been resolved.',
    updates: [
      { time: '14:30 UTC', text: 'Issue identified - investigating' },
      { time: '14:45 UTC', text: 'Root cause found - SendGrid rate limiting' },
      { time: '15:30 UTC', text: 'Rate limiting adjusted, backlog clearing' },
      { time: '16:00 UTC', text: 'All emails delivered, incident resolved' },
    ],
  },
  {
    date: 'November 10, 2025',
    title: 'API Performance Degradation',
    status: 'resolved',
    description: 'API response times were elevated for approximately 30 minutes.',
    updates: [
      { time: '09:15 UTC', text: 'Elevated API response times detected' },
      { time: '09:20 UTC', text: 'Scaling additional servers' },
      { time: '09:45 UTC', text: 'Performance restored to normal levels' },
    ],
  },
];

const statusConfig = {
  operational: { icon: CheckCircle, color: 'text-[#2DCE89]', bg: 'bg-[#2DCE89]', label: 'Operational' },
  degraded: { icon: AlertTriangle, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]', label: 'Degraded' },
  outage: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500', label: 'Outage' },
  maintenance: { icon: Clock, color: 'text-[#5BB9F5]', bg: 'bg-[#5BB9F5]', label: 'Maintenance' },
  resolved: { icon: CheckCircle, color: 'text-[#2DCE89]', bg: 'bg-[#2DCE89]', label: 'Resolved' },
};

const Status = () => {
  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="System Status - Axolop CRM"
        description="Check the current status of Axolop CRM services and view incident history."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl bg-[#2DCE89]/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#2DCE89]/20 flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-[#2DCE89]" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">System Status</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Current status of Axolop CRM services
            </p>

            {/* Overall Status Banner */}
            <div className={cn(
              'inline-flex items-center gap-3 px-6 py-3 rounded-full',
              allOperational ? 'bg-[#2DCE89]/20' : 'bg-[#F5A623]/20'
            )}>
              {allOperational ? (
                <>
                  <CheckCircle className="w-5 h-5 text-[#2DCE89]" />
                  <span className="text-[#2DCE89] font-semibold">All Systems Operational</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[#F5A623] font-semibold">Some Systems Experiencing Issues</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscribe Banner */}
      <section className="py-4 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#d4463c]" />
              <span className="text-gray-300 text-sm">Get notified about status changes</span>
            </div>
            <button
              className={cn(
                'px-4 py-2 rounded-lg',
                'bg-gray-800 hover:bg-gray-700',
                'text-white font-medium text-sm',
                'transition-colors'
              )}
            >
              Subscribe to Updates
            </button>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">Services</h2>
          <div className="space-y-3">
            {SERVICES.map((service, index) => {
              const config = statusConfig[service.status];
              const Icon = config.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5', config.color)} />
                    <span className="text-white font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">{service.uptime} uptime</span>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', config.color, `${config.bg}/20`)}>
                      {config.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Uptime Chart Placeholder */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">90-Day Uptime</h2>
          <div className="p-6 rounded-xl bg-white/5 border border-gray-800/50">
            <div className="flex gap-1 mb-4">
              {[...Array(90)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-8 rounded-sm',
                    Math.random() > 0.02 ? 'bg-[#2DCE89]' : 'bg-[#F5A623]'
                  )}
                  title={`Day ${90 - i}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#2DCE89]" />
                <span className="text-gray-400 text-sm">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#F5A623]" />
                <span className="text-gray-400 text-sm">Incident</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">Incident History</h2>
          <div className="space-y-6">
            {INCIDENTS.map((incident, index) => {
              const config = statusConfig[incident.status];
              const Icon = config.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-white/5 border border-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">{incident.date}</span>
                      <h3 className="text-lg font-semibold text-white mt-1">{incident.title}</h3>
                    </div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1', config.color, `${config.bg}/20`)}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{incident.description}</p>
                  <div className="space-y-2 border-t border-gray-800 pt-4">
                    {incident.updates.map((update, updateIndex) => (
                      <div key={updateIndex} className="flex gap-4 text-sm">
                        <span className="text-gray-500 font-mono">{update.time}</span>
                        <span className="text-gray-300">{update.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* External Links */}
      <section className="py-12 bg-gradient-to-b from-black to-[#761B14]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-4">
            For real-time updates, follow us on Twitter or check our status page.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://twitter.com/axolop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              Twitter Updates <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Status;
