import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  // const { user, logout } = useAuth();
  // const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <>
      <SidebarProvider>
        <AppSidebar onViewChange={onViewChange} currentView={currentView} />
        <main className='md:px-5 px-2 overflow-hidden w-full'>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
};

export default Layout;