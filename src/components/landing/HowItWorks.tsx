import { Link2, PlaySquare, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your room",
    description: "Name your room and set who can join — pick the movie once you're inside.",
  },
  {
    icon: Link2,
    step: "02",
    title: "Invite your friends",
    description: "Share a link or room code — they hop in from any device, no account needed.",
  },
  {
    icon: PlaySquare,
    step: "03",
    title: "Press play together",
    description: "Everyone's player syncs automatically. Chat, react, and enjoy the show.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Up and running in under a minute
        </h2>
      </div>

      <div className="relative grid gap-8 sm:grid-cols-3">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-black/10 to-transparent sm:block" />
        {steps.map((step) => (
          <div key={step.step} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-background-elevated shadow-lg shadow-black/10">
              <step.icon className="h-6 w-6 text-accent" />
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {step.step}
              </span>
            </div>
            <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
            <p className="max-w-xs text-sm text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
