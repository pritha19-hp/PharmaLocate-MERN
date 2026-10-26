require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, User, Pharmacy, Medicine, Inventory, Reservation } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

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

// API 4: Chemist Adjust Stock
app.post('/api/inventory/adjust', async (req, res) => {
  try {
    const { pharmacy_id, medicine_id, delta } = req.body;
    const item = await Inventory.findOne({ pharmacy: pharmacy_id, medicine: medicine_id });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.stock = Math.max(0, item.stock + delta);
    await item.save();

    res.json({ success: true, newStock: item.stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 5: Get All Pharmacies
app.get('/api/pharmacies', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MERN Stack Express + MongoDB API running on http://localhost:${PORT}`);
});
