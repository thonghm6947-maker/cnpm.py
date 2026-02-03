import { useState, useEffect } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { User, Building2, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff, Camera, Save, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { profileAPI } from '../../services/api';
import type { Page } from '../App';

interface RecruiterProfileProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

const emptyProfile = {
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    location: '',
    website: '',
    bio: '',
    avatar: ''
};

export function RecruiterProfile({ onNavigate, onLogout }: RecruiterProfileProps) {
    const [profile, setProfile] = useState(emptyProfile);
    const [editedProfile, setEditedProfile] = useState(emptyProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await profileAPI.getRecruiter();

            if (result.error) {
                setError(result.error);
            } else {
                const profileData = {
                    name: result.full_name || result.name || '',
                    email: result.email || '',
                    phone: result.phone || '',
                    company: result.company_name || result.company || '',
                    position: result.position || result.job_title || '',
                    location: result.location || result.address || '',
                    website: result.website || result.company_website || '',
                    bio: result.bio || result.description || '',
                    avatar: result.avatar || result.avatar_url || ''
                };
                setProfile(profileData);
                setEditedProfile(profileData);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Cannot load profile information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);

            const updateData = {
                full_name: editedProfile.name,
                phone: editedProfile.phone,
                company_name: editedProfile.company,
                position: editedProfile.position,
                location: editedProfile.location,
                website: editedProfile.website,
                bio: editedProfile.bio
            };

            const result = await profileAPI.updateRecruiter(updateData);

            if (result.error) {
                setError(result.error);
            } else {
                setProfile(editedProfile);
                setIsEditing(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Error saving profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleChangePassword = () => {
        if (passwordForm.new === passwordForm.confirm && passwordForm.new.length >= 6) {
            console.log('Password changed successfully');
            setShowPasswordDialog(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <RecruiterNavigation currentPage="recruiter-profile" onNavigate={onNavigate} onLogout={onLogout} newApplicationsCount={23} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your account information</p>
                </div>

                {saveSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Updated successfully!</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-slate-500">Loading profile...</span>
                    </div>
                ) : (

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-white shadow-sm border">
                            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Personal Info</TabsTrigger>
                            <TabsTrigger value="security" className="gap-2"><Lock className="w-4 h-4" />Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Profile Card */}
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="relative inline-block mb-4">
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                                                {profile.name ? profile.name.charAt(0) : 'R'}
                                            </div>
                                            {isEditing && (
                                                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border hover:bg-slate-50 cursor-pointer">
                                                    <Camera className="w-4 h-4 text-slate-600" />
                                                </button>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">{profile.name || 'Not updated'}</h2>
                                        <p className="text-slate-500">{profile.position || 'Not updated'}</p>
                                        <p className="text-sm text-blue-600 mt-1">{profile.company || 'Not updated'}</p>

                                        <div className="mt-6 space-y-3 text-left">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{profile.email || 'Not updated'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{profile.phone || 'Not updated'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">{profile.location || 'Not updated'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Globe className="w-4 h-4" />
                                                {profile.website ? (
                                                    <a href={profile.website} className="text-sm text-blue-600 hover:underline">{profile.website}</a>
                                                ) : (
                                                    <span className="text-sm">Not updated</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Edit Form */}
                                <Card className="col-span-2 border-0 shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-500" />
                                            Edit Profile
                                        </CardTitle>
                                        {!isEditing ? (
                                            <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">Edit</Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
                                                <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-to-r from-blue-500 to-blue-600">
                                                    {saving ? (
                                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                                    ) : (
                                                        <><Save className="w-4 h-4 mr-2" />Save Changes</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                                <Input value={isEditing ? editedProfile.name : profile.name} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Email</label>
                                                <Input type="email" value={isEditing ? editedProfile.email : profile.email} onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                                <Input value={isEditing ? editedProfile.phone : profile.phone} onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Position</label>
                                                <Input value={isEditing ? editedProfile.position : profile.position} onChange={(e) => setEditedProfile({ ...editedProfile, position: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Company</label>
                                                <Input value={isEditing ? editedProfile.company : profile.company} onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Location</label>
                                                <Input value={isEditing ? editedProfile.location : profile.location} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Website</label>
                                            <Input value={isEditing ? editedProfile.website : profile.website} onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Bio</label>
                                            <Textarea value={isEditing ? editedProfile.bio : profile.bio} onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })} disabled={!isEditing} rows={4} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card className="border-0 shadow-lg max-w-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-blue-500" />Change Password</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-500">For security, use a strong password with at least 6 characters.</p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Current Password</label>
                                        <div className="relative">
                                            <Input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Enter current password" />
                                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">New Password</label>
                                        <div className="relative">
                                            <Input type={showNewPassword ? 'text' : 'password'} value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="Enter new password" />
                                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                                        <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm new password" />
                                        {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                            <p className="text-sm text-red-500">Passwords do not match</p>
                                        )}
                                    </div>

                                    <Button onClick={handleChangePassword} disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 6} className="bg-gradient-to-r from-blue-500 to-blue-600">
                                        <Lock className="w-4 h-4 mr-2" />Update Password
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
