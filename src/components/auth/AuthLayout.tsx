import { ReactNode } from "react";
import { Film, MessageSquare, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { avatarColors } from "@/lib/mock-data";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-cinema flex min-h-screen">
      {/* Visual side */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -top-40 -left-20 h-[520px] w-[520px] animate-float rounded-full [background:radial-gradient(closest-side,rgba(139,92,246,0.5),transparent)] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-10 h-[420px] w-[420px] animate-float rounded-full [background:radial-gradient(closest-side,rgba(236,72,153,0.5),transparent)] opacity-30 blur-3xl [animation-delay:1.5s]" />

        <Logo className="relative z-10" />

        <div className="relative z-10 glass-strong rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Film className="h-4 w-4" />
              Now playing · Nocturne Drive
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-danger/15 px-2.5 py-1 text-[11px] font-medium uppercase text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
              Live
            </span>
          </div>

          <div className="mb-4 aspect-video rounded-xl [background:linear-gradient(135deg,rgba(139,92,246,0.5),rgba(236,72,153,0.3)),radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_60%)]" />

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2.5">
              {avatarColors.slice(0, 4).map((c, i) => (
                <Avatar key={i} name={String.fromCharCode(65 + i)} color={c} size="sm" ring />
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> 5
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> 24
              </span>
            </div>
          </div>
        </div>

        <p className="relative z-10 max-w-sm text-sm text-muted">
          &ldquo;It genuinely feels like we&apos;re all on the same couch, even
          three time zones apart.&rdquo;
          <span className="mt-1 block text-foreground">— Sam, weekly movie club host</span>
        </p>
      </div>

      {/* Form side */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
