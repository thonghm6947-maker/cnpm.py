import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  Award,
  CheckCircle2,
  Brain,
  Timer,
  Trophy,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  PlayCircle,
  X,
  ExternalLink,
  Square,
  CheckSquare,
  Loader2,
  Map
} from 'lucide-react';
import type { Page } from '../App';
import { aiAPI } from '../../services/api';


interface LearningHubProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

// Quiz types
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: number;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  bestScore: number | null;
  attempts: number;
  icon: string;
}

interface QuizResult {
  score: number;
  total: number;
  answers: { questionId: number; selectedAnswer: number; isCorrect: boolean }[];
  timeTaken: number;
}

// Roadmap types
interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  resourceUrl?: string;
  subtopics: { name: string; completed: boolean }[];
}

interface DetailedRoadmap {
  id: number;
  title: string;
  duration: string;
  skills: string[];
  steps: RoadmapStep[];
}

export function LearningHub({ onNavigate, onLogout }: LearningHubProps) {
  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(0);

  // Roadmap modal state
  const [selectedRoadmap, setSelectedRoadmap] = useState<DetailedRoadmap | null>(null);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);

  // Roadmap data state
  const [detailedRoadmaps, setDetailedRoadmaps] = useState<DetailedRoadmap[]>([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Quiz data
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: 'React Fundamentals',
      category: 'Frontend',
      level: 'Beginner',
      timeLimit: 10,
      bestScore: 85,
      attempts: 3,
      icon: '⚛️',
      questions: [
        {
          id: 1,
          question: 'What is the correct way to create a React component?',
          options: [
            'function MyComponent() { return <div>Hello</div>; }',
            'class MyComponent { render() { return <div>Hello</div>; } }',
            'const MyComponent = <div>Hello</div>;',
            'new Component(MyComponent);'
          ],
          correctAnswer: 0,
          explanation: 'Function components are the modern and recommended way to create React components.'
        },
        {
          id: 2,
          question: 'Which hook is used for side effects in React?',
          options: ['useState', 'useContext', 'useEffect', 'useMemo'],
          correctAnswer: 2,
          explanation: 'useEffect is specifically designed to handle side effects like data fetching, subscriptions, and DOM manipulation.'
        },
        {
          id: 3,
          question: 'What does the useState hook return?',
          options: [
            'A single value',
            'An array with value and setter function',
            'An object with value property',
            'A promise'
          ],
          correctAnswer: 1,
          explanation: 'useState returns an array with two elements: the current state value and a function to update it.'
        },
        {
          id: 4,
          question: 'How do you pass data from parent to child component?',
          options: ['Using state', 'Using props', 'Using context only', 'Using localStorage'],
          correctAnswer: 1,
          explanation: 'Props (properties) are the primary way to pass data from parent to child components in React.'
        },
        {
          id: 5,
          question: 'What is JSX?',
          options: [
            'A JavaScript library',
            'A syntax extension for JavaScript',
            'A CSS framework',
            'A testing tool'
          ],
          correctAnswer: 1,
          explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript files.'
        }
      ]
    },
    {
      id: 2,
      title: 'TypeScript Essentials',
      category: 'Programming',
      level: 'Intermediate',
      timeLimit: 15,
      bestScore: null,
      attempts: 0,
      icon: '📘',
      questions: [
        {
          id: 1,
          question: 'What is the main benefit of using TypeScript over JavaScript?',
          options: [
            'Faster runtime performance',
            'Static type checking',
            'Smaller bundle size',
            'Better browser support'
          ],
          correctAnswer: 1,
          explanation: 'TypeScript provides static type checking which helps catch errors at compile time rather than runtime.'
        },
        {
          id: 2,
          question: 'How do you define an interface in TypeScript?',
          options: [
            'type Person = { name: string }',
            'interface Person { name: string }',
            'class Person { name: string }',
            'Both A and B are valid'
          ],
          correctAnswer: 3,
          explanation: 'Both type aliases and interfaces can be used to define object shapes in TypeScript.'
        },
        {
          id: 3,
          question: 'What does the "?" symbol mean in TypeScript type definitions?',
          options: [
            'Required property',
            'Optional property',
            'Nullable property',
            'Readonly property'
          ],
          correctAnswer: 1,
          explanation: 'The "?" symbol indicates that a property is optional and may be undefined.'
        },
        {
          id: 4,
          question: 'Which TypeScript feature allows you to specify multiple possible types?',
          options: ['Generics', 'Union types', 'Enums', 'Decorators'],
          correctAnswer: 1,
          explanation: 'Union types (using | operator) allow a value to be one of several types.'
        },
        {
          id: 5,
          question: 'What is the purpose of generics in TypeScript?',
          options: [
            'To make code run faster',
            'To create reusable components with type safety',
            'To reduce bundle size',
            'To improve debugging'
          ],
          correctAnswer: 1,
          explanation: 'Generics allow you to create reusable components that work with multiple types while maintaining type safety.'
        }
      ]
    },
    {
      id: 3,
      title: 'System Design Basics',
      category: 'System Design',
      level: 'Advanced',
      timeLimit: 20,
      bestScore: 70,
      attempts: 2,
      icon: '🏗️',
      questions: [
        {
          id: 1,
          question: 'What is horizontal scaling?',
          options: [
            'Adding more CPU to a server',
            'Adding more servers to handle load',
            'Adding more RAM to a server',
            'Adding more storage to a server'
          ],
          correctAnswer: 1,
          explanation: 'Horizontal scaling (scaling out) means adding more servers to distribute the load.'
        },
        {
          id: 2,
          question: 'What is the purpose of a load balancer?',
          options: [
            'To store data',
            'To distribute traffic across servers',
            'To encrypt data',
            'To compress data'
          ],
          correctAnswer: 1,
          explanation: 'A load balancer distributes incoming traffic across multiple servers to ensure no single server is overwhelmed.'
        },
        {
          id: 3,
          question: 'What does CAP theorem state?',
          options: [
            'You can have all three: Consistency, Availability, Partition tolerance',
            'You can only pick two of: Consistency, Availability, Partition tolerance',
            'You must prioritize Consistency over Availability',
            'Partition tolerance is optional'
          ],
          correctAnswer: 1,
          explanation: 'CAP theorem states that in a distributed system, you can only guarantee two of the three properties.'
        },
        {
          id: 4,
          question: 'What is caching used for?',
          options: [
            'Permanent data storage',
            'Temporarily storing frequently accessed data',
            'Encrypting sensitive data',
            'Backing up data'
          ],
          correctAnswer: 1,
          explanation: 'Caching stores frequently accessed data in memory for faster retrieval, reducing database load.'
        },
        {
          id: 5,
          question: 'What is a microservices architecture?',
          options: [
            'A monolithic application',
            'Small, independent services that communicate over a network',
            'A single database for all services',
            'A frontend framework'
          ],
          correctAnswer: 1,
          explanation: 'Microservices architecture breaks down an application into small, independent services that can be deployed separately.'
        }
      ]
    },
    {
      id: 4,
      title: 'Node.js Fundamentals',
      category: 'Backend',
      level: 'Intermediate',
      timeLimit: 12,
      bestScore: null,
      attempts: 0,
      icon: '🟢',
      questions: [
        {
          id: 1,
          question: 'What is Node.js?',
          options: [
            'A frontend framework',
            'A JavaScript runtime built on Chrome\'s V8 engine',
            'A database',
            'A CSS preprocessor'
          ],
          correctAnswer: 1,
          explanation: 'Node.js is a JavaScript runtime that allows you to run JavaScript on the server side.'
        },
        {
          id: 2,
          question: 'What is npm?',
          options: [
            'Node Package Manager',
            'New Programming Method',
            'Network Protocol Manager',
            'Node Process Monitor'
          ],
          correctAnswer: 0,
          explanation: 'npm (Node Package Manager) is the default package manager for Node.js.'
        },
        {
          id: 3,
          question: 'What is the event loop in Node.js?',
          options: [
            'A type of for loop',
            'A mechanism that handles asynchronous operations',
            'A debugging tool',
            'A testing framework'
          ],
          correctAnswer: 1,
          explanation: 'The event loop is what allows Node.js to perform non-blocking I/O operations.'
        },
        {
          id: 4,
          question: 'Which module is used to create a web server in Node.js?',
          options: ['fs', 'http', 'path', 'os'],
          correctAnswer: 1,
          explanation: 'The http module provides functionality to create HTTP servers and make HTTP requests.'
        },
        {
          id: 5,
          question: 'What does "require()" do in Node.js?',
          options: [
            'Creates a new file',
            'Imports a module',
            'Exports a module',
            'Deletes a file'
          ],
          correctAnswer: 1,
          explanation: 'require() is used to import modules, JSON files, or local files in Node.js.'
        }
      ]
    },
    {
      id: 5,
      title: 'CSS & Styling',
      category: 'Frontend',
      level: 'Beginner',
      timeLimit: 8,
      bestScore: 100,
      attempts: 1,
      icon: '🎨',
      questions: [
        {
          id: 1,
          question: 'What does CSS stand for?',
          options: [
            'Computer Style Sheets',
            'Cascading Style Sheets',
            'Creative Style Sheets',
            'Colorful Style Sheets'
          ],
          correctAnswer: 1,
          explanation: 'CSS stands for Cascading Style Sheets, which is used to style HTML elements.'
        },
        {
          id: 2,
          question: 'Which property is used to change the background color?',
          options: ['color', 'bgcolor', 'background-color', 'bg-color'],
          correctAnswer: 2,
          explanation: 'The background-color property is used to set the background color of an element.'
        },
        {
          id: 3,
          question: 'What is Flexbox used for?',
          options: [
            'Adding animations',
            'Creating flexible layouts',
            'Styling text',
            'Adding shadows'
          ],
          correctAnswer: 1,
          explanation: 'Flexbox is a CSS layout model that makes it easy to design flexible and responsive layouts.'
        },
        {
          id: 4,
          question: 'Which CSS property controls the text size?',
          options: ['text-size', 'font-size', 'text-style', 'font-style'],
          correctAnswer: 1,
          explanation: 'font-size is used to set the size of the text.'
        },
        {
          id: 5,
          question: 'What is the default display value of a <div> element?',
          options: ['inline', 'block', 'inline-block', 'flex'],
          correctAnswer: 1,
          explanation: 'By default, <div> elements have display: block, meaning they take up the full width available.'
        }
      ]
    },
    {
      id: 6,
      title: 'Git & Version Control',
      category: 'DevOps',
      level: 'Beginner',
      timeLimit: 10,
      bestScore: 80,
      attempts: 2,
      icon: '🔀',
      questions: [
        {
          id: 1,
          question: 'What command initializes a new Git repository?',
          options: ['git start', 'git init', 'git create', 'git new'],
          correctAnswer: 1,
          explanation: 'git init creates a new Git repository in the current directory.'
        },
        {
          id: 2,
          question: 'What does "git clone" do?',
          options: [
            'Creates a new branch',
            'Copies a remote repository to local machine',
            'Deletes a repository',
            'Merges two branches'
          ],
          correctAnswer: 1,
          explanation: 'git clone creates a copy of an existing Git repository from a remote source.'
        },
        {
          id: 3,
          question: 'What is a commit in Git?',
          options: [
            'A snapshot of your repository',
            'A branch name',
            'A remote server',
            'A merge conflict'
          ],
          correctAnswer: 0,
          explanation: 'A commit is a snapshot of your repository at a specific point in time.'
        },
        {
          id: 4,
          question: 'Which command stages changes for commit?',
          options: ['git commit', 'git add', 'git push', 'git stage'],
          correctAnswer: 1,
          explanation: 'git add stages changes, preparing them to be included in the next commit.'
        },
        {
          id: 5,
          question: 'What is a pull request?',
          options: [
            'A request to download code',
            'A request to merge changes into a branch',
            'A request for help',
            'A request to delete a branch'
          ],
          correctAnswer: 1,
          explanation: 'A pull request is a way to propose changes and request that someone review and merge them.'
        }
      ]
    }
  ]);


  // Fetch AI-generated roadmaps from API
  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    setIsLoadingRoadmaps(true);
    setRoadmapError(null);
    try {
      const response = await aiAPI.getRoadmaps();

      if (response.success && response.data) {
        // Transform API roadmaps to DetailedRoadmap format
        const transformed: DetailedRoadmap[] = response.data.map((roadmap: any) => {
          // Handle phases - might be string (JSON) or array
          let phases = roadmap.phases;
          if (typeof phases === 'string') {
            try {
              phases = JSON.parse(phases);
            } catch {
              console.error('Failed to parse phases:', phases);
              phases = [];
            }
          }
          phases = phases || [];

          return {
            id: roadmap.roadmap_id,
            title: roadmap.target_role,
            duration: roadmap.estimated_duration || '3-6 months',
            skills: phases.flatMap((phase: any) => phase.skills_to_learn || []).slice(0, 4) || [],
            steps: phases.map((phase: any, index: number) => ({
              id: phase.phase || index + 1,
              title: phase.title || `Phase ${index + 1}`,
              description: `Phase ${phase.phase || index + 1}: ${phase.title || 'Learning Phase'}. Duration: ${phase.duration || 'TBD'}`,
              completed: false,
              resourceUrl: phase.resources?.[0] || undefined,
              subtopics: (phase.skills_to_learn || []).map((skill: string) => ({
                name: skill,
                completed: false
              }))
            }))
          };
        });

        setDetailedRoadmaps(transformed);
      }
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      setRoadmapError('Failed to load roadmaps. Create one in Career Roadmap.');
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  // Simple roadmaps for card display
  const roadmaps = detailedRoadmaps.map(r => ({
    title: r.title,
    steps: r.steps.length,
    completed: r.steps.filter(s => s.completed).length,
    duration: r.duration,
    skills: r.skills
  }));

  const achievements = [
    { icon: '🏆', title: 'Course Completionist', desc: 'Completed 3 courses', earned: true },
    { icon: '⚡', title: 'Fast Learner', desc: 'Finish a course in 1 week', earned: true },
    { icon: '🎯', title: 'Specialist', desc: 'Complete a learning path', earned: false },
    { icon: '🌟', title: 'Master', desc: 'Complete 10 advanced courses', earned: false }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQuizModalOpen && !showResults && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQuizModalOpen, showResults, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(quiz.timeLimit * 60);
    setQuizResult(null);
    setShowResults(false);
    setQuizStartTime(Date.now());
    setIsQuizModalOpen(true);
  };

  const handleSubmitQuiz = useCallback(() => {
    if (!selectedQuiz) return;

    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    const answers = selectedQuiz.questions.map(q => {
      const selectedAnswer = selectedAnswers[q.id] ?? -1;
      return {
        questionId: q.id,
        selectedAnswer,
        isCorrect: selectedAnswer === q.correctAnswer
      };
    });

    const correctCount = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / selectedQuiz.questions.length) * 100);

    setQuizResult({
      score,
      total: selectedQuiz.questions.length,
      answers,
      timeTaken
    });

    // Update quiz with new score
    setQuizzes(prev => prev.map(q => {
      if (q.id === selectedQuiz.id) {
        return {
          ...q,
          attempts: q.attempts + 1,
          bestScore: q.bestScore === null ? score : Math.max(q.bestScore, score)
        };
      }
      return q;
    }));

    setShowResults(true);
  }, [selectedQuiz, selectedAnswers, quizStartTime]);

  const handleNextQuestion = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
    setSelectedQuiz(null);
    setShowResults(false);
    setQuizResult(null);
  };

  const retakeQuiz = () => {
    if (selectedQuiz) {
      startQuiz(selectedQuiz);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="learning" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Learning Hub</h1>
          <p className="text-gray-600">Curated courses and roadmaps to advance your career</p>
        </div>

        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quiz List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-600" />
                    Practice Quizzes
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {quizzes.length} quizzes available
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="p-5 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{quiz.icon}</div>
                        <Badge className={getLevelColor(quiz.level)}>
                          {quiz.level}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4">{quiz.category}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          {quiz.questions.length} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {quiz.timeLimit} min
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm">
                          <span className="text-gray-500">Best Score: </span>
                          {quiz.bestScore !== null ? (
                            <span className={`font-semibold ${getScoreColor(quiz.bestScore)}`}>
                              {quiz.bestScore}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Not attempted</span>
                          )}
                        </div>
                        {quiz.attempts > 0 && (
                          <span className="text-xs text-gray-500">
                            {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <Button
                        className="w-full gap-2 group-hover:bg-blue-600 transition-colors"
                        onClick={() => startQuiz(quiz)}
                      >
                        <PlayCircle className="w-4 h-4" />
                        {quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quiz Stats Sidebar */}
              <div className="space-y-6">
                {/* Overall Stats */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Quiz Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Total Quizzes</span>
                      <span className="font-semibold">{quizzes.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Completed</span>
                      <span className="font-semibold">
                        {quizzes.filter(q => q.attempts > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">Average Score</span>
                      <span className="font-semibold">
                        {quizzes.filter(q => q.bestScore !== null).length > 0
                          ? Math.round(
                            quizzes
                              .filter(q => q.bestScore !== null)
                              .reduce((acc, q) => acc + (q.bestScore || 0), 0) /
                            quizzes.filter(q => q.bestScore !== null).length
                          ) + '%'
                          : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm">Perfect Scores</span>
                      <span className="font-semibold">
                        {quizzes.filter(q => q.bestScore === 100).length}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {quizzes
                      .filter(q => q.attempts > 0)
                      .slice(0, 4)
                      .map(quiz => (
                        <div key={quiz.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="text-xl">{quiz.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{quiz.title}</p>
                            <p className="text-xs text-gray-500">
                              Score: <span className={getScoreColor(quiz.bestScore || 0)}>{quiz.bestScore}%</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    {quizzes.filter(q => q.attempts > 0).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No quizzes completed yet. Start practicing!
                      </p>
                    )}
                  </div>
                </Card>

                {/* Tips Card */}
                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
                  <p className="text-sm opacity-90">
                    Take quizzes regularly to reinforce your learning. Aim for at least 80% accuracy before moving to the next topic!
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmaps">
            {isLoadingRoadmaps ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading your roadmaps...</p>
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Map className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Roadmaps Yet</h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  {roadmapError || "Create a personalized AI-powered career roadmap to start your learning journey."}
                </p>
                <Button onClick={() => onNavigate('career-roadmap')} className="gap-2">
                  <Map className="w-4 h-4" />
                  Create Career Roadmap
                </Button>
              </div>
            ) : (
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

                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {Array.from({ length: Math.min(roadmap.steps, 6) }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {idx < roadmap.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <span className="text-sm">
                            {idx < roadmap.completed ? 'Completed' : 'Upcoming'} - Phase {idx + 1}
                          </span>
                        </div>
                      ))}
                      {roadmap.steps > 6 && (
                        <p className="text-xs text-gray-500 pl-6">+{roadmap.steps - 6} more phases...</p>
                      )}
                    </div>

                    <Button className="w-full" onClick={() => {
                      const detailed = detailedRoadmaps.find(r => r.title === roadmap.title);
                      if (detailed) {
                        setSelectedRoadmap(detailed);
                        setSelectedStep(detailed.steps.find(s => !s.completed) || detailed.steps[0]);
                        setIsRoadmapModalOpen(true);
                      }
                    }}>
                      {roadmap.completed > 0 ? 'Continue Learning' : 'Start Roadmap'}
                    </Button>
                  </Card>
                ))}

                <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  <h3 className="text-xl font-semibold mb-3">Create New Roadmap</h3>
                  <p className="mb-4 opacity-90">
                    Let our AI create a personalized learning roadmap based on your career goals and current skills.
                  </p>
                  <Button variant="secondary" onClick={() => onNavigate('career-roadmap')}>
                    <Map className="w-4 h-4 mr-2" />
                    Create Roadmap
                  </Button>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl mb-4">Your Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={index}
                      className={`p-6 ${achievement.earned
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
                        className={`flex items-center gap-3 p-3 rounded-lg ${user.name.includes('You') ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.rank === 1 ? 'bg-yellow-400' :
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

      {/* Quiz Modal */}
      <Dialog open={isQuizModalOpen} onOpenChange={closeQuizModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedQuiz && !showResults ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedQuiz.icon}</span>
                    {selectedQuiz.title}
                  </DialogTitle>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm font-semibold ${timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    <Timer className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </DialogHeader>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100)}%</span>
                </div>
                <Progress
                  value={((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Question */}
              <div className="py-4">
                <h3 className="text-lg font-medium mb-6">
                  {selectedQuiz.questions[currentQuestionIndex].question}
                </h3>

                <RadioGroup
                  value={selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id]?.toString()}
                  onValueChange={(value) =>
                    handleAnswerSelect(selectedQuiz.questions[currentQuestionIndex].id, parseInt(value))
                  }
                  className="space-y-3"
                >
                  {selectedQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id] === idx
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      onClick={() => handleAnswerSelect(selectedQuiz.questions[currentQuestionIndex].id, idx)}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label
                        htmlFor={`option-${idx}`}
                        className="flex-1 cursor-pointer text-sm leading-relaxed"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question Navigation Dots */}
              <div className="flex items-center justify-center gap-2 py-4">
                {selectedQuiz.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === currentQuestionIndex
                      ? 'bg-blue-600 scale-125'
                      : selectedAnswers[q.id] !== undefined
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }`}
                    title={`Question ${idx + 1}${selectedAnswers[q.id] !== undefined ? ' (answered)' : ''}`}
                  />
                ))}
              </div>

              <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion} className="gap-2">
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          ) : showResults && quizResult && selectedQuiz ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">Quiz Complete!</DialogTitle>
              </DialogHeader>

              <div className="py-6">
                {/* Score Display */}
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(quizResult.score)}`}>
                    {quizResult.score}%
                  </div>
                  <p className="text-gray-600">
                    {quizResult.answers.filter(a => a.isCorrect).length} of {quizResult.total} correct
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Time: {formatTime(quizResult.timeTaken)}
                  </p>

                  {/* Score Badge */}
                  <div className="mt-4">
                    {quizResult.score >= 80 ? (
                      <Badge className="bg-green-600 text-lg px-4 py-1">🎉 Excellent!</Badge>
                    ) : quizResult.score >= 60 ? (
                      <Badge className="bg-yellow-500 text-lg px-4 py-1">👍 Good Job!</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-lg px-4 py-1">📚 Keep Practicing</Badge>
                    )}
                  </div>
                </div>

                {/* Answer Review */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-gray-700 sticky top-0 bg-white pb-2">Answer Review</h4>
                  {selectedQuiz.questions.map((question, idx) => {
                    const answer = quizResult.answers.find(a => a.questionId === question.id);
                    const isCorrect = answer?.isCorrect;
                    const wasAnswered = answer?.selectedAnswer !== -1;

                    return (
                      <div
                        key={question.id}
                        className={`p-3 rounded-lg border ${isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Q{idx + 1}: {question.question}</p>
                            {!isCorrect && (
                              <p className="text-xs text-gray-600">
                                {wasAnswered ? (
                                  <>Your answer: <span className="text-red-600">{question.options[answer!.selectedAnswer]}</span></>
                                ) : (
                                  <span className="text-gray-500">Not answered</span>
                                )}
                                <br />
                                Correct: <span className="text-green-600">{question.options[question.correctAnswer]}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1 italic">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:justify-center">
                <Button variant="outline" onClick={closeQuizModal} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Quizzes
                </Button>
                <Button onClick={retakeQuiz} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Visual Roadmap Modal */}
      <Dialog open={isRoadmapModalOpen} onOpenChange={setIsRoadmapModalOpen}>
        <DialogContent className="max-w-[98vw] w-[1600px] h-[90vh] p-0 overflow-hidden">
          <div className="flex h-full min-w-0">
            {/* Flowchart Area */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto p-8">
              <DialogHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedRoadmap?.title}</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedRoadmap?.duration} learning path</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsRoadmapModalOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Visual Flowchart - Vertical Timeline */}
              {selectedRoadmap && (
                <div className="relative max-w-2xl mx-auto">
                  {/* Start node */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      START
                    </div>
                    <div className="h-0.5 flex-1 bg-gray-200"></div>
                  </div>

                  {/* Steps - Vertical Layout */}
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 ml-10">
                    {selectedRoadmap.steps.map((step, index) => (
                      <div key={step.id} className="relative">
                        {/* Connection dot */}
                        <div className={`absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow
                          ${step.completed ? 'bg-teal-500' : selectedStep?.id === step.id ? 'bg-amber-400' : 'bg-blue-500'}
                        `}></div>

                        {/* Step Box */}
                        <div
                          onClick={() => setSelectedStep(step)}
                          className={`
                            ml-4 p-4 rounded-xl cursor-pointer
                            transition-all duration-200 shadow-md hover:shadow-lg
                            ${step.completed
                              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                              : selectedStep?.id === step.id
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white ring-2 ring-amber-200'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{step.title}</h4>
                              <p className="text-sm opacity-80 line-clamp-1">{step.description}</p>
                            </div>
                            {step.completed && <CheckCircle className="w-6 h-6" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* End node */}
                  <div className="flex items-center gap-4 mt-4 ml-10 pl-4">
                    <div className="w-20 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      END
                    </div>
                    <div className="h-0.5 flex-1 bg-gray-200"></div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-8 mt-8 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-teal-500"></div>
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                      <span className="text-sm text-gray-600">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-600">Upcoming</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Topic Details Sidebar - Only show when a step is selected */}
            {selectedStep && (
              <div className="w-[380px] min-w-[380px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">Topic Details</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedStep(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{selectedStep.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {selectedStep.description}
                  </p>

                  {selectedStep.resourceUrl && (
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Learning Resources
                      </h4>
                      <a
                        href={selectedStep.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {selectedStep.resourceUrl}
                      </a>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Subtopics</h4>
                    <div className="space-y-2">
                      {selectedStep.subtopics.map((subtopic, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                          {subtopic.completed ? (
                            <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${subtopic.completed ? 'text-gray-600' : 'text-gray-900'}`}>
                            {subtopic.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Continue Learning
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
