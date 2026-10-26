import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Pill, Clock, CheckCircle, ShieldCheck, Phone, 
  AlertCircle, ShoppingBag, Store, Filter, User, LogIn, LogOut, 
  Map, List, Plus, Minus, Check, BarChart3, Navigation, Upload, 
  FileText, Shield, UserPlus, Eye, Building2, Bell, CheckSquare, Printer
} from 'lucide-react';
import RealRxScanner from './components/RealRxScanner';
import RealPharmacyMap from './components/RealPharmacyMap';
import PharmacyReceiptModal from './components/PharmacyReceiptModal';

export default function App() {
  // Authentication & Active User State (Defaults to Rahul Sharma, or null when logged out)
  const [currentUser, setCurrentUser] = useState({
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    role: 'CUSTOMER', // 'CUSTOMER' | 'SITE_MANAGER' | 'ADMIN'
    pharmacy: ''
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', pharmacy: 'Apollo Pharmacy (24x7)' });
  const [receiptTicket, setReceiptTicket] = useState(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'map' | 'rx-scanner' | 'my-holds' | 'manager' | 'admin'
  const [mapRadius, setMapRadius] = useState('5 km');

  // Search & Filter States
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);

  // Reservation States
  const [modalItem, setModalItem] = useState(null);
  const [patientName, setPatientName] = useState('Rahul Sharma');
  const [userReservations, setUserReservations] = useState([
    {
      code: 'MED-7X9K2A',
      medicine: 'Augmentin 625 Duo',
      pharmacy: 'Apollo Pharmacy (24x7)',
      address: '12 Main Road, Anna Nagar',
      phone: '+91 98401 23456',
      patient: 'Rahul Sharma',
      status: 'ACTIVE',
      expiresIn: '45 mins remaining',
      price: 201.50
    }
  ]);
  const [recentReserved, setRecentReserved] = useState(null);

  // Site Manager States
  const [managerStore, setManagerStore] = useState('Apollo Pharmacy (24x7)');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Prescription Scanner State
  const [uploadedRx, setUploadedRx] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [detectedMeds, setDetectedMeds] = useState([]);

  // Categories
  const categories = ['All', 'Antibiotics', 'Fever & Pain', 'Diabetes', 'Gastro'];

  // Master Store Inventory
  const [masterInventory, setMasterInventory] = useState([
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
      lat: 13.0827,
      lng: 80.2707,
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
      lat: 13.0827,
      lng: 80.2707,
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
      lat: 13.0800,
      lng: 80.2650,
      stock: 4,
      price: 480.00
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
      lat: 13.0850,
      lng: 80.2750,
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
      lat: 13.0850,
      lng: 80.2750,
      stock: 45,
      price: 85.00
    },
    {
      medicine_id: 6,
      medicine_name: 'Combiflam',
      generic_name: 'Ibuprofen + Paracetamol',
      category: 'Fever & Pain',
      pharmacy_id: 4,
      pharmacy_name: 'HealthFirst Drugstore',
      address: '14 Velachery Main Road',
      phone: '+91 98404 56789',
      distance: '3.1 km',
      lat: 12.9750,
      lng: 80.2200,
      stock: 9,
      price: 42.00
    }
  ]);

  // Fetch real data from MongoDB on mount
  const fetchInventoryFromMongo = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setMasterInventory(data);
        }
      }
    } catch (err) {
      console.log('MongoDB inventory fetch:', err.message);
    }
  };

  const fetchReservationsFromMongo = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reservations');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setUserReservations(data);
        }
      }
    } catch (err) {
      console.log('MongoDB reservations fetch:', err.message);
    }
  };

  useEffect(() => {
    fetchInventoryFromMongo();
    fetchReservationsFromMongo();
  }, []);

  // Instant Search Engine with live MongoDB queries
  useEffect(() => {
    let filtered = masterInventory;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (query.trim() !== '') {
      const q = query.toLowerCase();
      filtered = filtered.filter(item =>
        item.medicine_name.toLowerCase().includes(q) ||
        item.generic_name.toLowerCase().includes(q) ||
        item.pharmacy_name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    setResults(filtered);
  }, [query, selectedCategory, masterInventory]);

  // Handle Reservation saved to MongoDB
  const confirmReservation = async () => {
    if (!patientName.trim()) {
      alert("Please enter patient name");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: modalItem.pharmacy_id,
          medicine_id: modalItem.medicine_id,
          patient_name: patientName.trim(),
          quantity: 1
        })
      });

      const data = await res.json();
      if (data.success) {
        const ticket = {
          code: data.reservationCode,
          medicine: modalItem.medicine_name,
          pharmacy: modalItem.pharmacy_name,
          address: modalItem.address,
          phone: modalItem.phone,
          patient: patientName,
          status: 'ACTIVE',
          expiresIn: '60 mins remaining',
          price: modalItem.price
        };

        setUserReservations(prev => [ticket, ...prev]);
        setRecentReserved(ticket);
        setModalItem(null);
        fetchInventoryFromMongo();
        fetchReservationsFromMongo();
      } else {
        alert(data.error || 'Failed to complete hold in MongoDB');
      }
    } catch (err) {
      console.error('Reservation error:', err);
    }
  };

  // Site Manager Stock Adjust saved to MongoDB
  const handleStockAdjust = async (item, delta) => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: item.pharmacy_id || item.pharmacy_name,
          medicine_id: item.medicine_id,
          delta
        })
      });

      if (res.ok) {
        fetchInventoryFromMongo();
      }
    } catch (err) {
      console.error('Stock adjust error:', err);
    }
  };

  // Passcode Verification in MongoDB
  const handleVerifyPasscode = async () => {
    if (!verifyCodeInput.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/reserve/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: verifyCodeInput.trim() })
      });

      const data = await res.json();
      setVerifyResult(data);
      if (data.valid) {
        fetchInventoryFromMongo();
        fetchReservationsFromMongo();
      }
    } catch (err) {
      console.error('Verify passcode error:', err);
    }
  };

  // Cancel Reservation in MongoDB & Restore Stock
  const handleCancelHold = async (code) => {
    if (!window.confirm(`Are you sure you want to cancel reservation ${code}? The pill will be restored to MongoDB stock.`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/reserve/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (data.success) {
        fetchInventoryFromMongo();
        fetchReservationsFromMongo();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Cancel hold error:', err);
    }
  };

  // Delete Medicine Item from MongoDB Inventory
  const handleDeleteInventory = async (inventory_id) => {
    if (!inventory_id) return;
    if (!window.confirm('Delete this medicine entry from MongoDB inventory?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${inventory_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchInventoryFromMongo();
      }
    } catch (err) {
      console.error('Delete inventory error:', err);
    }
  };

  // Chemist state for adding new medicine
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    generic_name: '',
    category: 'Antibiotics',
    stock: 50,
    price: 45
  });

  const handleAddNewMedicine = async (e) => {
    e.preventDefault();
    if (!newMedForm.name.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_name: managerStore,
          medicine_name: newMedForm.name.trim(),
          generic_name: newMedForm.generic_name.trim() || newMedForm.name.trim(),
          category: newMedForm.category,
          stock: Number(newMedForm.stock) || 50,
          price: Number(newMedForm.price) || 45
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setNewMedForm({ name: '', generic_name: '', category: 'Antibiotics', stock: 50, price: 45 });
        setShowAddMedModal(false);
        fetchInventoryFromMongo();
      }
    } catch (err) {
      console.error('Add medicine error:', err);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('browse');
    alert('You have logged out successfully.');
  };

  // Auth Handler connected to MongoDB with automatic role identification
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'signup') {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
            role: authForm.role,
            pharmacy_name: authForm.pharmacy
          })
        });

        const data = await res.json();
        if (data.success) {
          alert(`Account created! Identified as ${data.user.role}.`);
          setCurrentUser(data.user);
          setAuthModalOpen(false);
          if (data.user.role === 'SITE_MANAGER') {
            setActiveTab('manager');
            if (data.user.pharmacy) setManagerStore(data.user.pharmacy);
          } else if (data.user.role === 'ADMIN') {
            setActiveTab('admin');
          } else {
            setActiveTab('browse');
          }
        } else {
          alert(data.error || 'Failed to create account');
        }
      } else {
        // LOGIN: Backend identifies whether person is Customer, Chemist, or Admin from MongoDB!
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password
          })
        });

        const data = await res.json();
        if (data.success) {
          alert(`Welcome back, ${data.user.name}! Identified as ${data.user.role}.`);
          setCurrentUser(data.user);
          setAuthModalOpen(false);
          if (data.user.role === 'SITE_MANAGER') {
            setActiveTab('manager');
            if (data.user.pharmacy) setManagerStore(data.user.pharmacy);
          } else if (data.user.role === 'ADMIN') {
            setActiveTab('admin');
          } else {
            setActiveTab('browse');
          }
        } else {
          alert(data.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      alert('Could not connect to authentication service on localhost:5000');
    }
  };

  // Quick Demo Login
  const quickLogin = (role, name, pharmacy = '') => {
    setCurrentUser({ role, name, pharmacy, email: `${role.toLowerCase()}@pharmalocate.com` });
    setAuthModalOpen(false);
    if (role === 'SITE_MANAGER') {
      setActiveTab('manager');
      if (pharmacy) setManagerStore(pharmacy);
    } else if (role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('browse');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* ===================== NAVBAR ===================== */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('browse')}>
            <div className="bg-emerald-500 p-2 rounded-2xl text-white shadow">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                PharmaLocate
                <span className="text-[10px] bg-emerald-600 border border-emerald-400 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  MERN Live
                </span>
              </h1>
              <p className="text-xs text-emerald-200">Real-Time Pharmacy Inventory & Medicine Hold</p>
            </div>
          </div>

          {/* Role-Specific Navigation Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'browse' ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              <Search className="h-3.5 w-3.5" /> Stock Radar
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'map' ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              <Map className="h-3.5 w-3.5" /> Live Map
            </button>

            <button
              onClick={() => setActiveTab('rx-scanner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'rx-scanner' ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> AI Rx Scan
            </button>

            <button
              onClick={() => setActiveTab('my-holds')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                activeTab === 'my-holds' ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> My Holds
              {userReservations.filter(r => r.status === 'ACTIVE').length > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 absolute top-1 right-1"></span>
              )}
            </button>

            {currentUser?.role === 'SITE_MANAGER' && (
              <button
                onClick={() => setActiveTab('manager')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 shadow`}
              >
                <Store className="h-3.5 w-3.5" /> Store Manager
              </button>
            )}

            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow`}
              >
                <Shield className="h-3.5 w-3.5" /> Admin Panel
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-2 shadow"
                  title="Switch or view account details"
                >
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <div className="text-left hidden sm:block leading-none">
                    <span className="block text-[11px] font-bold">{currentUser.name}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase">{currentUser.role.replace('_', ' ')}</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-emerald-900 hover:bg-rose-900 border border-emerald-500 hover:border-rose-500 text-white text-xs font-bold px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
                  title="Log out of PharmaLocate"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-300" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="ml-2 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-extrabold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-700" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===================== MAIN CONTENT CONTAINER ===================== */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">

        {/* VIEW 1: CUSTOMER MEDICINE RADAR */}
        {activeTab === 'browse' && (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Instant Medicine Availability Radar ⚡
                  </h2>
                  <p className="text-sm text-slate-500">
                    Live stock status across 4 verified local pharmacies in your area.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('rx-scanner')}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" /> Scan Doctor's Rx
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <Map className="h-3.5 w-3.5" /> View Map Radar
                  </button>
                </div>
              </div>

              {/* Instant Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Type to search medicine name (Dolo, Augmentin), salt (Paracetamol), or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-16 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium text-sm"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Categories:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
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

            {/* Recent Hold Alert */}
            {recentReserved && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md">
                      60-Minute Hold Confirmed
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {recentReserved.medicine} held for {recentReserved.patient}!
                    </h3>
                    <p className="text-xs text-slate-600">
                      Pick up at <strong>{recentReserved.pharmacy}</strong>. Show passcode at counter.
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs font-mono font-black bg-white border border-emerald-400 text-emerald-900 px-3 py-1 rounded-xl shadow-xs">
                        PASSCODE: {recentReserved.code}
                      </span>
                      <span className="text-xs text-slate-500">{recentReserved.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setReceiptTicket(recentReserved)}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-400" /> View Official Receipt
                  </button>
                  <button
                    onClick={() => setActiveTab('my-holds')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    View All Holds
                  </button>
                  <button
                    onClick={() => setRecentReserved(null)}
                    className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-xl transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Stock Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
                  <Pill className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-base">No matching medicines found</h4>
                  <p className="text-slate-500 text-sm mt-1">Try typing another brand or generic salt name.</p>
                </div>
              )}

              {results.map((item, idx) => {
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 5;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-extrabold text-slate-900">{item.medicine_name}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Salt: <span className="text-slate-700 font-semibold">{item.generic_name}</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                          {item.category}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5 text-emerald-600" />
                            {item.pharmacy_name}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            📍 {item.distance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 pl-5">{item.address}</p>
                        <p className="text-[11px] text-slate-600 pl-5 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" /> {item.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                          {isOutOfStock ? 'Out of Stock' : `${item.stock} Pills Available`}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Licensed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Retail Price</span>
                        <span className="text-xl font-black text-slate-900">₹{item.price.toFixed(2)}</span>
                      </div>
                      <button
                        disabled={isOutOfStock}
                        onClick={() => setModalItem(item)}
                        className={`text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-sm flex items-center gap-1.5 ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Reserve 60m Hold
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* VIEW 2: AI PRESCRIPTION SCANNER (REAL TESSERACT OCR) */}
        {activeTab === 'rx-scanner' && (
          <RealRxScanner
            masterInventory={masterInventory}
            onRefreshInventory={fetchInventoryFromMongo}
            onSelectMedicine={(medName) => {
              setQuery(medName);
              setActiveTab('browse');
            }}
          />
        )}

        {/* VIEW 3: LIVE MAP RADAR (REAL LEAFLET + REAL GPS + GOOGLE MAPS) */}
        {activeTab === 'map' && (
          <RealPharmacyMap
            masterInventory={masterInventory}
            onSelectPharmacy={(pharmName) => {
              setQuery(pharmName);
              setActiveTab('browse');
            }}
          />
        )}

        {/* VIEW 4: MY HOLD PASSCODES */}
        {activeTab === 'my-holds' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900">My Medicine Hold Tickets 🎫</h2>
              <p className="text-sm text-slate-500">Show this digital ticket at the counter for guaranteed medicine pickup.</p>
            </div>

            <div className="space-y-3">
              {userReservations.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                  <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-semibold">No active reservation holds right now.</p>
                </div>
              ) : (
                userReservations.map((r, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status === 'ACTIVE' ? '🟢 Active 60m Hold' : '✅ Claimed & Dispensed'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {r.expiresIn}
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-900">{r.medicine}</h4>
                      <p className="text-xs text-slate-600">Reserved For: <strong>{r.patient}</strong></p>
                      <p className="text-xs text-slate-500">📍 {r.pharmacy} — {r.address}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left md:text-right flex flex-col items-start md:items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Passcode</span>
                      <span className="text-2xl font-mono font-black text-emerald-700 tracking-wider">{r.code}</span>
                      <p className="text-xs font-bold text-slate-700">₹{r.price?.toFixed(2)} (Pay at Counter)</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => setReceiptTicket(r)}
                          className="text-[11px] bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5 shadow"
                        >
                          <Printer className="h-3 w-3 text-emerald-400" /> View / Print Receipt
                        </button>
                        {r.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handleCancelHold(r.code)}
                            className="text-[11px] bg-rose-50 text-rose-700 border border-rose-300 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-100 transition"
                          >
                            ✕ Cancel Hold
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: SITE MANAGER / CHEMIST PORTAL */}
        {activeTab === 'manager' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase">
                  🏪 Retail Chemist / Site Manager Portal
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">{managerStore}</h2>
                <p className="text-xs text-slate-500">Manage real-time pill inventory & verify customer pickup codes</p>
              </div>

              <select
                value={managerStore}
                onChange={(e) => setManagerStore(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Apollo Pharmacy (24x7)">Apollo Pharmacy (24x7)</option>
                <option value="MedPlus Chemists">MedPlus Chemists</option>
                <option value="Care & Cure Wellness">Care & Cure Wellness</option>
                <option value="HealthFirst Drugstore">HealthFirst Drugstore</option>
              </select>
            </div>

            {/* Counter Code Validator */}
            <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-emerald-400" /> Counter Pickup Code Verification
              </h3>
              <p className="text-xs text-emerald-200">
                Enter the customer's 6-character reservation code (e.g., MED-7X9K2A) to verify and dispense medication.
              </p>
              
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Enter Passcode..."
                  value={verifyCodeInput}
                  onChange={(e) => setVerifyCodeInput(e.target.value)}
                  className="flex-1 bg-white text-slate-900 font-mono font-bold px-4 py-2.5 rounded-xl uppercase text-sm focus:outline-none"
                />
                <button
                  onClick={handleVerifyPasscode}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  Verify Code
                </button>
              </div>

              {verifyResult && (
                <div className={`p-3.5 rounded-xl text-xs font-bold ${
                  verifyResult.valid 
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500' 
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500'
                }`}>
                  {verifyResult.valid ? `✅ Valid! Dispense ${verifyResult.ticket.medicine} to ${verifyResult.ticket.patient}` : `❌ ${verifyResult.message}`}
                </div>
              )}
            </div>

            {/* Stock Control Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Pill Stock Management</h3>
                  <p className="text-xs text-slate-500">Live synced with MongoDB database collection</p>
                </div>
                <button
                  onClick={() => setShowAddMedModal(!showAddMedModal)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="h-4 w-4" /> {showAddMedModal ? 'Close Form' : 'Add New Medicine'}
                </button>
              </div>

              {/* Add New Medicine Form for Chemist */}
              {showAddMedModal && (
                <form onSubmit={handleAddNewMedicine} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Add Medicine to {managerStore} (Saved in MongoDB)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      value={newMedForm.name}
                      onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                      required
                      className="bg-white border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Generic Salt Name"
                      value={newMedForm.generic_name}
                      onChange={(e) => setNewMedForm({ ...newMedForm, generic_name: e.target.value })}
                      className="bg-white border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                    />
                    <select
                      value={newMedForm.category}
                      onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                      className="bg-white border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                    >
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Fever & Pain">Fever & Pain</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Gastro">Gastro</option>
                      <option value="Allergy">Allergy</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Pill Stock"
                      value={newMedForm.stock}
                      onChange={(e) => setNewMedForm({ ...newMedForm, stock: e.target.value })}
                      className="bg-white border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={newMedForm.price}
                      onChange={(e) => setNewMedForm({ ...newMedForm, price: e.target.value })}
                      className="bg-white border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                    >
                      Save to MongoDB
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-slate-100">
                {masterInventory
                  .filter(item => item.pharmacy_name === managerStore)
                  .map((item, idx) => (
                    <div key={idx} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.medicine_name}</h4>
                        <p className="text-xs text-slate-500">{item.generic_name} • {item.category}</p>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">₹{item.price?.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl">
                          {item.stock} Pills Remaining
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStockAdjust(item, -1)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl transition"
                            title="Decrease Stock by 1"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item, 5)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold px-3"
                            title="Add 5 Pills to Stock"
                          >
                            <Plus className="h-3.5 w-3.5" /> 5
                          </button>
                          {item.inventory_id && (
                            <button
                              onClick={() => handleDeleteInventory(item.inventory_id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2 rounded-xl transition text-xs font-bold px-2.5 ml-1"
                              title="Delete from MongoDB"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: SUPER ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                Super Admin Access
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Platform Administration 🛡️</h2>
              <p className="text-sm text-slate-500">System analytics, registered chemist stores, and real-time inventory monitoring.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Registered Pharmacies</span>
                <p className="text-3xl font-black text-slate-900 mt-1">4 Stores</p>
                <span className="text-[11px] text-emerald-600 font-semibold">100% Verified</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Catalog Drugs</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{masterInventory.length} SKUs</p>
                <span className="text-[11px] text-slate-500">Across 5 categories</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Pills Tracked</span>
                <p className="text-3xl font-black text-emerald-700 mt-1">
                  {masterInventory.reduce((acc, curr) => acc + curr.stock, 0)} Units
                </p>
                <span className="text-[11px] text-emerald-600">Live synced</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Holds</span>
                <p className="text-3xl font-black text-amber-600 mt-1">
                  {userReservations.filter(r => r.status === 'ACTIVE').length}
                </p>
                <span className="text-[11px] text-slate-500">Pending counter pickup</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">Registered Local Pharmacies</h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Apollo Pharmacy (24x7)</p>
                    <p className="text-slate-500">12 Main Road, Anna Nagar • Phone: +91 98401 23456</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Verified Licensed</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">MedPlus Chemists</p>
                    <p className="text-slate-500">45 North Usman St, T. Nagar • Phone: +91 98402 34567</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Verified Licensed</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Care & Cure Wellness</p>
                    <p className="text-slate-500">88 Gandhi Road, Adyar • Phone: +91 98403 45678</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Verified Licensed</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">HealthFirst Drugstore</p>
                    <p className="text-slate-500">14 Velachery Main Road • Phone: +91 98404 56789</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Verified Licensed</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: HOLD RESERVATION */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Reserve Medicine Hold</h3>
              <button
                onClick={() => setModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-slate-100 rounded-full h-8 w-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold">Selected Drug</p>
              <p className="text-base font-extrabold text-slate-900">{modalItem.medicine_name}</p>
              <p className="text-xs text-slate-600">Pharmacy: {modalItem.pharmacy_name}</p>
              <p className="text-sm font-black text-emerald-700 pt-1">₹{modalItem.price.toFixed(2)} (Pay at counter)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Patient / Collector Name
              </label>
              <input
                type="text"
                placeholder="Enter patient name..."
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Medicine will be locked for <strong>60 minutes</strong>. Unclaimed units are restored to live inventory.</span>
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
                Confirm 60m Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOGIN & SIGN UP */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">PharmaLocate Account</h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'signup' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Your Role</label>
                  <select
                    value={authForm.role}
                    onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-bold bg-white"
                  >
                    <option value="CUSTOMER">🧑 Customer / Patient</option>
                    <option value="SITE_MANAGER">🏪 Retail Chemist (Store Manager)</option>
                    <option value="ADMIN">🛡️ Platform Administrator</option>
                  </select>
                </div>
              )}

              {authMode === 'signup' && authForm.role === 'SITE_MANAGER' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned Pharmacy Branch</label>
                  <select
                    value={authForm.pharmacy}
                    onChange={(e) => setAuthForm({ ...authForm, pharmacy: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Apollo Pharmacy (24x7)">Apollo Pharmacy (24x7)</option>
                    <option value="MedPlus Chemists">MedPlus Chemists</option>
                    <option value="Care & Cure Wellness">Care & Cure Wellness</option>
                    <option value="HealthFirst Drugstore">HealthFirst Drugstore</option>
                  </select>
                </div>
              )}

              {authMode === 'login' && (
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>The platform will <strong>auto-identify your role</strong> (Customer, Chemist, or Admin) upon sign in.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow"
              >
                {authMode === 'login' ? 'Sign In (Auto-Identify Role)' : 'Create Account in MongoDB'}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                1-Click Demo Accounts (Instant Role Switch)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickLogin('CUSTOMER', 'Rahul Sharma')}
                  className="bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2 rounded-xl text-center text-[10px] font-bold transition"
                >
                  🧑 Customer
                </button>
                <button
                  onClick={() => quickLogin('SITE_MANAGER', 'Apollo Chemist', 'Apollo Pharmacy (24x7)')}
                  className="bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-center text-[10px] font-bold transition"
                >
                  🏪 Chemist
                </button>
                <button
                  onClick={() => quickLogin('ADMIN', 'Super Admin')}
                  className="bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-2 rounded-xl text-center text-[10px] font-bold transition"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL PHARMACY HOLD RECEIPT & CLAIM SLIP */}
      <PharmacyReceiptModal
        ticket={receiptTicket}
        onClose={() => setReceiptTicket(null)}
      />
    </div>
  );
}
