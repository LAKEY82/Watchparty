import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function CtaSection() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-4 pb-24">
      <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(139,92,246,0.4), transparent)",
          }}
        />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Your next movie night is one link away
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-muted">
          Free to start. No downloads. Works right in the browser.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="group">
              Create your first room
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              I already have an account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo />
        <p className="text-sm text-muted">© 2026 ReelSync. All rights reserved.</p>
        <div className="flex items-center gap-5 text-sm text-muted">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Support</a>
        </div>
      </div>
    </footer>
  );
}
