import { Clock3, MessageCircle, MonitorPlay, ShieldCheck, Users, Video } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const features = [
  {
    icon: Clock3,
    title: "Millisecond sync",
    description:
      "Play, pause, and seek are mirrored instantly across every viewer — no more counting down to press play.",
  },
  {
    icon: MessageCircle,
    title: "Live reactions & chat",
    description:
      "React in real time with a chat sidebar built for movie night — emojis, replies, and timestamped messages.",
  },
  {
    icon: Video,
    title: "Voice & video",
    description:
      "Flip on your mic or camera to see and hear your friends' reactions without leaving the player.",
  },
  {
    icon: MonitorPlay,
    title: "Any source, one room",
    description:
      "Upload your own file and Watchly keeps everyone in the room perfectly in sync.",
  },
  {
    icon: Users,
    title: "Up to 50 guests",
    description:
      "From a cozy duo to a full watch club, invite everyone with a single shareable link or room code.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Rooms are locked to invited guests only, with host controls to mute, remove, or lock the room anytime.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Why Watchly
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need for the perfect movie night
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <GlassPanel
            key={feature.title}
            className="group p-6 opacity-0 animate-fade-in-up transition-transform duration-300 hover:-translate-y-1 hover:bg-black/[0.07]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent transition-transform group-hover:scale-110">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
