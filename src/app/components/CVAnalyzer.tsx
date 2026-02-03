import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Sparkles,
  Target,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import type { Page } from '../App';
import { aiAPI } from '../../services/api';

interface CVAnalyzerProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface AnalysisResult {
  // Fields from API response
  ats_score: number;
  strengths: string[];
  missing_skills: string[];
  feedback: string;
  recommendations: string[];
  // Mapped fields for display
  skills?: string[];
  experience_years?: number;
  education?: string[];
  weaknesses?: string[];
  match_score?: number;
}

interface ImprovementResult {
  target_role: string;
  suggestions: string;
}

export function CVAnalyzer({ onNavigate, onLogout }: CVAnalyzerProps) {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For text files, read directly
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }

    // For PDF and DOCX, use backend API
    if (file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx')) {
      try {
        const response = await aiAPI.extractTextFromFile(file);
        if (response.success && response.data?.text) {
          return response.data.text;
        } else {
          throw new Error(response.error || 'Failed to extract text from file');
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to extract text from file');
      }
    }

    throw new Error('Unsupported file format');
  };

  const handleFileUpload = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Please upload a PDF, DOCX, DOC, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      setCvText(text);
    } catch (err) {
      setError('Failed to extract text from file. Please try pasting your CV content manually.');
      console.error('File extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setCvText('');
  };

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV content');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setImprovementResult(null);

    try {
      const response = await aiAPI.analyzeCV(
        cvText,
        jobDescription || null,
        targetRole || null
      );

      // Debug: log response to see what data we receive
      console.log('[CV-ANALYZE] Response:', response);
      console.log('[CV-ANALYZE] Data:', response.data);

      if (response.success) {
        setAnalysisResult(response.data);
      } else {
        setError(response.message || 'Failed to analyze CV');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('CV Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImproveCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV content first');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please specify a target role for improvement suggestions');
      return;
    }

    setIsImproving(true);
    setError(null);

    try {
      const response = await aiAPI.improveCV(cvText, targetRole);

      if (response.success) {
        setImprovementResult(response.data);
      } else {
        setError(response.message || 'Failed to get improvement suggestions');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('CV Improvement error:', err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleReset = () => {
    setCvText('');
    setJobDescription('');
    setTargetRole('');
    setAnalysisResult(null);
    setImprovementResult(null);
    setError(null);
  };

  const calculateOverallScore = () => {
    if (!analysisResult) return 0;
    // Use ats_score from API, fallback to match_score if exists
    return analysisResult.ats_score || analysisResult.match_score || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="cv-analyzer" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900 font-bold">AI CV Analyzer</h1>
          <p className="text-gray-600">Paste your CV and get instant AI-powered feedback</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {!analysisResult ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* File Upload Section */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Your CV
              </h2>

              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${isDragging
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => document.getElementById('cv-file-input')?.click()}
                >
                  <input
                    id="cv-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center gap-4">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all
                      ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                      <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>

                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {isDragging ? 'Drop your CV here' : 'Drag and drop your CV file'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or <span className="text-blue-600 hover:underline">click to browse</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    {isExtracting ? (
                      <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {isExtracting ? 'Extracting content...' : 'File uploaded successfully'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeUploadedFile}
                    className="text-green-700 hover:text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">or paste your CV text below</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </Card>

            {/* CV Input Section */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Your CV Content
              </h2>
              <Textarea
                placeholder="Paste your CV content here... (e.g., your resume text, skills, experience, education)"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="min-h-[250px] mb-4"
              />
              <p className="text-sm text-gray-500">
                {cvText.length} characters • Tip: Include your skills, experience, and education for best results
              </p>
            </Card>

            {/* Optional Fields */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 font-semibold">Optional: Target Matching</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                  <Input
                    placeholder="e.g., Senior Frontend Developer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste job description for matching analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 px-8"
                onClick={handleAnalyzeCV}
                disabled={isAnalyzing || !cvText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze My CV
                  </>
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <Card className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                  <p className="text-gray-600">AI is analyzing your CV...</p>
                  <Progress value={66} className="h-2 w-48" />
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              </Card>
            )}

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Instant Analysis</h3>
                <p className="text-sm text-gray-600">Get results in under 5 seconds</p>
              </Card>
              <Card className="p-4">
                <Sparkles className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">AI-Powered</h3>
                <p className="text-sm text-gray-600">Powered by Google Gemini</p>
              </Card>
              <Card className="p-4">
                <Target className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Actionable Tips</h3>
                <p className="text-sm text-gray-600">Personalized improvements</p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2 font-bold">Overall CV Score</h2>
                  <p className="opacity-90">
                    {calculateOverallScore() >= 80
                      ? 'Your CV is performing excellently!'
                      : calculateOverallScore() >= 60
                        ? 'Your CV is performing well with room for improvement'
                        : 'Your CV needs some improvements to stand out'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{calculateOverallScore()}</div>
                  <div className="text-lg opacity-90">out of 100</div>
                </div>
              </div>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl mb-4 font-semibold">Skills Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.skills || []).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl mb-4 font-semibold">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">ATS Score</span>
                        <Badge variant={(analysisResult.ats_score || 0) >= 70 ? "default" : "secondary"}>
                          {analysisResult.ats_score || 0}/100
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Strengths</span>
                        <span className="font-medium">{(analysisResult.strengths || []).length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Missing Skills</span>
                        <span className="font-medium text-orange-600">{(analysisResult.missing_skills || []).length}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl mb-4 font-semibold">What You're Doing Well</h3>
                  <div className="space-y-4">
                    {(analysisResult.strengths || []).map((strength, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800">{strength}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="improvements" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl mb-4 font-semibold">Areas for Improvement</h3>
                  <div className="space-y-4">
                    {/* Show feedback first */}
                    {analysisResult.feedback && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <p className="text-blue-800 whitespace-pre-wrap">{analysisResult.feedback}</p>
                      </div>
                    )}
                    {/* Show missing skills as areas for improvement */}
                    {(analysisResult.missing_skills || []).map((skill, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-orange-800">Missing Skill: {skill}</p>
                      </div>
                    ))}
                  </div>

                  {/* Improve CV Section */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Get Improvement Suggestions</h4>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Target role for improvements..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleImproveCV}
                        disabled={isImproving || !targetRole.trim()}
                      >
                        {isImproving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Get Suggestions'
                        )}
                      </Button>
                    </div>
                    {improvementResult && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <h5 className="font-medium mb-2">Suggestions for {improvementResult.target_role}:</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{improvementResult.suggestions}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl mb-4 font-semibold">AI Recommendations</h3>
                    <div className="space-y-4">
                      {(analysisResult.recommendations || []).map((rec, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-gray-700">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl mb-4 font-semibold">Suggested Actions</h3>
                    <div className="space-y-3">
                      <div
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors"
                        onClick={() => onNavigate('career-coach')}
                      >
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Get Career Coaching</h4>
                          <p className="text-xs text-gray-500">Discuss with AI coach</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>

                      <div
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors"
                        onClick={() => onNavigate('jobs')}
                      >
                        <Target className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Find Matching Jobs</h4>
                          <p className="text-xs text-gray-500">Based on your profile</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      </div>

                      <div
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-600 cursor-pointer transition-colors"
                        onClick={() => onNavigate('learning')}
                      >
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Learn Missing Skills</h4>
                          <p className="text-xs text-gray-500">Close skill gaps</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Analyze Another CV
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
