"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  FileText,
  Bookmark,
  File,
  Mail,
  Bell,
  MessageSquare,
  User,
  Briefcase,
  Search,
  ArrowUpRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/seeker", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/seeker/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/seeker/saved", label: "Saved Jobs", icon: Bookmark },
  { href: "/dashboard/seeker/resumes", label: "Resumes", icon: File },
  { href: "/dashboard/seeker/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/dashboard/seeker/alerts", label: "Job Alerts", icon: Bell },
  { href: "/dashboard/seeker/career-guidance", label: "Career Chat", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/seeker": "Overview",
  "/dashboard/seeker/applications": "My Applications",
  "/dashboard/seeker/saved": "Saved Jobs",
  "/dashboard/seeker/resumes": "Resumes",
  "/dashboard/seeker/cover-letters": "Cover Letters",
  "/dashboard/seeker/career-guidance": "Career Chat",
  "/dashboard/seeker/alerts": "Job Alerts",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix + "/")) return title;
  }
  return "Dashboard";
}

export default function SeekerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isSignedIn) router.push("/");
  }, [isSignedIn, router]);

  if (!isSignedIn) return null;

  const pageTitle = getPageTitle(pathname);

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
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className={`text-sm ${isActive ? "font-medium" : "text-sidebar-foreground/70"}`}
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
                Account
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 truncate">
                Job Seeker
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
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
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <Link
              href="/jobs"
              className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Jobs
              <ArrowUpRight className="size-3" />
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "size-7" } }}
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
