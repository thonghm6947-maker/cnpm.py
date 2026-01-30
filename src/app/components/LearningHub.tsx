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
  PlayCircle
} from 'lucide-react';
import type { Page } from '../App';


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
    </div>
  );
}
