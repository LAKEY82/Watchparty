"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start hosting watch parties in seconds."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jordan Lee"
            icon={<User className="h-4 w-4" />}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            icon={<Lock className="h-4 w-4" />}
            required
            minLength={8}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="pointer-events-auto text-muted hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-accent"
          />
          I agree to the{" "}
          <a href="#" className="text-foreground hover:text-accent">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-foreground hover:text-accent">
            Privacy Policy
          </a>
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>

        <div className="relative py-2 text-center text-xs text-muted">
          <span className="relative bg-transparent px-2">or continue with</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" className="w-full">
            Google
          </Button>
          <Button type="button" variant="secondary" className="w-full">
            Discord
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:text-accent">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
