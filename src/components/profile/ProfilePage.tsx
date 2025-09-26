import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Edit, Mail, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
    });

    const handleSave = () => {
        // TODO: Implement save functionality
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Profile
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                <AvatarImage
                                    src={user?.avatar}
                                    alt={user?.name}
                                />
                                <AvatarFallback className="text-2xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">
                                {user?.name}
                            </CardTitle>
                            <p className="text-muted-foreground">
                                {user?.email}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                                {user?.role || 'User'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Joined{' '}
                                        {new Date(
                                            user?.createdAt || Date.now(),
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Last active: Today</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Personal Information</CardTitle>
                                <Button
                                    variant={
                                        isEditing ? 'destructive' : 'outline'
                                    }
                                    size="sm"
                                    onClick={
                                        isEditing
                                            ? handleCancel
                                            : () => setIsEditing(true)
                                    }
                                >
                                    {isEditing ? (
                                        'Cancel'
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    {isEditing ? (
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span>{user?.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    {isEditing ? (
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span>{user?.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    {isEditing ? (
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {user?.phone || 'Not provided'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    {isEditing ? (
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    location: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {user?.location ||
                                                    'Not provided'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                {isEditing ? (
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself..."
                                        value={formData.bio}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                bio: e.target.value,
                                            })
                                        }
                                        rows={4}
                                    />
                                ) : (
                                    <div className="p-2 border rounded-md bg-muted min-h-[100px]">
                                        {user?.bio || 'No bio provided'}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave}>
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
