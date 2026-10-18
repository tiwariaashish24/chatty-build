import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, LockKeyhole, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const success = await signup(formData);
      if (success) navigate('/chat');
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
            <span className="auth-eyebrow"><Sparkles size={15} /> A little closer, every day</span>
            <h2>Make room<br />for good talks.</h2>
            <p>Bring your favorite people together in a space that feels like yours. The best conversations start here.</p>
          </div>

          <div className="auth-feature-list">
            <div><span><Check size={15} /></span> Create a space for your people</div>
            <div><span><Check size={15} /></span> Share moments as they happen</div>
            <div><span><Check size={15} /></span> Join the conversation in seconds</div>
          </div>

          <div className="auth-showcase-footer">Good conversations have a place.</div>
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
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">Create your account</CardTitle>
              <CardDescription className="text-base">
                A welcoming space for the people you care about.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Use at least 6 characters.</p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Sign Up'}
                {!loading && <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="auth-secure-note">
              <LockKeyhole size={14} />
              <span>Your details are protected and never public</span>
            </div>

            <p className="auth-switch-copy">
              Already have an account?{' '}
              <Link to="/login" className="auth-text-link">Log in</Link>
            </p>
          </CardContent>
        </Card>

        <p className="auth-legal">By creating an account, you agree to keep conversations kind and respectful.</p>
      </section>
    </main>
  );
};

export default Signup;
