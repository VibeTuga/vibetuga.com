import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Clock,
  Rocket,
  Mail,
  ShoppingBag,
  Shield,
  Flag,
  ActivitySquare,
  Trophy,
  Heart,
  Tag,
  RotateCcw,
  Library,
  Calendar,
  BarChart3,
  ToggleRight,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface AdminLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, exact: true },
  { href: "/admin/blog/pending", label: "Pendentes", icon: Clock },
  { href: "/admin/showcase", label: "Showcase", icon: Rocket },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/challenges", label: "Desafios", icon: Trophy },
  { href: "/admin/contributors", label: "Contribuidores", icon: Heart },
  { href: "/admin/events", label: "Eventos", icon: Calendar },
  { href: "/admin/streams", label: "Streams", icon: Video },
  { href: "/admin/analytics", label: "Analíticas", icon: BarChart3 },
  { href: "/admin/store", label: "Loja", icon: ShoppingBag },
  { href: "/admin/collections", label: "Coleções", icon: Library },
  { href: "/admin/coupons", label: "Cupões", icon: Tag },
  { href: "/admin/refunds", label: "Reembolsos", icon: RotateCcw },
  { href: "/admin/role-requests", label: "Pedidos de Role", icon: Shield },
  { href: "/admin/reports", label: "Denúncias", icon: Flag },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: ToggleRight },
  { href: "/admin/audit-log", label: "Auditoria", icon: ActivitySquare },
  { href: "/admin/categories", label: "Categorias", icon: FolderOpen },
  { href: "/admin/users", label: "Utilizadores", icon: Users },
];
