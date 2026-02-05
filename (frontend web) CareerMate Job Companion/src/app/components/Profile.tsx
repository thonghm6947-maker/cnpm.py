import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Settings,
  Bell,
  Lock,
  CreditCard,
  Download,
  Edit,
  Linkedin,
  Github,
  Globe,
  Loader2,
  Save,
  AlertCircle,
  Check
} from 'lucide-react';
import type { Page } from '../App';
import { profileAPI, authAPI, subscriptionAPI } from '../../services/api';

interface ProfileProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
}

interface SubscriptionPackage {
  package_id: number;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  features: string[];
}

export function Profile({ onNavigate, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscriptionPackages, setSubscriptionPackages] = useState<SubscriptionPackage[]>([]);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'input' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'momo'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  // Load profile and subscription packages on mount
  useEffect(() => {
    loadProfile();
    loadPackages();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const result = await subscriptionAPI.getMySubscription();
      if (result.success) {
        setUserPlan(result.plan || 'free');
        if (result.subscription) {
          setSubscriptionInfo(result.subscription);
        }
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  };

  const loadPackages = async () => {
    try {
      const result = await subscriptionAPI.getPackages();
      if (result.success && result.packages) {
        setSubscriptionPackages(result.packages);
      }
    } catch (err) {
      console.error('Failed to load subscription packages:', err);
    }
  };

  const handleUpgradeClick = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setPaymentStep('processing');
    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const result = await subscriptionAPI.subscribe(selectedPackage.package_id, paymentMethod);

      if (result.success) {
        setPaymentStep('success');
        setUserPlan('premium');
        setSubscriptionInfo(result.subscription);
      } else {
        setError(result.error || 'Payment failed');
        setShowPaymentModal(false);
      }
    } catch (err) {
      setError('Payment processing failed');
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep('select');
    setSelectedPackage(null);
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get profile data and user info (for email)
      const [profileResponse, userResponse] = await Promise.all([
        profileAPI.getCandidate(),
        authAPI.getMe()
      ]);

      console.log('Profile API Response:', profileResponse);
      console.log('User API Response:', userResponse);

      if (profileResponse && !profileResponse.error) {
        setProfile({
          full_name: profileResponse.full_name || '',
          email: userResponse?.email || '', // Email comes from /api/auth/me
          phone: profileResponse.phone || '',
          bio: profileResponse.bio || '',
          avatar_url: profileResponse.avatar_url || ''
        });
      } else {
        setError(profileResponse.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Load profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await profileAPI.updateCandidate({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        avatar_url: profile.avatar_url
      });
      if (response && !response.error) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-900">×</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <Save className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>

                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Personal Information</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled={true}
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Professional Summary</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself and your career goals..."
                      />
                    </div>

                    {isEditing && (
                      <div className="pt-4">
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 mt-6">
                  <h2 className="text-xl mb-4">Social Links</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
                    </div>
                    <div>
                      <Label htmlFor="github" className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub
                      </Label>
                      <Input id="github" placeholder="https://github.com/yourusername" />
                    </div>
                    <div>
                      <Label htmlFor="portfolio" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Portfolio Website
                      </Label>
                      <Input id="portfolio" placeholder="https://yourportfolio.com" />
                    </div>
                    <Button>Update Links</Button>
                  </div>
                </Card>
              </TabsContent>



              <TabsContent value="settings" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-xl mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Email notifications for job matches', checked: true },
                          { label: 'Weekly career tips newsletter', checked: true },
                          { label: 'Course recommendations', checked: false },
                          { label: 'Application status updates', checked: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">{item.label}</span>
                            <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Privacy
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Make profile visible to recruiters', checked: true },
                          { label: 'Show learning progress publicly', checked: false },
                          { label: 'Allow others to see achievements', checked: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">{item.label}</span>
                            <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Password & Security
                      </h3>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="mb-2 text-sm font-medium text-red-600">Danger Zone</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="premium" className="mt-6">
                <Card className="p-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white mb-6">
                  <h2 className="text-2xl mb-2">Upgrade to Premium</h2>
                  <p className="opacity-90">Unlock advanced AI features and accelerate your career growth</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free Plan - always show */}
                  <Card className="p-6">
                    <div className="mb-6">
                      <h3 className="text-xl mb-2">Free Plan</h3>
                      <div className="text-3xl mb-1">0 VND</div>
                      <p className="text-sm text-gray-600">Forever free</p>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Basic CV analysis',
                        '5 AI coaching sessions/month',
                        'Job recommendations',
                        'Access to courses',
                        'Community support'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-gray-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Badge variant="outline">Current Plan</Badge>
                  </Card>

                  {/* Premium Plans from API */}
                  {subscriptionPackages.length > 0 ? (
                    subscriptionPackages.map((pkg) => (
                      <Card key={pkg.package_id} className="p-6 border-2 border-blue-600 relative">
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-violet-500 to-purple-600">Popular</Badge>
                        <div className="mb-6">
                          <h3 className="text-xl mb-2">{pkg.name}</h3>
                          <div className="text-3xl mb-1">{(pkg.price / 1000).toFixed(0)}K <span className="text-lg font-normal">VND</span></div>
                          <p className="text-sm text-gray-600">/{pkg.duration_days} days</p>
                        </div>
                        <ul className="space-y-3 mb-6">
                          {pkg.features && pkg.features.length > 0 ? (
                            pkg.features.filter(f => f.trim()).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-blue-600" />
                                {feature}
                              </li>
                            ))
                          ) : pkg.description ? (
                            pkg.description.split('\n').filter(f => f.trim()).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-blue-600" />
                                {feature}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No features listed</li>
                          )}
                        </ul>
                        {userPlan === 'premium' ? (
                          <Badge className="w-full justify-center py-2 bg-gradient-to-r from-violet-500 to-purple-600">Active Subscription</Badge>
                        ) : (
                          <Button onClick={() => handleUpgradeClick(pkg)} className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700">Upgrade Now</Button>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 border-2 border-blue-600 relative">
                      <Badge className="absolute top-4 right-4">Popular</Badge>
                      <div className="mb-6">
                        <h3 className="text-xl mb-2">Premium Plan</h3>
                        <div className="text-3xl mb-1">199K <span className="text-lg font-normal">VND</span></div>
                        <p className="text-sm text-gray-600">/30 days</p>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {[
                          'Advanced CV analysis with AI',
                          'Unlimited AI coaching',
                          'Priority job matching',
                          'Exclusive courses & content',
                          'Mock interview sessions',
                          'Resume templates',
                          'Direct recruiter messages',
                          'Priority support'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-blue-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" onClick={() => handleUpgradeClick({ package_id: 0, name: 'Premium', price: 199000, duration_days: 30, description: '', features: [] })}>Upgrade Now</Button>
                    </Card>
                  )}
                </div>

                <Card className="p-6 mt-6">
                  <h3 className="text-xl mb-4">Why Upgrade?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: '⚡', title: 'AI-Powered', desc: 'Get unlimited access to advanced AI features' },
                      { icon: '🎯', title: 'Better Matches', desc: 'Priority in job recommendations and matching' },
                      { icon: '🚀', title: 'Career Growth', desc: 'Exclusive content and direct recruiter access' }
                    ].map((benefit, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                        <div className="text-3xl mb-2">{benefit.icon}</div>
                        <h4 className="mb-1">{benefit.title}</h4>
                        <p className="text-sm text-gray-600">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6 text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl mb-1">{profile.full_name || 'Your Name'}</h3>
              <p className="text-sm text-gray-600 mb-3">Candidate</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                {userPlan === 'premium' ? (
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-600">Premium</Badge>
                ) : (
                  <Badge>Free Plan</Badge>
                )}
                <Badge variant="outline">Level 5</Badge>
              </div>
              <Button variant="outline" className="w-full mb-2">Upload Photo</Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => onNavigate('cv-analyzer')}>
                <Download className="w-4 h-4" />
                Download CV
              </Button>
            </Card>

            {/* Profile Completion */}


            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{profile.email || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{profile.phone || 'Not set'}</span>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Jobs Applied</span>
                  </div>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Courses Completed</span>
                  </div>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Badges Earned</span>
                  </div>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closePaymentModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Upgrade to {selectedPackage.name}</h2>
              <p className="opacity-90">{(selectedPackage.price / 1000).toFixed(0)}K VND / {selectedPackage.duration_days} days</p>
            </div>

            <div className="p-6">
              {paymentStep === 'select' && (
                <>
                  <h3 className="font-medium mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setPaymentMethod('card'); setPaymentStep('input'); }}
                      className="w-full p-4 border-2 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, MasterCard, JCB</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setPaymentMethod('bank'); setPaymentStep('input'); }}
                      className="w-full p-4 border-2 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-gray-500">VietComBank, BIDV, Techcombank</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setPaymentMethod('momo'); setPaymentStep('input'); }}
                      className="w-full p-4 border-2 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">M</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">MoMo Wallet</p>
                        <p className="text-sm text-gray-500">Quick and easy payment</p>
                      </div>
                    </button>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={closePaymentModal}>Cancel</Button>
                </>
              )}

              {paymentStep === 'input' && (
                <>
                  <h3 className="font-medium mb-4">
                    {paymentMethod === 'card' ? 'Card Information' : paymentMethod === 'bank' ? 'Bank Transfer' : 'MoMo Payment'}
                  </h3>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="4242 4242 4242 4242" className="font-mono" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input placeholder="123" type="password" />
                        </div>
                      </div>
                      <div>
                        <Label>Cardholder Name</Label>
                        <Input placeholder="NGUYEN VAN A" />
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'bank' && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <p className="text-sm"><strong>Bank:</strong> VietComBank</p>
                      <p className="text-sm"><strong>Account:</strong> 1234567890</p>
                      <p className="text-sm"><strong>Name:</strong> CAREERMATE JSC</p>
                      <p className="text-sm"><strong>Amount:</strong> {(selectedPackage.price).toLocaleString()} VND</p>
                      <p className="text-sm"><strong>Content:</strong> CM{profile.email?.split('@')[0] || 'USER'}</p>
                    </div>
                  )}
                  {paymentMethod === 'momo' && (
                    <div className="text-center p-6 bg-pink-50 rounded-xl">
                      <div className="w-32 h-32 bg-white mx-auto rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-4xl">📱</span>
                      </div>
                      <p className="text-sm text-gray-600">Open MoMo app and scan QR code</p>
                      <p className="text-xs text-gray-500 mt-2">Or transfer to: 0987654321</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setPaymentStep('select')}>Back</Button>
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600" onClick={handlePayment}>
                      Pay {(selectedPackage.price / 1000).toFixed(0)}K VND
                    </Button>
                  </div>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="w-16 h-16 animate-spin text-violet-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Processing Payment...</h3>
                  <p className="text-gray-500">Please wait, do not close this window</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">You are now a Premium member</p>
                  <div className="p-4 bg-violet-50 rounded-xl text-left space-y-2">
                    <p className="text-sm"><strong>Package:</strong> {selectedPackage.name}</p>
                    {subscriptionInfo && (
                      <>
                        <p className="text-sm"><strong>Valid until:</strong> {new Date(subscriptionInfo.end_date).toLocaleDateString()}</p>
                      </>
                    )}
                  </div>
                  <Button className="w-full mt-6 bg-gradient-to-r from-violet-600 to-purple-600" onClick={closePaymentModal}>
                    Start Using Premium
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
