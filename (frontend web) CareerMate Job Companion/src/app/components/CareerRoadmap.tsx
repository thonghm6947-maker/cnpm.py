import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
    Map,
    Target,
    Sparkles,
    Clock,
    CheckCircle2,
    Loader2,
    Trash2,
    Plus,
    BookOpen,
    Briefcase,
    ArrowRight,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import type { Page } from '../App';
import { aiAPI } from '../../services/api';

interface CareerRoadmapProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

interface RoadmapPhase {
    phase: number;
    title: string;
    duration: string;
    skills_to_learn: string[];
    resources?: string[];
}

interface Roadmap {
    roadmap_id: number;
    target_role: string;
    phases: RoadmapPhase[];
    created_at?: string;
}

export function CareerRoadmap({ onNavigate, onLogout }: CareerRoadmapProps) {
    const [targetRole, setTargetRole] = useState('');
    const [currentRole, setCurrentRole] = useState('');
    const [currentSkills, setCurrentSkills] = useState('');
    const [timeFrame, setTimeFrame] = useState('12 months');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
    const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);

    useEffect(() => {
        loadRoadmaps();
    }, []);

    const loadRoadmaps = async () => {
        setIsLoadingRoadmaps(true);
        try {
            const response = await aiAPI.getRoadmaps();
            if (response.success) {
                setRoadmaps(response.data || []);
            }
        } catch (err) {
            console.error('Failed to load roadmaps:', err);
        } finally {
            setIsLoadingRoadmaps(false);
        }
    };

    const handleGenerateRoadmap = async () => {
        if (!targetRole.trim()) {
            setError('Please enter your target role');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setActiveRoadmap(null);

        try {
            const skillsArray = currentSkills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const response = await aiAPI.createRoadmap(
                targetRole,
                currentRole || null,
                skillsArray,
                timeFrame
            );

            if (response.success) {
                setActiveRoadmap(response.data);
                loadRoadmaps(); // Refresh list
                setExpandedPhases([1]); // Expand first phase
            } else {
                setError(response.message || 'Failed to generate roadmap');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error('Generate roadmap error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteRoadmap = async (roadmap_id: number) => {
        try {
            const response = await aiAPI.deleteRoadmap(roadmap_id);
            if (response.success) {
                setRoadmaps(prev => prev.filter(r => r.roadmap_id !== roadmap_id));
                if (activeRoadmap?.roadmap_id === roadmap_id) {
                    setActiveRoadmap(null);
                }
            }
        } catch (err) {
            console.error('Failed to delete roadmap:', err);
        }
    };

    const togglePhase = (phase: number) => {
        setExpandedPhases(prev =>
            prev.includes(phase)
                ? prev.filter(p => p !== phase)
                : [...prev, phase]
        );
    };

    const getPhaseColor = (index: number) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
        ];
        return colors[index % colors.length];
    };

    const getProgressPercentage = (phaseIndex: number, totalPhases: number) => {
        return Math.round(((phaseIndex + 1) / totalPhases) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation currentPage="career-roadmap" onNavigate={onNavigate} onLogout={onLogout} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl mb-2 text-gray-900 font-bold flex items-center gap-3">
                        <Map className="w-8 h-8 text-blue-600" />
                        Career Roadmap
                    </h1>
                    <p className="text-gray-600">Create a personalized roadmap to reach your dream career</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-900">×</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Form & Saved Roadmaps */}
                    <div className="space-y-6">
                        {/* Create Roadmap Form */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Create New Roadmap
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Role <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g., Senior Software Engineer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Role (Optional)
                                    </label>
                                    <Input
                                        placeholder="e.g., Junior Developer"
                                        value={currentRole}
                                        onChange={(e) => setCurrentRole(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Skills (Optional)
                                    </label>
                                    <Input
                                        placeholder="e.g., JavaScript, Python, SQL"
                                        value={currentSkills}
                                        onChange={(e) => setCurrentSkills(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time Frame
                                    </label>
                                    <select
                                        value={timeFrame}
                                        onChange={(e) => setTimeFrame(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="3 months">3 months</option>
                                        <option value="6 months">6 months</option>
                                        <option value="12 months">12 months</option>
                                        <option value="18 months">18 months</option>
                                        <option value="24 months">24 months</option>
                                    </select>
                                </div>

                                <Button
                                    onClick={handleGenerateRoadmap}
                                    disabled={isGenerating || !targetRole.trim()}
                                    className="w-full gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating with AI...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Roadmap
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>

                        {/* Saved Roadmaps */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                My Roadmaps
                            </h2>

                            {isLoadingRoadmaps ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                            ) : roadmaps.length > 0 ? (
                                <div className="space-y-3">
                                    {roadmaps.map((roadmap) => (
                                        <div
                                            key={roadmap.roadmap_id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all group ${activeRoadmap?.roadmap_id === roadmap.roadmap_id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => setActiveRoadmap(roadmap)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {roadmap.target_role}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {roadmap.phases?.length || 0} phases
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRoadmap(roadmap.roadmap_id);
                                                    }}
                                                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <Map className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No roadmaps yet</p>
                                    <p className="text-xs">Create your first career roadmap above</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Panel - Roadmap Display */}
                    <div className="lg:col-span-2">
                        {isGenerating ? (
                            <Card className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Generating Your Roadmap...</h3>
                                    <p className="text-gray-600">AI is creating a personalized career path for you</p>
                                    <Progress value={66} className="w-48 h-2" />
                                    <p className="text-sm text-gray-500">This may take a few seconds</p>
                                </div>
                            </Card>
                        ) : activeRoadmap ? (
                            <div className="space-y-6">
                                {/* Roadmap Header */}
                                <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                                                Career Roadmap
                                            </Badge>
                                            <h2 className="text-2xl font-bold mb-1">{activeRoadmap.target_role}</h2>
                                            <p className="opacity-90 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {activeRoadmap.phases?.length || 0} phases to complete
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                                <Target className="w-10 h-10" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Phases Timeline */}
                                <div className="space-y-4">
                                    {activeRoadmap.phases?.map((phase, index) => (
                                        <Card
                                            key={phase.phase}
                                            className={`overflow-hidden transition-all ${expandedPhases.includes(phase.phase) ? '' : ''
                                                }`}
                                        >
                                            {/* Phase Header */}
                                            <div
                                                className={`p-4 bg-gradient-to-r ${getPhaseColor(index)} text-white cursor-pointer`}
                                                onClick={() => togglePhase(phase.phase)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                                            {phase.phase}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{phase.title}</h3>
                                                            <p className="text-sm opacity-90 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {phase.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                                            {getProgressPercentage(index, activeRoadmap.phases.length)}%
                                                        </Badge>
                                                        {expandedPhases.includes(phase.phase) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Phase Content */}
                                            {expandedPhases.includes(phase.phase) && (
                                                <div className="p-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                                        Skills to Learn
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {phase.skills_to_learn.map((skill, skillIndex) => (
                                                            <Badge
                                                                key={skillIndex}
                                                                variant="outline"
                                                                className="px-3 py-1"
                                                            >
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {phase.resources && phase.resources.length > 0 && (
                                                        <>
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                                                Resources
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {phase.resources.map((resource, resIndex) => (
                                                                    <li key={resIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                                                        <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                        {resource}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}

                                                    {index < activeRoadmap.phases.length - 1 && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => togglePhase(activeRoadmap.phases[index + 1].phase)}
                                                                className="text-gray-500"
                                                            >
                                                                Next: {activeRoadmap.phases[index + 1].title}
                                                                <ArrowRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 justify-center">
                                    <Button variant="outline" onClick={() => setActiveRoadmap(null)}>
                                        Create New Roadmap
                                    </Button>
                                    <Button className="gap-2" onClick={() => onNavigate('learning')}>
                                        <BookOpen className="w-4 h-4" />
                                        Start Learning
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Card className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Map className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">No Roadmap Selected</h3>
                                    <p className="text-gray-600 max-w-md">
                                        Create a new roadmap using the form on the left, or select an existing one from your saved roadmaps.
                                    </p>
                                    <div className="flex gap-3 mt-2">
                                        <Button variant="outline" onClick={() => onNavigate('career-coach')}>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Ask Career Coach
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
