const mongoose = require('mongoose');

// 1. User Schema (Customer / Patient, Site Manager / Chemist, Admin)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'SITE_MANAGER', 'ADMIN'], default: 'CUSTOMER' },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', default: null },
  created_at: { type: Date, default: Date.now }
});

// 2. Pharmacy Schema
const PharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  distance: { type: String, default: '1.0 km' },
  lat: { type: Number, default: 13.0827 },
  lng: { type: Number, default: 80.2707 }
});

// 3. Medicine Schema
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  generic_name: { type: String, required: true },
  category: { type: String, required: true }
});

// 4. Inventory Schema
const InventorySchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true }
});

// 5. Reservation Schema
const ReservationSchema = new mongoose.Schema({
  reservation_code: { type: String, required: true, unique: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  quantity: { type: Number, default: 1 },
  patient_name: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'CLAIMED', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Pharmacy = mongoose.model('Pharmacy', PharmacySchema);
const Medicine = mongoose.model('Medicine', MedicineSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);

// Database Connection & Auto Seed Function with Serverless Connection Caching
let cachedPromise = null;

const connectDB = async () => {
  // If already connected or connecting, return
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharma_locate';

  cachedPromise = mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  }).then(async (m) => {
    console.log('🍃 MongoDB Connected Successfully for PharmaLocate!');

    try {
      // Seed Sample MERN Data if empty
      const pharmacyCount = await Pharmacy.countDocuments();
      if (pharmacyCount === 0) {
        console.log('Seeding initial MongoDB dataset with Users, Stores & Inventory...');

        const p1 = await Pharmacy.create({ name: 'Apollo Pharmacy (24x7)', address: '12 Main Road, Anna Nagar', phone: '+91 98401 23456', distance: '0.8 km', lat: 13.0827, lng: 80.2707 });
        const p2 = await Pharmacy.create({ name: 'MedPlus Chemists', address: '45 North Usman St, T. Nagar', phone: '+91 98402 34567', distance: '1.4 km', lat: 13.0850, lng: 80.2750 });
        const p3 = await Pharmacy.create({ name: 'Care & Cure Wellness', address: '88 Gandhi Road, Adyar', phone: '+91 98403 45678', distance: '2.5 km', lat: 13.0800, lng: 80.2650 });
        const p4 = await Pharmacy.create({ name: 'HealthFirst Drugstore', address: '14 Velachery Main Road', phone: '+91 98404 56789', distance: '3.1 km', lat: 12.9750, lng: 80.2200 });

        // Seed Users
        await User.create([
          { username: 'System Administrator', email: 'admin@pharmalocate.com', password: 'admin123', role: 'ADMIN' },
          { username: 'Apollo Site Manager', email: 'apollo@chemist.com', password: 'chemist123', role: 'SITE_MANAGER', pharmacy: p1._id },
          { username: 'Rahul Sharma', email: 'rahul@gmail.com', password: 'customer123', role: 'CUSTOMER' }
        ]);

        const m1 = await Medicine.create({ name: 'Augmentin 625 Duo', generic_name: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics' });
        const m2 = await Medicine.create({ name: 'Dolo 650', generic_name: 'Paracetamol 650mg', category: 'Fever & Pain' });
        const m3 = await Medicine.create({ name: 'InsuQuick 100IU', generic_name: 'Insulin Glargine Human', category: 'Diabetes' });
        const m4 = await Medicine.create({ name: 'Azithral 500', generic_name: 'Azithromycin 500mg', category: 'Antibiotics' });
        const m5 = await Medicine.create({ name: 'Pantocid 40', generic_name: 'Pantoprazole Sodium', category: 'Gastro' });
        const m6 = await Medicine.create({ name: 'Combiflam', generic_name: 'Ibuprofen + Paracetamol', category: 'Fever & Pain' });

        await Inventory.insertMany([
          { pharmacy: p1._id, medicine: m1._id, stock: 14, price: 201.50 },
          { pharmacy: p1._id, medicine: m2._id, stock: 85, price: 33.00 },
          { pharmacy: p1._id, medicine: m3._id, stock: 4, price: 480.00 },
          { pharmacy: p1._id, medicine: m4._id, stock: 22, price: 125.00 },
          { pharmacy: p2._id, medicine: m1._id, stock: 2, price: 198.00 },
          { pharmacy: p2._id, medicine: m2._id, stock: 60, price: 31.50 },
          { pharmacy: p2._id, medicine: m5._id, stock: 45, price: 85.00 },
          { pharmacy: p3._id, medicine: m2._id, stock: 40, price: 30.00 },
          { pharmacy: p3._id, medicine: m3._id, stock: 12, price: 475.00 },
          { pharmacy: p3._id, medicine: m6._id, stock: 30, price: 42.00 },
          { pharmacy: p4._id, medicine: m1._id, stock: 8, price: 205.00 },
          { pharmacy: p4._id, medicine: m4._id, stock: 15, price: 120.00 }
        ]);
        console.log('MongoDB Seeding Completed!');
      }
    } catch (seedErr) {
      console.warn('Seeding notice:', seedErr.message);
    }

    return m;
  }).catch((err) => {
    cachedPromise = null;
    console.error('MongoDB Connection Error:', err.message);
    throw err;
  });

  return cachedPromise;
};

module.exports = {
  connectDB,
  User,
  Pharmacy,
  Medicine,
  Inventory,
  Reservation
};
