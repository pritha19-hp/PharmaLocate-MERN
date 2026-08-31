require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, Pharmacy, Medicine, Inventory, Reservation } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API 1: Live Medicine Search across local pharmacies (MongoDB Aggregation / Populate)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i');

    // Find medicines matching query
    const matchingMedicines = await Medicine.find({
      $or: [
        { name: regex },
        { generic_name: regex },
        { category: regex }
      ]
    });

    const medicineIds = matchingMedicines.map(m => m._id);

    // Find inventory items matching medicine IDs or pharmacy name search
    let inventoryItems = await Inventory.find({ medicine: { $in: medicineIds } })
      .populate('pharmacy')
      .populate('medicine');

    // If query didn't match medicine directly, search pharmacy names
    if (inventoryItems.length === 0 && query) {
      const matchingPharmacies = await Pharmacy.find({ name: regex });
      const pharmacyIds = matchingPharmacies.map(p => p._id);
      inventoryItems = await Inventory.find({ pharmacy: { $in: pharmacyIds } })
        .populate('pharmacy')
        .populate('medicine');
    }

    // Format response JSON
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
    const reservationCode = 'MERN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
      message: 'Medicine hold confirmed for 60 minutes in MongoDB!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Get All Pharmacies
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
