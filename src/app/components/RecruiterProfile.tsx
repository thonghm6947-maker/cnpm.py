import { useState } from 'react';
import { RecruiterNavigation } from './RecruiterNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { User, Building2, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff, Camera, Save, CheckCircle, CreditCard } from 'lucide-react';
import type { Page } from '../App';

interface RecruiterProfileProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

const initialProfile = {
    name: 'Nguyễn Văn Recruiter',
    email: 'recruiter@techcorp.vn',
    phone: '0901234567',
    company: 'Tech Corp Vietnam',
    position: 'HR Manager',
    location: 'Hồ Chí Minh, Việt Nam',
    website: 'https://techcorp.vn',
    bio: 'Chuyên viên tuyển dụng với hơn 5 năm kinh nghiệm trong lĩnh vực công nghệ. Đam mê kết nối những tài năng xuất sắc với các cơ hội việc làm phù hợp.',
    avatar: ''
};

export function RecruiterProfile({ onNavigate, onLogout }: RecruiterProfileProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [editedProfile, setEditedProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveProfile = () => {
        setProfile(editedProfile);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
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
                    <h1 className="text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản của bạn</p>
                </div>

                {saveSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Cập nhật thành công!</span>
                    </div>
                )}

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border">
                        <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Thông tin cá nhân</TabsTrigger>
                        <TabsTrigger value="security" className="gap-2"><Lock className="w-4 h-4" />Bảo mật</TabsTrigger>
                        <TabsTrigger value="premium" className="gap-2"><CreditCard className="w-4 h-4" />Premium</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <div className="relative inline-block mb-4">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                                            {profile.name.charAt(0)}
                                        </div>
                                        {isEditing && (
                                            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border hover:bg-slate-50 cursor-pointer">
                                                <Camera className="w-4 h-4 text-slate-600" />
                                            </button>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                                    <p className="text-slate-500">{profile.position}</p>
                                    <p className="text-sm text-blue-600 mt-1">{profile.company}</p>

                                    <div className="mt-6 space-y-3 text-left">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">{profile.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{profile.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{profile.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Globe className="w-4 h-4" />
                                            <a href={profile.website} className="text-sm text-blue-600 hover:underline">{profile.website}</a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Edit Form */}
                            <Card className="col-span-2 border-0 shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-500" />
                                        Chỉnh sửa thông tin
                                    </CardTitle>
                                    {!isEditing ? (
                                        <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">Chỉnh sửa</Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={handleCancelEdit}>Hủy</Button>
                                            <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-blue-500 to-blue-600"><Save className="w-4 h-4 mr-2" />Lưu thay đổi</Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                                            <Input value={isEditing ? editedProfile.name : profile.name} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email</label>
                                            <Input type="email" value={isEditing ? editedProfile.email : profile.email} onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })} disabled={!isEditing} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                                            <Input value={isEditing ? editedProfile.phone : profile.phone} onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Chức vụ</label>
                                            <Input value={isEditing ? editedProfile.position : profile.position} onChange={(e) => setEditedProfile({ ...editedProfile, position: e.target.value })} disabled={!isEditing} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Công ty</label>
                                            <Input value={isEditing ? editedProfile.company : profile.company} onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                                            <Input value={isEditing ? editedProfile.location : profile.location} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} disabled={!isEditing} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Website</label>
                                        <Input value={isEditing ? editedProfile.website : profile.website} onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Giới thiệu</label>
                                        <Textarea value={isEditing ? editedProfile.bio : profile.bio} onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })} disabled={!isEditing} rows={4} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card className="border-0 shadow-lg max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-blue-500" />Đổi mật khẩu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-500">Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự.</p>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <Input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Nhập mật khẩu hiện tại" />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                                    <div className="relative">
                                        <Input type={showNewPassword ? 'text' : 'password'} value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="Nhập mật khẩu mới" />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                                    <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Nhập lại mật khẩu mới" />
                                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                        <p className="text-sm text-red-500">Mật khẩu xác nhận không khớp</p>
                                    )}
                                </div>

                                <Button onClick={handleChangePassword} disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 6} className="bg-gradient-to-r from-blue-500 to-blue-600">
                                    <Lock className="w-4 h-4 mr-2" />Cập nhật mật khẩu
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="premium">
                        <Card className="p-6 bg-blue-600 text-white mb-6 border-0">
                            <h2 className="text-2xl font-bold mb-2">Nâng cấp tài khoản Recruiter</h2>
                            <p className="opacity-90">Mở khóa tính năng cao cấp để tuyển dụng hiệu quả hơn</p>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-3xl mx-auto">
                            <Card className="p-6 border-0 shadow-lg">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-2">Free</h3>
                                    <div className="text-3xl font-bold mb-1">0 VNĐ</div>
                                    <p className="text-sm text-slate-500">Miễn phí mãi mãi</p>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Đăng 3 tin tuyển dụng/tháng',
                                        'Xem 20 hồ sơ ứng viên/tháng',
                                        'Lọc ứng viên cơ bản',
                                        'Hỗ trợ qua email'
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Badge variant="outline" className="w-full justify-center">Gói hiện tại</Badge>
                            </Card>

                            <Card className="p-6 border-2 border-blue-600 relative shadow-lg">
                                <Badge className="absolute top-4 right-4 bg-blue-600">Phổ biến</Badge>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-2">Premium</h3>
                                    <div className="text-3xl font-bold mb-1">499K VNĐ</div>
                                    <p className="text-sm text-slate-500">mỗi tháng</p>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Đăng không giới hạn tin',
                                        'Xem không giới hạn hồ sơ',
                                        'AI Match Score ứng viên',
                                        'Ưu tiên hiển thị tin',
                                        'Lọc ứng viên nâng cao',
                                        'Hỗ trợ ưu tiên 24/7',
                                        'Báo cáo analytics'
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">Nâng cấp ngay</Button>
                            </Card>
                        </div>

                        <Card className="p-6 border-0 shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Tại sao nên nâng cấp?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: '🎯', title: 'AI Matching', desc: 'Tìm ứng viên phù hợp nhất với AI' },
                                    { icon: '⚡', title: 'Ưu tiên hiển thị', desc: 'Tin tuyển dụng được xem nhiều hơn 5x' },
                                    { icon: '📊', title: 'Analytics', desc: 'Báo cáo chi tiết về hiệu quả tuyển dụng' }
                                ].map((benefit, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-lg text-center">
                                        <div className="text-3xl mb-2">{benefit.icon}</div>
                                        <h4 className="font-semibold mb-1">{benefit.title}</h4>
                                        <p className="text-sm text-slate-600">{benefit.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
