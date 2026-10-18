import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, LockKeyhole, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData);
      if (success) {
        navigate(location.state?.from?.pathname || '/chat', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <aside className="auth-showcase">
        <div className="auth-showcase-content">
          <Link to="/" className="auth-brand" aria-label="Chatty home">
            <span className="auth-brand-icon"><MessageCircle aria-hidden="true" /></span>
            <span>chatty<span className="auth-brand-period">.</span></span>
          </Link>

          <div className="auth-showcase-copy">
            <span className="auth-eyebrow"><Sparkles size={15} /> A calmer way to connect</span>
            <h2>Your people.<br />Your conversations.</h2>
            <p>Thoughtful conversations, all in one place. Catch up with your people and pick up right where you left off.</p>
          </div>

          <div className="auth-feature-list">
            <div><span><Check size={15} /></span> Private, secure conversations</div>
            <div><span><Check size={15} /></span> Spaces for every group</div>
            <div><span><Check size={15} /></span> Stay close, wherever you are</div>
          </div>

          <div className="auth-showcase-footer">Made for the conversations that matter.</div>
        </div>
      </aside>

      <section className="auth-form-panel">
        <Link to="/" className="auth-brand auth-mobile-brand" aria-label="Chatty home">
          <span className="auth-brand-icon"><MessageCircle aria-hidden="true" /></span>
          <span>chatty<span className="auth-brand-period">.</span></span>
        </Link>

        <Card className="auth-card">
          <CardHeader className="space-y-2 px-0 pb-2">
            <div className="auth-form-icon"><MessageCircle aria-hidden="true" /></div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to pick up where your conversations left off.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-muted-foreground">At least 6 characters</span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Log In'}
                {!loading && <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="auth-secure-note">
              <LockKeyhole size={14} />
              <span>Your conversations stay private and secure</span>
            </div>

            <p className="auth-switch-copy">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="auth-text-link">Sign up</Link>
            </p>
          </CardContent>
        </Card>

        <p className="auth-legal">By continuing, you agree to keep conversations kind and respectful.</p>
      </section>
    </main>
  );
};

export default Login;
