import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  PlayCircle, 
  Award,
  Clock,
  Users,
  Star,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LearningHubProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function LearningHub({ onNavigate, onLogout }: LearningHubProps) {
  const courses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      instructor: 'Sarah Johnson',
      duration: '12 hours',
      students: '15,234',
      rating: 4.8,
      progress: 65,
      level: 'Intermediate',
      category: 'Frontend',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      instructor: 'Michael Chen',
      duration: '8 hours',
      students: '22,145',
      rating: 4.9,
      progress: 0,
      level: 'Beginner',
      category: 'Programming',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'System Design for Interviews',
      instructor: 'Alex Rivera',
      duration: '16 hours',
      students: '18,921',
      rating: 4.7,
      progress: 30,
      level: 'Advanced',
      category: 'System Design',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'Node.js & Express Mastery',
      instructor: 'David Park',
      duration: '14 hours',
      students: '12,456',
      rating: 4.6,
      progress: 0,
      level: 'Intermediate',
      category: 'Backend',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop'
    }
  ];

  const roadmaps = [
    {
      title: 'Frontend Developer',
      steps: 7,
      completed: 4,
      duration: '6 months',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript']
    },
    {
      title: 'Full Stack Developer',
      steps: 12,
      completed: 5,
      duration: '12 months',
      skills: ['Frontend', 'Backend', 'Database', 'DevOps']
    },
    {
      title: 'React Specialist',
      steps: 5,
      completed: 3,
      duration: '3 months',
      skills: ['React', 'Redux', 'Testing', 'Performance']
    }
  ];

  const achievements = [
    { icon: '🏆', title: 'Course Completionist', desc: 'Completed 3 courses', earned: true },
    { icon: '⚡', title: 'Fast Learner', desc: 'Finish a course in 1 week', earned: true },
    { icon: '🎯', title: 'Specialist', desc: 'Complete a learning path', earned: false },
    { icon: '🌟', title: 'Master', desc: 'Complete 10 advanced courses', earned: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="learning" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Learning Hub</h1>
          <p className="text-gray-600">Curated courses and roadmaps to advance your career</p>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Courses List */}
              <div className="lg:col-span-2 space-y-6">
                {/* In Progress */}
                <div>
                  <h2 className="text-xl mb-4">Continue Learning</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.filter(c => c.progress > 0).map((course) => (
                      <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <ImageWithFallback
                          src={course.image}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <Badge className="mb-2">{course.level}</Badge>
                          <h3 className="mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                          
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {course.rating}
                            </div>
                          </div>

                          <Button className="w-full gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Continue
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Recommended Courses */}
                <div>
                  <h2 className="text-xl mb-4">Recommended for You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.filter(c => c.progress === 0).map((course) => (
                      <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <ImageWithFallback
                          src={course.image}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <Badge className="mb-2">{course.level}</Badge>
                          <h3 className="mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.students}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {course.rating}
                            </div>
                          </div>

                          <Button className="w-full" variant="outline">
                            Start Learning
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Learning Stats */}
                <Card className="p-6">
                  <h3 className="mb-4">Your Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Courses Enrolled</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Completed</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">Hours Learned</span>
                      <span className="font-medium">42</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm">Certificates</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </Card>

                {/* Skill Progress */}
                <Card className="p-6">
                  <h3 className="mb-4">Skill Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">React.js</span>
                        <span className="text-sm text-gray-500">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">TypeScript</span>
                        <span className="text-sm text-gray-500">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Node.js</span>
                        <span className="text-sm text-gray-500">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">System Design</span>
                        <span className="text-sm text-gray-500">25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                </Card>

                {/* Learning Streak */}
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-8 h-8" />
                    <div>
                      <div className="text-2xl">7 Days</div>
                      <div className="text-sm opacity-90">Learning Streak 🔥</div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">
                    Keep it up! You're building a consistent learning habit.
                  </p>
                </Card>

                {/* Recommended Actions */}
                <Card className="p-6">
                  <h3 className="mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Award className="w-4 h-4" />
                      View Certificates
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Target className="w-4 h-4" />
                      Set Learning Goals
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Track Progress
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmaps">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roadmaps.map((roadmap, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-1">{roadmap.title}</h3>
                      <p className="text-sm text-gray-600">{roadmap.duration} learning path</p>
                    </div>
                    <Badge variant="secondary">
                      {roadmap.completed}/{roadmap.steps} steps
                    </Badge>
                  </div>

                  <Progress value={(roadmap.completed / roadmap.steps) * 100} className="h-2 mb-4" />

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Array.from({ length: roadmap.steps }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {idx < roadmap.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        )}
                        <span className="text-sm">
                          {idx < roadmap.completed ? 'Completed' : 'Upcoming'} - Step {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full">
                    {roadmap.completed > 0 ? 'Continue Learning' : 'Start Roadmap'}
                  </Button>
                </Card>
              ))}

              <Card className="p-6 bg-blue-600 text-white">
                <h3 className="text-xl mb-3">Create Custom Roadmap</h3>
                <p className="mb-4 opacity-90">
                  Let our AI create a personalized learning roadmap based on your career goals and current skills.
                </p>
                <Button variant="secondary" onClick={() => onNavigate('career-coach')}>
                  Get AI Recommendations
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl mb-4">Your Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card 
                      key={index} 
                      className={`p-6 ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                          : 'opacity-50'
                      }`}
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.desc}</p>
                      {achievement.earned ? (
                        <Badge className="bg-green-600">Earned</Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </Card>
                  ))}
                </div>

                <Card className="p-6 mt-6">
                  <h3 className="text-xl mb-4">Leaderboard</h3>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: 'Emma Wilson', points: 2850, avatar: '👩‍💻' },
                      { rank: 2, name: 'You (Alex)', points: 2340, avatar: '👨‍💻' },
                      { rank: 3, name: 'James Chen', points: 2120, avatar: '👨‍💼' },
                      { rank: 4, name: 'Sarah Johnson', points: 1980, avatar: '👩‍🎓' },
                      { rank: 5, name: 'Mike Rodriguez', points: 1850, avatar: '👨‍🔬' }
                    ].map((user) => (
                      <div 
                        key={user.rank} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          user.name.includes('You') ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.rank === 1 ? 'bg-yellow-400' :
                          user.rank === 2 ? 'bg-gray-300' :
                          user.rank === 3 ? 'bg-orange-400' : 'bg-gray-200'
                        }`}>
                          {user.rank}
                        </div>
                        <div className="text-2xl">{user.avatar}</div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.points} points</div>
                        </div>
                        {user.rank === 1 && <Award className="w-5 h-5 text-yellow-600" />}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl mb-1">2,340</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl mb-1">8</div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl mb-1">#2</div>
                      <div className="text-sm text-gray-600">Global Rank</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-blue-600 text-white">
                  <h3 className="mb-3">Next Achievement</h3>
                  <div className="text-4xl mb-2">🎯</div>
                  <h4 className="mb-2">Specialist Badge</h4>
                  <p className="text-sm opacity-90 mb-3">
                    Complete a full learning path to unlock this achievement
                  </p>
                  <Progress value={60} className="h-2 bg-white/30 mb-2" />
                  <p className="text-sm">60% complete</p>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
