import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import TicketList from './components/Tickets/TicketList';
import Analytics from './components/Analytics/Analytics';
import UserManagement from './components/Users/UserManagement';
import { LoginForm } from './components/login-form';
import NotificationsPage from './components/notifications/Notifications';
import { UserAccount } from './components/Users/UserAccount';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clikedUserId, setClickedUserId] = useState<string>('')

  if (!isAuthenticated) {
    return <LoginForm  className="md:w-4/12 w-11/12 h-[350px] m-auto md:mt-[100px] mt-[50px]"/>
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <TicketList />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <NotificationsPage/>
      case 'user-account':
        return <UserAccount id={clikedUserId}/>
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setClickedUserId={setClickedUserId} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </Router>
  );
}

export default App;