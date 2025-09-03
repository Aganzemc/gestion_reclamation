import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  FolderIcon,
  LayoutDashboardIcon,
  Ticket,
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

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onViewChange: (view: string) => void;
  currentView: string;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
      icon: FolderIcon,
    },
    {
      id: 'analytics',
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
    }
  ],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: CameraIcon,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: FileTextIcon,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: FileCodeIcon,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: SettingsIcon,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: HelpCircleIcon,
  //   },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: SearchIcon,
  //   },
  // ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: DatabaseIcon,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: ClipboardListIcon,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: FileIcon,
  //   },
  // ],
}

export function AppSidebar({onViewChange, currentView, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-6">
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
      <SidebarContent>
        <NavMain items={data.navMain} onViewChange={onViewChange} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
