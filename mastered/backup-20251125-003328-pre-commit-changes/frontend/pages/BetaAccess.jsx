import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, CheckCircle2, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';

export default function BetaAccess() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    reason: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit to backend when ready
    console.log('Beta access application:', formData);
    setIsSubmitted(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', company: '', reason: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-white font-semibold">Beta Access</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-500 text-sm font-medium">Early Access Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get Early Access to Funnels
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Be among the first to experience our revolutionary funnels feature. Join our beta program and get weekly early access to cutting-edge features.
            </p>
          </div>

          {/* VSL Placeholder */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-white/10 mb-12">
            <CardContent className="p-12">
              <div className="aspect-video bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-gray-400 text-sm">VSL Coming Soon</p>
                  <p className="text-gray-500 text-xs mt-1">Video Sales Letter Placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Sparkles,
                title: 'Early Access',
                description: 'Get features weeks before general release'
              },
              {
                icon: Zap,
                title: 'Priority Support',
                description: 'Direct line to our development team'
              },
              {
                icon: CheckCircle2,
                title: 'Shape the Future',
                description: 'Your feedback directly influences development'
              }
            ].map((benefit, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Form */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Apply for Beta Access</CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below and we'll review your application within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-gray-400">We'll review your application and get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Full Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Company/Agency Name</label>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500"
                      placeholder="Your Agency LLC"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Why do you want beta access? *</label>
                    <Textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                      placeholder="Tell us about your use case and how you plan to use funnels..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold"
                    size="lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to be contacted about the beta program.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
