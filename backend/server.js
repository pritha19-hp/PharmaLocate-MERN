require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, User, Pharmacy, Medicine, Inventory, Reservation } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API 0.1: User Sign Up (Registers Customer, Chemist, or Admin in MongoDB)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', pharmacy_name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    let pharmacyId = null;
    if (role === 'SITE_MANAGER' && pharmacy_name) {
      const p = await Pharmacy.findOne({ name: pharmacy_name });
      if (p) pharmacyId = p._id;
    }

    const user = await User.create({
      username: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role.toUpperCase(),
      pharmacy: pharmacyId
    });

    const populated = await User.findById(user._id).populate('pharmacy');

    res.json({
      success: true,
      message: `Account created successfully as ${user.role}!`,
      user: {
        id: populated._id,
        name: populated.username,
        email: populated.email,
        role: populated.role,
        pharmacy: populated.pharmacy ? populated.pharmacy.name : (pharmacy_name || '')
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 0.2: User Login (Auto-identifies role: Customer, Chemist, or Admin from MongoDB)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('pharmacy');
    if (!user) {
      return res.status(401).json({ error: 'No account registered with this email. Please sign up!' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.username}! Identified as ${user.role}.`,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role, // 'CUSTOMER' | 'SITE_MANAGER' | 'ADMIN'
        pharmacy: user.pharmacy ? user.pharmacy.name : ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 1: Live Medicine Search across local pharmacies
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i');

    const matchingMedicines = await Medicine.find({
      $or: [
        { name: regex },
        { generic_name: regex },
        { category: regex }
      ]
    });

    const medicineIds = matchingMedicines.map(m => m._id);

    let inventoryItems = await Inventory.find({ medicine: { $in: medicineIds } })
      .populate('pharmacy')
      .populate('medicine');

    if (inventoryItems.length === 0 && query) {
      const matchingPharmacies = await Pharmacy.find({ name: regex });
      const pharmacyIds = matchingPharmacies.map(p => p._id);
      inventoryItems = await Inventory.find({ pharmacy: { $in: pharmacyIds } })
        .populate('pharmacy')
        .populate('medicine');
    }

    const formatted = inventoryItems.map(item => ({
      medicine_id: item.medicine._id,
      medicine_name: item.medicine.name,
      generic_name: item.medicine.generic_name,
      category: item.medicine.category,
      pharmacy_id: item.pharmacy._id,
      pharmacy_name: item.pharmacy.name,
      address: item.pharmacy.address,
      phone: item.pharmacy.phone,
      distance: item.pharmacy.distance,
      lat: item.pharmacy.lat,
      lng: item.pharmacy.lng,
      stock: item.stock,
      price: item.price
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 2: Reserve / Hold Medicine for 60 minutes
app.post('/api/reserve', async (req, res) => {
  try {
    const { pharmacy_id, medicine_id, quantity = 1, patient_name } = req.body;

    if (!pharmacy_id || !medicine_id || !patient_name) {
      return res.status(400).json({ error: 'Missing required reservation parameters' });
    }

    const inventoryItem = await Inventory.findOne({
      pharmacy: pharmacy_id,
      medicine: medicine_id
    });

    if (!inventoryItem || inventoryItem.stock < quantity) {
      return res.status(400).json({ error: 'Medicine stock currently unavailable' });
    }

    // Deduct stock in MongoDB
    inventoryItem.stock -= quantity;
    await inventoryItem.save();

    // Create Reservation record in MongoDB
    const reservationCode = 'MED-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const reservation = await Reservation.create({
      reservation_code: reservationCode,
      pharmacy: pharmacy_id,
      medicine: medicine_id,
      quantity,
      patient_name
    });

    res.json({
      success: true,
      reservationCode: reservation.reservation_code,
      message: 'Medicine hold confirmed for 60 minutes!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Chemist Verify Passcode at Counter
app.post('/api/reserve/verify', async (req, res) => {
  try {
    const { passcode } = req.body;
    const reservation = await Reservation.findOne({ reservation_code: passcode.toUpperCase() })
      .populate('pharmacy')
      .populate('medicine');

    if (!reservation) {
      return res.status(404).json({ valid: false, message: 'Invalid or Expired Passcode' });
    }

    reservation.status = 'CLAIMED';
    await reservation.save();

    res.json({
      valid: true,
      message: 'Passcode verified successfully. Medicine dispensed!',
      ticket: {
        code: reservation.reservation_code,
        medicine: reservation.medicine.name,
        patient: reservation.patient_name,
        pharmacy: reservation.pharmacy.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4: Chemist Adjust Stock in MongoDB
app.post('/api/inventory/adjust', async (req, res) => {
  try {
    const { pharmacy_id, medicine_id, delta } = req.body;
    let item = null;
    if (pharmacy_id && medicine_id) {
      item = await Inventory.findOne({ pharmacy: pharmacy_id, medicine: medicine_id });
    }
    if (!item) {
      // Find by pharmacy name / medicine name if IDs were names
      const p = await Pharmacy.findOne({ name: pharmacy_id });
      if (p) {
        item = await Inventory.findOne({ pharmacy: p._id, medicine: medicine_id });
      }
    }
    if (!item) return res.status(404).json({ error: 'Item not found in MongoDB' });

    item.stock = Math.max(0, item.stock + delta);
    await item.save();

    res.json({ success: true, newStock: item.stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 5: Get All Pharmacies from MongoDB
app.get('/api/pharmacies', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 6: Get Full Inventory from MongoDB
app.get('/api/inventory', async (req, res) => {
  try {
    const inventoryItems = await Inventory.find()
      .populate('pharmacy')
      .populate('medicine');

    const formatted = inventoryItems
      .filter(item => item.pharmacy && item.medicine)
      .map(item => ({
        inventory_id: item._id,
        medicine_id: item.medicine._id,
        medicine_name: item.medicine.name,
        generic_name: item.medicine.generic_name,
        category: item.medicine.category,
        pharmacy_id: item.pharmacy._id,
        pharmacy_name: item.pharmacy.name,
        address: item.pharmacy.address,
        phone: item.pharmacy.phone,
        distance: item.pharmacy.distance,
        lat: item.pharmacy.lat,
        lng: item.pharmacy.lng,
        stock: item.stock,
        price: item.price
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 7: Add / Save New Medicine into MongoDB (From Prescription or Chemist)
app.post('/api/inventory/add', async (req, res) => {
  try {
    const { pharmacy_id, pharmacy_name, medicine_name, generic_name, category = 'General', stock = 50, price = 45 } = req.body;

    if (!medicine_name) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }

    // 1. Resolve Pharmacy
    let pharmacy = null;
    if (pharmacy_id) {
      pharmacy = await Pharmacy.findById(pharmacy_id).catch(() => null);
    }
    if (!pharmacy && pharmacy_name) {
      pharmacy = await Pharmacy.findOne({ name: pharmacy_name });
    }
    if (!pharmacy) {
      pharmacy = await Pharmacy.findOne(); // Fallback to first pharmacy
    }

    // 2. Resolve or Create Medicine in MongoDB
    let medicine = await Medicine.findOne({
      name: { $regex: new RegExp(`^${medicine_name.trim()}$`, 'i') }
    });

    if (!medicine) {
      medicine = await Medicine.create({
        name: medicine_name.trim(),
        generic_name: generic_name ? generic_name.trim() : `${medicine_name.trim()} (Generic)`,
        category: category || 'General'
      });
    }

    // 3. Resolve or Create Inventory in MongoDB
    let inventory = await Inventory.findOne({
      pharmacy: pharmacy._id,
      medicine: medicine._id
    });

    if (inventory) {
      inventory.stock = Number(stock);
      inventory.price = Number(price);
      await inventory.save();
    } else {
      inventory = await Inventory.create({
        pharmacy: pharmacy._id,
        medicine: medicine._id,
        stock: Number(stock),
        price: Number(price)
      });
    }

    const populated = await Inventory.findById(inventory._id)
      .populate('pharmacy')
      .populate('medicine');

    res.json({
      success: true,
      message: `Successfully saved "${medicine.name}" to MongoDB under ${pharmacy.name}!`,
      item: {
        inventory_id: populated._id,
        medicine_id: populated.medicine._id,
        medicine_name: populated.medicine.name,
        generic_name: populated.medicine.generic_name,
        category: populated.medicine.category,
        pharmacy_id: populated.pharmacy._id,
        pharmacy_name: populated.pharmacy.name,
        address: populated.pharmacy.address,
        phone: populated.pharmacy.phone,
        distance: populated.pharmacy.distance,
        lat: populated.pharmacy.lat,
        lng: populated.pharmacy.lng,
        stock: populated.stock,
        price: populated.price
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 8: Delete Inventory Item from MongoDB
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Inventory item not found in MongoDB' });
    res.json({ success: true, message: 'Item deleted from MongoDB inventory!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 9: Get All Reservations from MongoDB
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('pharmacy')
      .populate('medicine')
      .sort({ created_at: -1 });

    const formatted = reservations
      .filter(r => r.pharmacy && r.medicine)
      .map(r => ({
        reservation_id: r._id,
        code: r.reservation_code,
        medicine: r.medicine.name,
        generic_name: r.medicine.generic_name,
        pharmacy: r.pharmacy.name,
        address: r.pharmacy.address,
        phone: r.pharmacy.phone,
        patient: r.patient_name,
        status: r.status,
        quantity: r.quantity,
        created_at: r.created_at,
        expiresIn: r.status === 'ACTIVE' ? '60 mins remaining' : r.status,
        price: 45.00
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 10: Cancel Reservation in MongoDB & Restore Stock
app.post('/api/reserve/cancel', async (req, res) => {
  try {
    const { code } = req.body;
    const reservation = await Reservation.findOne({ reservation_code: code.toUpperCase() });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found in MongoDB' });

    if (reservation.status === 'ACTIVE') {
      // Restore stock in MongoDB
      const inventoryItem = await Inventory.findOne({
        pharmacy: reservation.pharmacy,
        medicine: reservation.medicine
      });
      if (inventoryItem) {
        inventoryItem.stock += reservation.quantity;
        await inventoryItem.save();
      }
    }

    reservation.status = 'CANCELLED';
    await reservation.save();

    res.json({ success: true, message: `Reservation ${code} cancelled and stock restored in MongoDB!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MERN Stack Express + MongoDB API running on http://localhost:${PORT}`);
});
