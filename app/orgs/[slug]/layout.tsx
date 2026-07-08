"use client";

import { OrganizationSwitcher, useOrganization, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Briefcase,
  Building2,
  Search,
  Bell,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

function getPageTitle(pathname: string, slug: string): string {
  const base = `/orgs/${slug}`;
  if (pathname === base || pathname === base + "/") return "Dashboard";
  if (pathname.startsWith(base + "/members")) return "Members";
  if (pathname.startsWith(base + "/settings")) return "Settings";
  if (pathname.startsWith(base + "/billing")) return "Billing";
  return "Organization";
}

export default function OrgLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { orgSlug, isLoaded } = useAuth();
  const { organization } = useOrganization();
  const company = useQuery(api.companies.getMyCompany);

  useEffect(() => {
    if (isLoaded && orgSlug && orgSlug !== params.slug) {
      router.replace(`/orgs/${orgSlug}/dashboard`);
    }
  }, [isLoaded, orgSlug, params.slug, router]);

  const slug = params.slug as string;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin size-8 border-[3px] border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pageTitle = getPageTitle(pathname, slug);

  const isActive = (href: string) => {
    const full = href === "" ? `/orgs/${slug}` : `/orgs/${slug}${href}`;
    const current = pathname.split("?")[0];
    if (href === "") return current === `/orgs/${slug}` || current === `/orgs/${slug}/`;
    return current.startsWith(full);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-4 text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Briefcase className="size-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
              Job Reels
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={
                          <Link
                            href={
                              item.href === ""
                                ? `/orgs/${slug}`
                                : `/orgs/${slug}${item.href}`
                            }
                          />
                        }
                        className={`text-sm ${active ? "font-medium" : "text-sidebar-foreground/70"}`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "size-7" } }}
            />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
              <span className="text-xs font-medium truncate text-sidebar-foreground">
                {organization?.name ?? "Account"}
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 truncate">
                {company?.name ?? "Organization"}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm min-w-[200px]">
            <Search className="size-3.5" />
            <span className="text-xs">Search jobs...</span>
          </div>
          <button
            type="button"
            className="relative size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-600 animate-pulse-glow" />
          </button>
          <div className="flex items-center pl-2 border-l border-border">
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/orgs/:slug/dashboard"
              afterSelectOrganizationUrl="/orgs/:slug/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-auto",
                  organizationSwitcherTrigger:
                    "px-2 py-1 rounded-lg hover:bg-muted transition-colors text-sm text-foreground",
                },
              }}
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
