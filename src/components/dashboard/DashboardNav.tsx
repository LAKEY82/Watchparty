"use client";

import { useState } from "react";
import { Bell, LogOut, Search, Settings, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import type { ApiUser } from "@/types";

export function DashboardNav({
  user,
  onLogout,
}: {
  user: ApiUser | null;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden max-w-md flex-1 sm:block">
          <Input placeholder="Search rooms or friends…" icon={<Search className="h-4 w-4" />} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-white/10"
            >
              <Avatar
                name={user?.name || "Guest"}
                color={user?.avatarColor || "from-violet-500 to-fuchsia-500"}
                size="sm"
              />
            </button>

            {menuOpen && (
              <div className="glass-strong absolute right-0 top-12 w-52 rounded-xl p-1.5 animate-fade-in-up">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{user?.name || "Guest"}</p>
                  <p className="truncate text-xs text-muted">{user?.email || ""}</p>
                </div>
                <div className="my-1 h-px bg-white/10" />
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground">
                  <UserIcon className="h-4 w-4" /> Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
