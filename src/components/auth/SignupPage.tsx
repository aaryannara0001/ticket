import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    Lock,
    Mail,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<
        'developer' | 'support' | 'it' | 'manager' | 'admin' | 'client'
    >('developer');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [_registrationSuccess, setRegistrationSuccess] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);

    const { register, verifyEmail, resendOTP } = useAuthStore();
    const isAuthenticated = useAuthStore((state) => !!state.user);
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/dashboard');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!register) {
            setError('Registration is currently unavailable');
            setLoading(false);
            return;
        }

        const success = await register(name, email, password, role);

        if (success) {
            setRegistrationSuccess(true);
            setShowOtpInput(true);
        } else {
            setError(
                'Registration failed. Please check your details and try again.',
            );
        }

        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const success = await verifyEmail(email, otp);

        if (success) {
            setVerificationSuccess(true);
        } else {
            setError('Invalid OTP. Please check and try again.');
        }

        setLoading(false);
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        const success = await resendOTP(email);

        if (success) {
            setError(''); // Clear any previous errors
            // You could show a success message here if needed
        } else {
            setError('Failed to resend OTP. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-card border-border shadow-2xl">
                    <CardHeader className="text-center pb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                        >
                            <User className="w-8 h-8 text-primary-foreground" />
                        </motion.div>
                        <CardTitle className="text-2xl text-foreground font-bold">
                            Create an Account
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 font-medium">
                            Sign up to access TicketFlow
                        </p>
                    </CardHeader>

                    <CardContent>
                        {verificationSuccess ? (
                            <div className="text-center space-y-4">
                                <Alert className="bg-green-50 border-green-200 shadow-sm">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700 font-medium">
                                        Email verified successfully! You can now
                                        login to your account.
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        ) : showOtpInput ? (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <Shield className="w-12 h-12 text-primary mx-auto" />
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Verify Your Email
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        We've sent an OTP to{' '}
                                        <strong>{email}</strong>. Please enter
                                        it below to verify your account.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <Alert className="bg-destructive/20 border-destructive/50 shadow-sm">
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                            <AlertDescription className="text-destructive font-medium">
                                                {error}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="otp"
                                            className="text-foreground font-medium"
                                        >
                                            Enter OTP
                                        </Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) =>
                                                setOtp(e.target.value)
                                            }
                                            className="text-center text-lg font-mono tracking-widest"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? 'Verifying...'
                                            : 'Verify Email'}
                                    </Button>
                                </form>

                                <div className="text-center">
                                    <p className="text-muted-foreground text-sm mb-2">
                                        Didn't receive the OTP?
                                    </p>
                                    <Button
                                        variant="ghost"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-primary hover:text-primary/80 font-medium"
                                    >
                                        {loading ? 'Sending...' : 'Resend OTP'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <Alert className="bg-destructive/20 border-destructive/50 shadow-sm">
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                        <AlertDescription className="text-destructive font-medium">
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-foreground font-medium"
                                    >
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Your full name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-foreground font-medium"
                                    >
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-foreground font-medium"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="role"
                                        className="text-foreground font-medium"
                                    >
                                        Role
                                    </Label>
                                    <Select
                                        onValueChange={(v) => setRole(v as any)}
                                        defaultValue={role}
                                    >
                                        <SelectTrigger
                                            id="role"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Admin role cannot be self-assigned via signup */}
                                            {/* Admins must be created by an existing admin in the Admin panel */}
                                            <SelectItem value="manager">
                                                Manager
                                            </SelectItem>
                                            <SelectItem value="developer">
                                                Developer
                                            </SelectItem>
                                            <SelectItem value="support">
                                                Support
                                            </SelectItem>
                                            <SelectItem value="it">
                                                IT
                                            </SelectItem>
                                            <SelectItem value="client">
                                                Client
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Creating account...'
                                        : 'Sign Up'}
                                </Button>
                            </form>
                        )}

                        {!showOtpInput && !verificationSuccess && (
                            <div className="mt-6 text-center text-sm text-muted-foreground font-medium">
                                By signing up you agree to the Terms of Service.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
