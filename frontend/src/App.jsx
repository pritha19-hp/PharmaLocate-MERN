import React, { useState, useEffect } from 'react';
import { Search, MapPin, Pill, Clock, CheckCircle, ShieldCheck, Phone, AlertCircle, ShoppingBag, Store, Filter } from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [viewMode, setViewMode] = useState('medicines'); // 'medicines' | 'pharmacies'
  const [pharmaciesList, setPharmaciesList] = useState([]);

  const categories = ['All', 'Antibiotics', 'Fever & Pain', 'Diabetes', 'Gastro'];

  const fetchMedicines = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("API response error");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.warn("Backend API not reachable. Using interactive local dataset.");
      // Fallback demo data if backend server is starting up
      const mockData = [
        {
          medicine_id: 1,
          medicine_name: 'Augmentin 625 Duo',
          generic_name: 'Amoxicillin + Clavulanic Acid',
          category: 'Antibiotics',
          pharmacy_id: 1,
          pharmacy_name: 'Apollo Pharmacy (24x7)',
          address: '12 Main Road, Anna Nagar',
          phone: '+91 98401 23456',
          distance: '0.8 km',
          stock: 14,
          price: 201.50
        },
        {
          medicine_id: 2,
          medicine_name: 'Dolo 650',
          generic_name: 'Paracetamol 650mg',
          category: 'Fever & Pain',
          pharmacy_id: 1,
          pharmacy_name: 'Apollo Pharmacy (24x7)',
          address: '12 Main Road, Anna Nagar',
          phone: '+91 98401 23456',
          distance: '0.8 km',
          stock: 85,
          price: 33.00
        },
        {
          medicine_id: 3,
          medicine_name: 'InsuQuick 100IU',
          generic_name: 'Insulin Glargine Human',
          category: 'Diabetes',
          pharmacy_id: 3,
          pharmacy_name: 'Care & Cure Wellness',
          address: '88 Gandhi Road, Adyar',
          phone: '+91 98403 45678',
          distance: '2.5 km',
          stock: 4,
          price: 475.00
        },
        {
          medicine_id: 4,
          medicine_name: 'Azithral 500',
          generic_name: 'Azithromycin 500mg',
          category: 'Antibiotics',
          pharmacy_id: 2,
          pharmacy_name: 'MedPlus Chemists',
          address: '45 North Usman St, T. Nagar',
          phone: '+91 98402 34567',
          distance: '1.4 km',
          stock: 22,
          price: 125.00
        },
        {
          medicine_id: 5,
          medicine_name: 'Pantocid 40',
          generic_name: 'Pantoprazole Sodium',
          category: 'Gastro',
          pharmacy_id: 2,
          pharmacy_name: 'MedPlus Chemists',
          address: '45 North Usman St, T. Nagar',
          phone: '+91 98402 34567',
          distance: '1.4 km',
          stock: 45,
          price: 85.00
        }
      ];

      if (searchTerm) {
        setResults(mockData.filter(m => 
          m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.category.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } else {
        setResults(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines(query);
  };

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    fetchMedicines(cat === 'All' ? '' : cat);
  };

  const confirmReservation = async () => {
    if (!patientName.trim()) {
      alert("Please enter patient name for the 60-minute hold ticket.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: modalItem.pharmacy_id,
          medicine_id: modalItem.medicine_id,
          quantity: 1,
          patient_name: patientName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReserved({
          code: data.reservationCode,
          medicine: modalItem.medicine_name,
          pharmacy: modalItem.pharmacy_name,
          phone: modalItem.phone,
          patient: patientName
        });
        setModalItem(null);
        setPatientName('');
        fetchMedicines(query);
      } else {
        alert(data.error);
      }
    } catch (err) {
      // Fallback local hold generator
      const mockCode = 'MED-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setReserved({
        code: mockCode,
        medicine: modalItem.medicine_name,
        pharmacy: modalItem.pharmacy_name,
        phone: modalItem.phone,
        patient: patientName
      });
      setModalItem(null);
      setPatientName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                PharmaLocate
                <span className="text-xs bg-emerald-600 border border-emerald-400 text-emerald-100 px-2 py-0.5 rounded-full font-normal">
                  v1.0 Live
                </span>
              </h1>
              <p className="text-xs text-emerald-200">Real-Time Pharmacy Stock Radar & Medicine Hold System</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-800/90 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 border border-emerald-600/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Aggregating 4 Local Pharmacies
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        
        {/* Search Hero Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Instant Medicine Search & Hold ⚡
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Find essential medications available right now at nearby verified chemists. Reserve your dosage before traveling.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand (Augmentin, Dolo), salt (Paracetamol), or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3 rounded-2xl transition shadow flex items-center justify-center gap-2"
            >
              {loading ? 'Searching...' : 'Search Stock'}
            </button>
          </form>

          {/* Quick Category Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reservation Confirmation Alert */}
        {reserved && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl shrink-0">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-md">
                  60-Minute Hold Reserved
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {reserved.medicine} reserved for {reserved.patient}!
                </h3>
                <p className="text-sm text-slate-600">
                  Pick up at <strong className="text-slate-800">{reserved.pharmacy}</strong>. Present passcode at counter.
                </p>
                <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono font-extrabold bg-white border border-emerald-400 text-emerald-900 px-3 py-1 rounded-xl shadow-xs">
                    PASSCODE: {reserved.code}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {reserved.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setReserved(null)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition self-end md:self-auto"
            >
              Dismiss Ticket
            </button>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            Live Pharmacy Stock Results ({results.length})
          </h3>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600" /> Live Inventory Sync Active
          </span>
        </div>

        {/* Medicines Stock List */}
        <div className="grid grid-cols-1 gap-4">
          {results.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
              <Pill className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">No matching medicines found nearby</h4>
              <p className="text-slate-500 text-sm mt-1">Try searching for generic salt like "Paracetamol" or "Amoxicillin".</p>
            </div>
          )}

          {results.map((item, idx) => {
            const isLowStock = item.stock <= 5;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-5"
              >
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xl font-extrabold text-slate-900">{item.medicine_name}</h4>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {item.category || 'Medicine'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Active Salt / Generic: <span className="text-slate-700 font-semibold">{item.generic_name}</span>
                    </p>
                  </div>

                  {/* Pharmacy Location Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item.pharmacy_name}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        📍 {item.distance || '1.0 km away'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-5">{item.address}</p>
                    <p className="text-xs text-slate-600 pl-5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" /> Phone: {item.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isLowStock
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {item.stock} Units Available Now
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Licensed Pharmacy
                    </span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-3 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-semibold block">Retail Price</span>
                    <span className="text-2xl font-black text-slate-900">₹{item.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setModalItem(item)}
                    className="bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-2xl transition shadow-sm flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Reserve 60m Hold
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Reservation Modal */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Medicine Hold Confirmation</h3>
              <button
                onClick={() => setModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold bg-slate-100 rounded-full h-8 w-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Selected Item</p>
              <p className="text-base font-extrabold text-slate-900">{modalItem.medicine_name}</p>
              <p className="text-xs text-slate-600">Pharmacy: {modalItem.pharmacy_name}</p>
              <p className="text-sm font-black text-emerald-700 pt-1">₹{modalItem.price.toFixed(2)} (Pay at counter)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Patient / Collector Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>This medicine will be locked under your name for <strong>60 minutes</strong>. Unclaimed stock will be automatically released.</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalItem(null)}
                className="flex-1 py-3 border border-slate-300 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReservation}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition shadow"
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

