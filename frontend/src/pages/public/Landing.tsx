import { Link } from 'react-router-dom';
import { Brain, Heart, Shield, Sparkles, ArrowRight, CheckCircle2, Users, Video, Clock, Star, Zap, TrendingUp, Award, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Landing() {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                EWKE
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">How It Works</a>
              <Link to="/testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Testimonials</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 font-semibold">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center space-x-2 glass px-5 py-2.5 rounded-full shadow-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Mental Health Platform
                </span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight">
                Transform Your
                <span className="block gradient-text mt-2">
                  Mental Wellness
                </span>
                Journey Today
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience personalized mental health support with AI-powered assessments, 
                licensed therapists, and secure video sessions—all in one platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="btn-primary group text-lg px-8 py-6">
                    Start Free Assessment
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" className="btn-outline text-lg px-8 py-6">
                    Watch Demo
                    <Video className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6">
                {[
                  { icon: CheckCircle2, text: 'AI-Powered Screening', color: 'text-green-500' },
                  { icon: Shield, text: 'Secure & Private', color: 'text-blue-500' },
                  { icon: Star, text: 'Licensed Therapists', color: 'text-yellow-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Interactive Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-30 float"></div>
              <div className="relative space-y-4">
                {/* Main Card */}
                <Card className="card-glass p-8 hover-lift">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">AI Assessment</p>
                        <p className="text-sm text-gray-600">Instant Analysis</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Active
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-bold text-indigo-600">Instant</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </Card>

                {/* Secondary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="card-glass p-6 hover-lift">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Licensed</p>
                    <p className="text-sm text-gray-600">Therapists</p>
                  </Card>
                  
                  <Card className="card-glass p-6 hover-lift">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-3">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Secure</p>
                    <p className="text-sm text-gray-600">Video Sessions</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 glass px-5 py-2.5 rounded-full shadow-lg mb-6">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Powerful Features</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 gradient-text">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive mental health support designed for your wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Assessment',
                description: 'Advanced machine learning algorithms provide instant mental health screening and personalized recommendations',
                gradient: 'from-indigo-500 to-blue-500',
                delay: '0'
              },
              {
                icon: Users,
                title: 'Licensed Therapists',
                description: 'Connect with certified mental health professionals specialized in various therapeutic approaches',
                gradient: 'from-purple-500 to-pink-500',
                delay: '100'
              },
              {
                icon: Video,
                title: 'Secure Video Sessions',
                description: 'Encrypted video therapy sessions accessible from anywhere, anytime with complete privacy',
                gradient: 'from-pink-500 to-rose-500',
                delay: '200'
              },
              {
                icon: Calendar,
                title: 'Easy Scheduling',
                description: 'Book appointments instantly with real-time availability and automated reminders',
                gradient: 'from-blue-500 to-cyan-500',
                delay: '0'
              },
              {
                icon: MessageCircle,
                title: '24/7 Support',
                description: 'Round-the-clock access to resources, crisis support, and community forums',
                gradient: 'from-green-500 to-emerald-500',
                delay: '100'
              },
              {
                icon: Shield,
                title: 'Complete Privacy',
                description: 'Bank-level encryption and industry-standard security practices keep your data safe',
                gradient: 'from-orange-500 to-red-500',
                delay: '200'
              }
            ].map((feature, index) => (
              <Card key={index} className="card-glass p-8 hover-lift group cursor-pointer">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Take Assessment',
                description: 'Complete our AI-powered mental health assessment in just 5 minutes',
                icon: Brain,
                color: 'indigo'
              },
              {
                step: '02',
                title: 'Match with Therapist',
                description: 'Get matched with licensed therapists based on your needs and preferences',
                icon: Users,
                color: 'purple'
              },
              {
                step: '03',
                title: 'Start Your Journey',
                description: 'Begin your personalized therapy sessions via secure video calls',
                icon: Video,
                color: 'pink'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="card-glass p-8 hover-lift text-center">
                  <div className={`text-6xl font-bold text-${item.color}-200 mb-4`}>{item.step}</div>
                  <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="card-glass p-12 rounded-3xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Brain, number: 'AI-Powered', label: 'Mental Health Screening', color: 'indigo' },
                { icon: Award, number: 'Licensed', label: 'Professional Therapists', color: 'purple' },
                { icon: Shield, number: 'Secure', label: 'Private & Encrypted', color: 'pink' },
                { icon: Video, number: '24/7', label: 'Video Sessions', color: 'yellow' }
              ].map((stat, index) => (
                <div key={index} className="space-y-3">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold gradient-text">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-animate p-16 border-0 text-white text-center shadow-2xl">
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Life?</h2>
            <p className="text-2xl mb-10 text-white/90">
              Take the first step towards better mental health today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl text-lg px-10 py-6 font-bold">
                  Start Free Today
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 font-bold">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">EWKE</span>
              </div>
              <p className="text-gray-400">
                Professional mental health support, powered by AI
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Security', 'Roadmap']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'HIPAA', 'Cookies']
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-bold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 EWKE. All rights reserved. Made with ❤️ for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
