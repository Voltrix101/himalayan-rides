import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown,
  Send,
  Star,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'trip' | 'general';
}

interface ContactInfo {
  type: 'phone' | 'email' | 'whatsapp';
  value: string;
  label: string;
  available: string;
  icon: React.ReactNode;
}

export function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book a trip?',
      answer: 'You can book a trip by browsing our available tours, selecting your preferred dates and participant count, then following the booking process. Payment can be made securely online.',
      category: 'booking'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway.',
      category: 'payment'
    },
    {
      id: '3',
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify your booking up to 48 hours before the trip start date. Cancellation charges may apply based on the timing of cancellation.',
      category: 'booking'
    },
    {
      id: '4',
      question: 'What should I bring on the trip?',
      answer: 'Pack weather-appropriate clothing, comfortable shoes, sunscreen, water bottle, and any personal medications. We\'ll provide a detailed packing list after booking.',
      category: 'trip'
    },
    {
      id: '5',
      question: 'Are the trips suitable for beginners?',
      answer: 'Most of our trips are designed for all skill levels. Each trip listing includes difficulty level and requirements. Our guides provide support for beginners.',
      category: 'trip'
    },
    {
      id: '6',
      question: 'What if the weather is bad?',
      answer: 'We monitor weather conditions closely. If a trip needs to be cancelled due to severe weather, we offer full refunds or rescheduling options.',
      category: 'trip'
    },
    {
      id: '7',
      question: 'How do I get my booking confirmation?',
      answer: 'After successful payment, you\'ll receive a booking confirmation via email and SMS. You can also download your booking voucher from the "Your Trips" section.',
      category: 'booking'
    },
    {
      id: '8',
      question: 'Is travel insurance included?',
      answer: 'Basic travel insurance is included in all our packages. However, we recommend comprehensive travel insurance for additional coverage.',
      category: 'general'
    }
  ];

  const contactInfo: ContactInfo[] = [
    {
      type: 'phone',
      value: '+91 98765 43210',
      label: 'Call Us',
      available: '24/7 Support',
      icon: <Phone className="w-5 h-5" />
    },
    {
      type: 'email',
      value: 'support@himalayanrides.com',
      label: 'Email Support',
      available: 'Response within 2 hours',
      icon: <Mail className="w-5 h-5" />
    },
    {
      type: 'whatsapp',
      value: '+91 98765 43210',
      label: 'WhatsApp',
      available: 'Instant messaging',
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'booking', label: 'Booking', icon: <Calendar className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'trip', label: 'Trip Info', icon: <MapPin className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <Users className="w-4 h-4" /> }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Simulate form submission
    toast.success('Your message has been sent! We\'ll get back to you soon.');
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };

  const emergencyInfo = [
    {
      title: 'Emergency Hotline',
      value: '+91 98765 43210',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      description: 'Available 24/7 for urgent issues during trips'
    },
    {
      title: 'Medical Emergency',
      value: '108 / 102',
      icon: <Shield className="w-5 h-5 text-red-400" />,
      description: 'National emergency numbers for medical assistance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get instant answers to common questions or reach out to our support team
          </p>
        </motion.div>

        {/* Emergency Contact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="border-red-500/30 bg-red-900/20">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Emergency Contacts
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {emergencyInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {info.icon}
                    <div>
                      <div className="font-semibold text-white">{info.title}: {info.value}</div>
                      <div className="text-sm text-white/70">{info.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                <div className="space-y-4">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="text-blue-400 mt-1">{contact.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">{contact.label}</h3>
                        <p className="text-white/80">{contact.value}</p>
                        <p className="text-sm text-white/60">{contact.available}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Office Hours */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Office Hours
                  </h3>
                  <div className="text-white/80 text-sm space-y-1">
                    <div>Monday - Friday: 9:00 AM - 8:00 PM</div>
                    <div>Saturday - Sunday: 10:00 AM - 6:00 PM</div>
                  </div>
                </div>

                {/* Office Location */}
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Our Office
                  </h3>
                  <div className="text-white/80 text-sm">
                    <div>Himalayan Rides Headquarters</div>
                    <div>Leh, Ladakh 194101</div>
                    <div>Jammu & Kashmir, India</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {category.icon}
                      {category.label}
                    </button>
                  ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-white">{faq.question}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-white/60 transition-transform ${
                            expandedFAQ === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedFAQ === faq.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 text-white/80 bg-white/5">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <GlassCard>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Priority</label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                    >
                      <option value="low" className="bg-slate-800">Low</option>
                      <option value="medium" className="bg-slate-800">Medium</option>
                      <option value="high" className="bg-slate-800">High</option>
                      <option value="urgent" className="bg-slate-800">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Message *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="Please describe your question or concern in detail..."
                    required
                  />
                </div>

                <Button type="submit" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </GlassCard>
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <GlassCard>
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">How was your experience?</h3>
              <p className="text-white/70 mb-6">Your feedback helps us improve our services</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-sm text-white/60">Click stars to rate our support</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
