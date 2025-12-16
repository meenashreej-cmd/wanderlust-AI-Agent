import React, { useState, useEffect } from 'react';
import { TripResult, DayPlan, TransportOption, AccommodationOption, FoodOption } from '../types';
import { saveTrip } from '../services/mockBackend';

interface ItineraryViewProps {
  trip: TripResult;
  userId: string;
  onBack: () => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ trip: initialTrip, userId, onBack }) => {
  const [trip, setTrip] = useState<TripResult>(initialTrip);
  const [selectedTransportId, setSelectedTransportId] = useState<string>(initialTrip.selectedTransportId || initialTrip.transportOptions[0].id);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<string>(initialTrip.selectedAccommodationId || initialTrip.accommodationOptions[0].id);
  const [selectedFoodId, setSelectedFoodId] = useState<string>(initialTrip.selectedFoodId || (initialTrip.foodOptions?.[0]?.id ?? ''));
  
  const [isEditing, setIsEditing] = useState(initialTrip.status === 'draft');
  const [saving, setSaving] = useState(false);

  // Derived state
  const selectedTransport = trip.transportOptions.find(t => t.id === selectedTransportId) || trip.transportOptions[0];
  const selectedAccommodation = trip.accommodationOptions.find(a => a.id === selectedAccommodationId) || trip.accommodationOptions[0];
  const selectedFood = trip.foodOptions?.find(f => f.id === selectedFoodId) || trip.foodOptions?.[0];
  
  const currencySymbol = trip.currency === 'INR' ? '₹' : '$';
  const peopleCount = trip.people || 1;

  // Calculate Featured Dining Cost (Per person * people)
  const featuredDiningCost = selectedFood ? (selectedFood.costPerPerson * peopleCount) : 0;

  const costBreakdown = {
      transport: selectedTransport.cost,
      stay: selectedAccommodation.totalCost,
      food: trip.estimatedCosts.food + featuredDiningCost,
      activities: trip.estimatedCosts.activities,
      total: selectedTransport.cost + selectedAccommodation.totalCost + trip.estimatedCosts.food + trip.estimatedCosts.activities + featuredDiningCost
  };

  const handleItineraryChange = (dayIndex: number, itemId: string, field: 'activity' | 'notes', value: string) => {
      const newItinerary = [...trip.itinerary];
      const item = newItinerary[dayIndex].items.find(i => i.id === itemId);
      if (item) {
          (item as any)[field] = value;
          setTrip(prev => ({ ...prev, itinerary: newItinerary }));
      }
  };

  const handleSaveTrip = async () => {
      setSaving(true);
      const finalTrip: TripResult = {
          ...trip,
          selectedTransportId,
          selectedAccommodationId,
          selectedFoodId,
          status: 'saved'
      };
      await saveTrip(userId, finalTrip);
      setTrip(finalTrip);
      setIsEditing(false);
      setSaving(false);
  };

  // Simulate Booking Action
  const handleBooking = async (type: 'transport' | 'accommodation' | 'food', id: string) => {
      if(!window.confirm(`Confirm booking for this ${type}?`)) return;

      // Create a shallow copy of the trip to ensure React detects the state change
      const updatedTrip = { ...trip, status: 'booked' as const };

      if (type === 'transport') {
          // Map to create a NEW array reference with updated objects
          updatedTrip.transportOptions = trip.transportOptions.map(o => ({
              ...o,
              booked: o.id === id // Only the selected one is booked, others false
          }));
          updatedTrip.selectedTransportId = id;
          setSelectedTransportId(id);
      } else if (type === 'accommodation') {
          updatedTrip.accommodationOptions = trip.accommodationOptions.map(o => ({
              ...o,
              booked: o.id === id
          }));
          updatedTrip.selectedAccommodationId = id;
          setSelectedAccommodationId(id);
      } else if (type === 'food') {
          if (trip.foodOptions) {
              updatedTrip.foodOptions = trip.foodOptions.map(o => ({
                  ...o,
                  booked: o.id === id
              }));
          }
          updatedTrip.selectedFoodId = id;
          setSelectedFoodId(id);
      }
      
      setTrip(updatedTrip);
      await saveTrip(userId, updatedTrip);
      // We keep isEditing state as is, allowing further actions or switching to view mode if desired
      // setIsEditing(false); 
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-indigo-600 transition">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
          
          {isEditing ? (
              <button 
                onClick={handleSaveTrip} 
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition"
              >
                  {saving ? 'Saving...' : 'Confirm & Save Trip'}
              </button>
          ) : (
             <span className={`px-4 py-2 rounded-full font-medium text-sm ${trip.status === 'booked' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {trip.status === 'booked' ? 'Bookings Confirmed' : 'Trip Saved'}
             </span>
          )}
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold mb-2">{trip.destination}</h1>
                <p className="opacity-90 italic">"{trip.vibeAnalysis}"</p>
            </div>
            <div className="text-right">
                <div className="text-sm opacity-80">Total Estimated Cost</div>
                <div className="text-4xl font-bold">{currencySymbol}{costBreakdown.total.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-1">for {peopleCount} person{peopleCount > 1 ? 's' : ''}</div>
            </div>
          </div>
      </div>

      {/* Selection Sections */}
      <div className="space-y-8">
          
          {/* Transport Section */}
          <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 text-xl">✈️</span>
                  Modes of Transportation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trip.transportOptions.map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => setSelectedTransportId(option.id)}
                        className={`bg-white rounded-xl p-6 shadow border-2 cursor-pointer transition relative ${selectedTransportId === option.id ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-gray-200'}`}
                      >
                          {selectedTransportId === option.id && <div className="absolute top-3 right-3 text-green-500"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                          <h3 className="font-bold text-lg text-gray-900">{option.provider}</h3>
                          <p className="text-sm text-gray-500 mb-3 capitalize">{option.type}</p>
                          <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between"><span>Departs:</span> <span className="font-medium text-gray-900">{option.departureTime}</span></div>
                              <div className="flex justify-between"><span>Arrives:</span> <span className="font-medium text-gray-900">{option.arrivalTime}</span></div>
                              <div className="flex justify-between"><span>Duration:</span> <span>{option.duration}</span></div>
                          </div>
                          <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-green-600">{currencySymbol}{option.cost.toLocaleString()}</span>
                              </div>
                              
                              {option.booked ? (
                                <button disabled className="w-full mt-2 py-2 bg-gray-100 text-green-600 font-bold rounded flex items-center justify-center cursor-default">
                                    ✓ Booked
                                </button>
                              ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleBooking('transport', option.id); }}
                                    className={`w-full mt-2 py-2 font-bold rounded transition ${selectedTransportId === option.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    {selectedTransportId === option.id ? 'Book Now' : 'Select & Book'}
                                </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Stay Section */}
          <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 text-xl">🏨</span>
                  Stay Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trip.accommodationOptions.map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => setSelectedAccommodationId(option.id)}
                        className={`bg-white rounded-xl p-6 shadow border-2 cursor-pointer transition relative ${selectedAccommodationId === option.id ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-gray-200'}`}
                      >
                           {selectedAccommodationId === option.id && <div className="absolute top-3 right-3 text-green-500"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{option.name}</h3>
                          <div className="flex items-center text-sm text-yellow-500 mb-2">
                              <span>★ {option.rating}</span>
                              <span className="text-gray-400 ml-2">• {option.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-4">
                              {option.amenities.slice(0,3).map(a => <span key={a} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{a}</span>)}
                          </div>
                          <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                              <div className="flex justify-between items-end">
                                  <div>
                                      <span className="text-xl font-bold text-green-600">{currencySymbol}{option.totalCost.toLocaleString()}</span>
                                      <div className="text-xs text-gray-400">{currencySymbol}{option.costPerNight}/night</div>
                                  </div>
                              </div>

                              {option.booked ? (
                                <button disabled className="w-full mt-2 py-2 bg-gray-100 text-green-600 font-bold rounded flex items-center justify-center cursor-default">
                                    ✓ Booked
                                </button>
                              ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleBooking('accommodation', option.id); }}
                                    className={`w-full mt-2 py-2 font-bold rounded transition ${selectedAccommodationId === option.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                     {selectedAccommodationId === option.id ? 'Book Now' : 'Select & Book'}
                                </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Food Section */}
          {trip.foodOptions && trip.foodOptions.length > 0 && (
             <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 text-xl">🍽️</span>
                    Culinary Experiences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trip.foodOptions.map((option) => (
                        <div 
                          key={option.id}
                          onClick={() => setSelectedFoodId(option.id)}
                          className={`bg-white rounded-xl p-6 shadow border-2 cursor-pointer transition relative ${selectedFoodId === option.id ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-gray-200'}`}
                        >
                             {selectedFoodId === option.id && <div className="absolute top-3 right-3 text-green-500"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{option.name}</h3>
                            <p className="text-sm text-indigo-600 font-medium mb-1">{option.cuisine}</p>
                            <div className="flex items-center text-sm text-yellow-500 mb-2">
                                <span>★ {option.rating}</span>
                                <span className="text-gray-400 ml-2">• {option.type}</span>
                            </div>
                            <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xl font-bold text-green-600">{currencySymbol}{option.costPerPerson}</span>
                                        <div className="text-xs text-gray-400">per person</div>
                                    </div>
                                </div>

                                {option.booked ? (
                                  <button disabled className="w-full mt-2 py-2 bg-gray-100 text-green-600 font-bold rounded flex items-center justify-center cursor-default">
                                      ✓ Reserved
                                  </button>
                                ) : (
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleBooking('food', option.id); }}
                                      className={`w-full mt-2 py-2 font-bold rounded transition ${selectedFoodId === option.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-indigo-600 hover:bg-indigo-100'}`}
                                  >
                                       {selectedFoodId === option.id ? 'Reserve Table' : 'Select & Reserve'}
                                  </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}

          {/* Itinerary & Cost Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Itinerary Column */}
              <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold text-gray-800">Your Itinerary</h2>
                     {!isEditing && (
                         <button 
                            onClick={() => setIsEditing(true)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm"
                         >
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             Edit Itinerary
                         </button>
                     )}
                  </div>
                  
                  <div className="space-y-6">
                      {trip.itinerary.map((day, dIdx) => (
                          <div key={dIdx} className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                              <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                                  <h3 className="font-bold text-gray-900">Day {day.day} - {day.theme}</h3>
                                  <span className="text-sm text-gray-500">{day.date}</span>
                              </div>
                              <div className="divide-y divide-gray-100">
                                  {day.items.map((item) => (
                                      <div key={item.id} className="p-4 flex gap-4">
                                          <div className="w-24 text-xs font-bold text-gray-400 pt-1 uppercase tracking-wide shrink-0">
                                              {item.time}
                                          </div>
                                          <div className="flex-1 space-y-2">
                                              {isEditing ? (
                                                  <input 
                                                    className="w-full font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none bg-transparent"
                                                    value={item.activity}
                                                    onChange={(e) => handleItineraryChange(dIdx, item.id, 'activity', e.target.value)}
                                                  />
                                              ) : (
                                                  <div className="font-medium text-gray-900">{item.activity}</div>
                                              )}
                                              
                                              {isEditing ? (
                                                   <textarea 
                                                    className="w-full text-sm text-gray-500 border border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none bg-transparent rounded p-1"
                                                    value={item.notes}
                                                    onChange={(e) => handleItineraryChange(dIdx, item.id, 'notes', e.target.value)}
                                                    rows={2}
                                                  />
                                              ) : (
                                                  <p className="text-sm text-gray-500">{item.notes}</p>
                                              )}
                                              <div className="text-xs text-green-600 font-medium">Est. Cost: {currencySymbol}{item.costEstimate}</div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Cost Breakdown Column */}
              <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Cost Breakdown</h2>
                      
                      <div className="space-y-4 text-sm">
                          <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center"><span className="w-6 text-center mr-2">✈️</span> Transport</span>
                              <span className="font-medium">{currencySymbol}{costBreakdown.transport.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center"><span className="w-6 text-center mr-2">🏨</span> Stay</span>
                              <span className="font-medium">{currencySymbol}{costBreakdown.stay.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center"><span className="w-6 text-center mr-2">🍔</span> Food</span>
                              <span className="font-medium">{currencySymbol}{costBreakdown.food.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center"><span className="w-6 text-center mr-2">🎟️</span> Activities</span>
                              <span className="font-medium">{currencySymbol}{costBreakdown.activities.toLocaleString()}</span>
                          </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">Total</span>
                          <span className={`text-2xl font-bold ${costBreakdown.total > (trip.currency === 'INR' ? 100000 : 5000) ? 'text-orange-600' : 'text-green-600'}`}>
                              {currencySymbol}{costBreakdown.total.toLocaleString()}
                          </span>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default ItineraryView;