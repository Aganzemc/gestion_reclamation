import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  FolderIcon,
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
  currentView: string;
}



export function AppSidebar({ onViewChange, currentView, ...props }: AppSidebarProps) {
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.firstName,
      email: user?.email!,
      avatar: user?.firstName,
    },
    navMain: [
      {
        id: 'dashboard',
        title: "Tableau de bord",
        url: "#",
        icon: LayoutDashboardIcon,
      },
      {
        id: 'tickets',
        title: "Réclamations",
        url: "#",
        icon: Ticket,
      },
      {
        id: 'users',
        title: "Utilisateurs",
        url: "#",
        icon: Users,
      },
      {
        id: 'analytics',
        title: "Analytics",
        url: "#",
        icon: BarChartIcon,
      }
    ],
  }

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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
