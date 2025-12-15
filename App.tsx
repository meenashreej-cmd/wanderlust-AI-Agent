import React, { useState } from 'react';
import { User, TripResult } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TripPlanner from './components/TripPlanner';
import ItineraryView from './components/ItineraryView';
import AITools from './components/AITools';

type View = 'LOGIN' | 'DASHBOARD' | 'PLANNER' | 'ITINERARY' | 'TOOLS';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [selectedTrip, setSelectedTrip] = useState<TripResult | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
    setSelectedTrip(null);
  };

  const handleTripGenerated = (trip: TripResult) => {
    setSelectedTrip(trip);
    setCurrentView('ITINERARY');
  };

  const handleViewTrip = (trip: TripResult) => {
      setSelectedTrip(trip);
      setCurrentView('ITINERARY');
  };

  const handleBackToDashboard = () => {
      setSelectedTrip(null);
      setCurrentView('DASHBOARD');
  };

  // View Router
  if (!currentUser || currentView === 'LOGIN') {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'PLANNER') {
    return (
      <TripPlanner 
        userId={currentUser.id} 
        onTripGenerated={handleTripGenerated} 
        onCancel={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'ITINERARY' && selectedTrip) {
    return (
      <ItineraryView 
        trip={selectedTrip} 
        userId={currentUser.id}
        onBack={handleBackToDashboard} 
      />
    );
  }
  
  if (currentView === 'TOOLS') {
      return (
          <AITools onBack={handleBackToDashboard} />
      );
  }

  // Default: Dashboard
  return (
    <Dashboard 
        user={currentUser} 
        onNewTrip={() => setCurrentView('PLANNER')}
        onViewTrip={handleViewTrip}
        onLogout={handleLogout}
        onOpenTools={() => setCurrentView('TOOLS')}
    />
  );
};

export default App;
