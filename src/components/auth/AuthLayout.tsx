import { ReactNode } from "react";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const highlights = [
  "Millisecond-accurate playback sync",
  "Live chat, voice, and video",
  "Up to 50 guests per room",
];

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
      <div className="relative hidden w-1/2 flex-col justify-between bg-accent p-12 lg:flex">
        <Logo variant="light" />

        <div className="max-w-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Watch movies together, in perfect sync.
          </h2>
          <ul className="mt-6 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-sm text-sm text-white/70">
          &ldquo;It genuinely feels like we&apos;re all on the same couch, even
          three time zones apart.&rdquo;
          <span className="mt-1 block text-white">— Sam, weekly movie club host</span>
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
