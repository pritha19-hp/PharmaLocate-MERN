# 🏥 PharmaLocate - Real-Time Pharmacy Inventory & Medicine Hold System

> **Full-Stack MERN Application** aggregating live inventory data from local chemists, enabling instant medicine search, pharmacy location discovery, and 60-minute reservation holds.

---

## 🌟 Key Features

- 🔍 **Instant Medicine Radar:** Search by Brand Name (*Dolo, Augmentin*), Generic Active Salt (*Paracetamol*), or Category.
- 📊 **Real-Time Stock Availability:** View exact stock levels (*In Stock*, *Low Stock warnings*) across local pharmacies.
- 🎟️ **60-Minute Reservation Hold:** Hold required dosages with patient name to prevent out-of-stock disappointment.
- 📍 **Local Pharmacy Discovery:** View shop distance, full street address, and verified chemist contact details.
- 🍃 **MERN Architecture:** Powered by MongoDB, Express.js, React.js, Node.js & Tailwind CSS.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) / SQLite |
| **Styling** | Tailwind CSS |

---

## 📂 Project Structure

```text
fsdpro/
├── backend/
│   ├── database.js      # MongoDB Mongoose schemas & auto-seeding
│   ├── server.js        # Express REST API (/api/search, /api/reserve)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx      # Main React UI with live search & hold modal
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Start & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend API server runs at `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend app runs at `http://localhost:5173`*

---

## 📜 License
Licensed under the [MIT License](LICENSE).

## Live link
https://pritha19-hp.github.io/PharmaLocate-MERN/
