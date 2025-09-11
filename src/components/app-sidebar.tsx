import * as React from "react"
import {
  BarChartIcon,
  Bell,
  LayoutDashboardIcon,
  Ticket,
  Users,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { useAuth } from "../context/AuthContext"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onViewChange: (view: string) => void;
  setClickedUserId: (id: string) => void
  currentView: string;
}



export function AppSidebar({ onViewChange, setClickedUserId, currentView, ...props }: AppSidebarProps) {
  const { user } = useAuth();

  const baseNav = [
    {
      id: "dashboard",
      title: "Tableau de bord",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      id: "tickets",
      title: "Réclamations",
      url: "#",
      icon: Ticket,
    },
    {
      id: "notifications",
      title: "Notifications",
      url: "#",
      icon: Bell,
    },
    {
      id: "analytics",
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
    },
  ];

  // conditionnel
  if (user?.role === "ADMIN") {
    baseNav.splice(2, 0, {
      id: "users",
      title: "Utilisateurs",
      url: "#",
      icon: Users,
    });
  }

  const data = {
    user: {
      name: user?.firstName,
      email: user?.email!,
      avatar: user?.firstName,
    },
    navMain: baseNav,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-6 bg-white/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="font-semibold text-2xl">Gestion Tickets</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-white/80">
        <NavMain items={data.navMain} onViewChange={onViewChange} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter className="bg-white/80">
        <NavUser user={data.user} setClickedUserId={setClickedUserId} onViewChange={onViewChange} />
      </SidebarFooter>
    </Sidebar>
  )
}
