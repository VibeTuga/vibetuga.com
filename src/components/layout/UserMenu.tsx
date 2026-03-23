"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogOut, PenLine, Shield, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";

export interface SessionUser {
  id?: string | null;
  name?: string | null;
  image?: string | null;
  role: "admin" | "moderator" | "author" | "seller" | "member";
  discordUsername: string;
}

const ROLE_STYLES: Record<SessionUser["role"], { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  moderator: {
    label: "Moderador",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  author: { label: "Autor", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  seller: { label: "Vendedor", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  member: { label: "Membro", className: "bg-primary/20 text-primary border-primary/30" },
};

function UserAvatar({ user }: { user: SessionUser }) {
  const initials = (user.discordUsername || user.name || "?").slice(0, 2).toUpperCase();

  return user.image ? (
    <Image
      src={user.image}
      alt={user.discordUsername || "Avatar"}
      width={32}
      height={32}
      className="size-8 rounded-full ring-2 ring-primary/60"
    />
  ) : (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/60 text-xs font-bold text-primary">
      {initials}
    </div>
  );
}

export function UserMenu({ user }: { user: SessionUser }) {
  const roleStyle = ROLE_STYLES[user.role];
  const isStaff = user.role === "admin" || user.role === "moderator";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="cursor-pointer rounded-full transition-shadow hover:shadow-[0_0_12px_rgba(161,255,194,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Menu do utilizador"
        >
          <UserAvatar user={user} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="flex flex-col gap-1.5 px-3 py-2.5">
          <span className="text-sm font-semibold text-white truncate">
            {user.discordUsername || user.name}
          </span>
          <span
            className={`inline-flex w-fit items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleStyle.className}`}
          >
            {roleStyle.label}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {user.id && (
          <DropdownMenuItem
            asChild
            className="cursor-pointer px-3 py-2 text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
          >
            <Link href={`/profile/${user.id}`}>
              <User className="size-4" />
              Meu Perfil
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          asChild
          className="cursor-pointer px-3 py-2 text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
        >
          <Link href="/dashboard/profile">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer px-3 py-2 text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
        >
          <Link href="/dashboard/submit-post">
            <PenLine className="size-4" />
            Submeter Post
          </Link>
        </DropdownMenuItem>
        {isStaff && (
          <DropdownMenuItem
            asChild
            className="cursor-pointer px-3 py-2 text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
          >
            <Link href="/admin">
              <Shield className="size-4" />
              Painel Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="cursor-pointer px-3 py-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
          onSelect={() => {
            signOutAction();
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileUserMenu({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate: () => void;
}) {
  const roleStyle = ROLE_STYLES[user.role];
  const isStaff = user.role === "admin" || user.role === "moderator";

  return (
    <div className="space-y-1 border-t border-white/10 pt-3 mt-2">
      <div className="flex items-center gap-3 px-1 pb-2">
        <UserAvatar user={user} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white truncate">
            {user.discordUsername || user.name}
          </span>
          <span
            className={`inline-flex w-fit items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleStyle.className}`}
          >
            {roleStyle.label}
          </span>
        </div>
      </div>
      {user.id && (
        <Link
          href={`/profile/${user.id}`}
          onClick={onNavigate}
          className="flex items-center gap-2 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <User className="size-4" />
          Meu Perfil
        </Link>
      )}
      <Link
        href="/dashboard/profile"
        onClick={onNavigate}
        className="flex items-center gap-2 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/submit-post"
        onClick={onNavigate}
        className="flex items-center gap-2 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
      >
        <PenLine className="size-4" />
        Submeter Post
      </Link>
      {isStaff && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <Shield className="size-4" />
          Painel Admin
        </Link>
      )}
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center gap-2 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
