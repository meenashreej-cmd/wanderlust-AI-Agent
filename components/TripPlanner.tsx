import React, { useState, useRef } from 'react';
import { TripInput, TripResult, LogItem } from '../types';
import { generateAgenticTrip } from '../services/geminiService';

interface TripPlannerProps {
  userId: string;
  onTripGenerated: (trip: TripResult) => void;
  onCancel: () => void;
}

// Simple list of major cities for suggestions
const MAJOR_CITIES = [
    "Mumbai, India", "New Delhi, India", "Bangalore, India", "Chennai, India", "Goa, India",
    "Kolkata, India", "Hyderabad, India", "Jaipur, India", "Kochi, India", "Ahmedabad, India",
    "New York, USA", "London, UK", "Paris, France", "Tokyo, Japan", "Dubai, UAE",
    "Singapore", "Bangkok, Thailand", "Bali, Indonesia", "Sydney, Australia", "Rome, Italy"
];

const TripPlanner: React.FC<TripPlannerProps> = ({ userId, onTripGenerated, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<TripInput>({
    fromLocation: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    totalBudget: 50000,
    currency: 'INR',
    budgetType: 'total',
    people: 1,
    transport: 'flight',
    accommodationType: 'hotel',
    accommodationBudget: 'mid_range',
    bookingPreference: 'suggest_only',
    tourGuide: false, // Default false
    imageFile: null
  } as TripInput);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const result = await generateAgenticTrip(formData, userId, () => {});
      onTripGenerated(result);
    } catch (error: any) {
      console.error(error);
      alert(`Error generating trip: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-pulse">Designing Your Journey</h2>
        <p className="text-gray-500">Our AI agent is booking flights, finding hotels, and planning your days...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Plan Your Trip</h2>
        <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
        
        {/* City Autocomplete Data List */}
        <datalist id="city-suggestions">
            {MAJOR_CITIES.map((city, idx) => (
                <option key={idx} value={city} />
            ))}
        </datalist>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wide">The Basics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where from?</label>
                <input 
                    name="fromLocation" 
                    value={formData.fromLocation} 
                    onChange={handleInputChange} 
                    list="city-suggestions"
                    className="input-field w-full p-3 border border-black bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Type to search e.g. Mumbai..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where to?</label>
                <input 
                    name="destination" 
                    value={formData.destination} 
                    onChange={handleInputChange} 
                    list="city-suggestions"
                    className="input-field w-full p-3 border border-black bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Type to search e.g. London..." 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    {/* Native date picker with a bit of styling */}
                    <input 
                        type="date" 
                        name="startDate" 
                        value={formData.startDate} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-black bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input 
                        type="date" 
                        name="endDate" 
                        value={formData.endDate} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-black bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" 
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                <input type="number" name="people" value={formData.people} onChange={handleInputChange} min={1} className="w-full p-3 border border-black bg-white rounded-lg" />
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={onCancel} className="mr-4 text-gray-500 hover:text-gray-800">Cancel</button>
                <button onClick={() => setStep(2)} disabled={!formData.destination || !formData.startDate} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Next: Inspiration</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wide">Vibe & Inspiration</h3>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your ideal trip</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-3 border border-black bg-white rounded-lg" placeholder="I want a relaxing trip..." />
             </div>
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <div className="mx-auto h-12 w-12 text-gray-400 mb-2"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <p className="text-sm text-gray-600">{formData.imageFile ? formData.imageFile.name : 'Upload an inspiration image'}</p>
             </div>
             {formData.imageFile && (
                 <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100 flex justify-center"><img src={URL.createObjectURL(formData.imageFile)} alt="Preview" className="h-full object-contain" /></div>
             )}
            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900">Back</button>
                <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">Next: Budget & Logistics</button>
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wide">Budget & Logistics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full p-3 border border-black bg-white rounded-lg">
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">{formData.currency === 'INR' ? '₹' : '$'}</span>
                            <input type="number" name="totalBudget" value={formData.totalBudget} onChange={handleInputChange} className="w-full p-3 pl-8 border border-black bg-white rounded-lg" />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Budget Type</label>
                        <select name="budgetType" value={formData.budgetType} onChange={handleInputChange} className="w-full p-3 border border-black bg-white rounded-lg">
                            <option value="total">Total for trip</option>
                            <option value="per_person">Per Person</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
                        <select name="transport" value={formData.transport} onChange={handleInputChange} className="w-full p-3 border border-black bg-white rounded-lg">
                            <option value="flight">Flight</option>
                            <option value="train">Train</option>
                            <option value="car">Rental Car</option>
                            <option value="bus">Bus</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation</label>
                        <select name="accommodationType" value={formData.accommodationType} onChange={handleInputChange} className="w-full p-3 border border-black bg-white rounded-lg">
                            <option value="hotel">Hotel</option>
                            <option value="airbnb">Airbnb / Rental</option>
                        </select>
                    </div>
                    
                    {/* Tour Guide Option */}
                    <div className="flex items-center pt-8">
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="tourGuide"
                                checked={formData.tourGuide} 
                                onChange={handleInputChange}
                                className="sr-only peer" 
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-700">Need a Tour Guide?</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t mt-6">
                    <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900">Back</button>
                    <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transform active:scale-95 transition">Generate Itinerary ✨</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;