import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardCheck,
  FileText,
  Landmark,
  LayoutDashboard,
  Search,
  Sparkles,
} from "lucide-react";
import type { Role } from "@/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[] | "public";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { href: "/registry", label: "Registry", icon: Search, roles: "public" },
      {
        href: "/opportunities",
        label: "Opportunities",
        icon: Sparkles,
        roles: ["SUPPLIER", "CONTRACTOR", "PROGRAMME", "ADMIN"],
      },
    ],
  },
  {
    label: "Deliver",
    items: [
      {
        href: "/console",
        label: "Console",
        icon: LayoutDashboard,
        roles: ["SUPPLIER", "CONTRACTOR", "ADMIN"],
      },
      {
        href: "/console/contracts",
        label: "Contracts",
        icon: FileText,
        roles: ["SUPPLIER", "CONTRACTOR", "ADMIN"],
      },
      {
        href: "/review",
        label: "Review",
        icon: ClipboardCheck,
        roles: ["REVIEWER", "PROGRAMME", "ADMIN"],
      },
    ],
  },
  {
    label: "Grow",
    items: [
      {
        href: "/finance",
        label: "Finance",
        icon: Landmark,
        roles: ["SUPPLIER", "CONTRACTOR", "FINANCIER", "ADMIN"],
      },
      {
        href: "/intelligence",
        label: "Intelligence",
        icon: Building2,
        roles: ["PROGRAMME", "ADMIN", "FINANCIER"],
      },
    ],
  },
];

export function isNavVisible(item: NavItem, role: Role): boolean {
  if (!item.roles || item.roles === "public") return true;
  return item.roles.includes(role);
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/registry") {
    return pathname === "/registry" || pathname.startsWith("/registry/");
  }
  if (href === "/console") {
    return pathname === "/console" || pathname === "/console/claims" || pathname.startsWith("/console/claims/");
  }
  if (href === "/console/contracts") {
    return pathname.startsWith("/console/contracts");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
