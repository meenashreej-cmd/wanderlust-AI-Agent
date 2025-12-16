import React, { useEffect, useState } from 'react';
import { TripResult, User } from '../types';
import { fetchUserTrips } from '../services/mockBackend';

interface DashboardProps {
  user: User;
  onNewTrip: () => void;
  onViewTrip: (trip: TripResult) => void;
  onLogout: () => void;
  onOpenTools: () => void;
}

const calculateTripCost = (trip: TripResult) => {
  const transport = trip.transportOptions.find(t => t.id === trip.selectedTransportId) || trip.transportOptions[0];
  const accommodation = trip.accommodationOptions.find(a => a.id === trip.selectedAccommodationId) || trip.accommodationOptions[0];
  
  const transportCost = transport ? transport.cost : 0;
  const stayCost = accommodation ? accommodation.totalCost : 0;
  const food = trip.estimatedCosts?.food || 0;
  const activities = trip.estimatedCosts?.activities || 0;
  
  return transportCost + stayCost + food + activities;
};

const Dashboard: React.FC<DashboardProps> = ({ user, onNewTrip, onViewTrip, onLogout, onOpenTools }) => {
  const [trips, setTrips] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      const data = await fetchUserTrips(user.id);
      setTrips(data);
      setLoading(false);
    };
    loadTrips();
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
          <p className="text-gray-500">Ready for your next adventure?</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={onOpenTools}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2 rounded-full font-medium shadow hover:shadow-lg transition flex items-center"
            >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Toolkit
            </button>
            <button 
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
                Log Out
            </button>
            <button
            onClick={onNewTrip}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
            + New Trip
            </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new AI-planned itinerary.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, idx) => (
            <div 
              key={idx} 
              onClick={() => onViewTrip(trip)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition group"
            >
              <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                 <span className="text-white text-3xl font-bold opacity-80">{trip.destination}</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">{trip.destination}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${trip.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {trip.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{trip.vibeAnalysis}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                    <span>
                      {trip.currency === 'INR' ? '₹' : '$'}
                      {calculateTripCost(trip).toLocaleString()}
                    </span>
                    <span className="group-hover:text-indigo-600 font-medium">View Details &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;