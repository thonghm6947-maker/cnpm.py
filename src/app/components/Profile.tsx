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
  Globe
} from 'lucide-react';
import type { Page } from '../App';

interface ProfileProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Profile({ onNavigate, onLogout }: ProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Personal Information</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="ng van" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="A" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="ngvana@email.com" />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue="+84 123 456 983" />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" defaultValue="Go Vap, tphcm" />
                    </div>

                    <div>
                      <Label htmlFor="bio">Professional Summary</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md"
                        defaultValue="Recent Computer Science graduate with a passion for frontend development. Experienced in React, TypeScript, and modern web technologies. Looking for entry-level positions to kickstart my career."
                      />
                    </div>

                    <div className="pt-4">
                      <Button>Save Changes</Button>
                    </div>
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

              <TabsContent value="experience" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Education</h2>
                    <Button variant="outline" size="sm">Add Education</Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">Bachelor of Computer Science</h3>
                          <p className="text-sm text-gray-600">University of California</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <p className="text-sm text-gray-500">2020 - 2024 • GPA: 3.8/4.0</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Work Experience</h2>
                    <Button variant="outline" size="sm">Add Experience</Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">Frontend Developer Intern</h3>
                          <p className="text-sm text-gray-600">TechStartup Inc.</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Jun 2023 - Dec 2023 • 6 months</p>
                      <p className="text-sm text-gray-600">
                        Developed responsive web applications using React and TypeScript. 
                        Collaborated with design team to implement UI/UX improvements.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Skills</h2>
                    <Button variant="outline" size="sm">Manage Skills</Button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'React.js', level: 85 },
                      { name: 'JavaScript', level: 90 },
                      { name: 'TypeScript', level: 65 },
                      { name: 'CSS/SCSS', level: 80 },
                      { name: 'Git', level: 75 },
                      { name: 'Node.js', level: 50 }
                    ].map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{skill.name}</span>
                          <span className="text-sm text-gray-500">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">Certifications</h2>
                    <Button variant="outline" size="sm">Add Certificate</Button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'React Developer Certification', issuer: 'Udemy', date: 'Dec 2023' },
                      { name: 'JavaScript Algorithms & Data Structures', issuer: 'freeCodeCamp', date: 'Aug 2023' },
                      { name: 'Responsive Web Design', issuer: 'freeCodeCamp', date: 'Jun 2023' }
                    ].map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="text-sm font-medium">{cert.name}</h4>
                            <p className="text-xs text-gray-500">{cert.issuer} • {cert.date}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
                <Card className="p-6 bg-blue-600 text-white mb-6">
                  <h2 className="text-2xl mb-2">Upgrade to Premium</h2>
                  <p className="opacity-90">Unlock advanced AI features and accelerate your career growth</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="mb-6">
                      <h3 className="text-xl mb-2">Free Plan</h3>
                      <div className="text-3xl mb-1">$0</div>
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
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Badge variant="outline">Current Plan</Badge>
                  </Card>

                  <Card className="p-6 border-2 border-blue-600 relative">
                    <Badge className="absolute top-4 right-4">Popular</Badge>
                    <div className="mb-6">
                      <h3 className="text-xl mb-2">Premium Plan</h3>
                      <div className="text-3xl mb-1">$19</div>
                      <p className="text-sm text-gray-600">per month</p>
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
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">Upgrade Now</Button>
                  </Card>
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
              <h3 className="text-xl mb-1">ng van a</h3>
              <p className="text-sm text-gray-600 mb-3">Frontend Developer</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge>Free Plan</Badge>
                <Badge variant="outline">Level 5</Badge>
              </div>
              <Button variant="outline" className="w-full mb-2">Upload Photo</Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => onNavigate('cv-analyzer')}>
                <Download className="w-4 h-4" />
                Download CV
              </Button>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6">
              <h3 className="mb-4">Profile Completion</h3>
              <div className="mb-3">
                <Progress value={75} className="h-2" />
              </div>
              <p className="text-sm text-gray-600 mb-4">75% complete - Almost there!</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Add work experience</span>
                  <Badge variant="outline" className="text-xs">+10%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Add skills assessment</span>
                  <Badge variant="outline" className="text-xs">+15%</Badge>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>ngvana@email.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>+84 123 456 983</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Go Vap, tphcm</span>
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
    </div>
  );
}
