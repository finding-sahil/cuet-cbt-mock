# CUET Exam CBT Simulation Web App

An ultra-realistic, high-fidelity Computer-Based Test (CBT) practice platform specifically engineered to simulate the official **National Testing Agency (NTA) CUET (Common University Entrance Test)** interface.

This project is tailored for students to practice in an exact replica of the official test-day software, reducing anxiety, teaching question palette navigation, and tracking progress through advanced subject performance diagnostics.

---

## 🌟 Key Features

- **Exact NTA Layout & Palette Shapes**: Replicates the exact colors and geometric shapes of the official NTA question palette:
  - ⬜ **White Box**: Not Visited.
  - 🟥 **Red Curved-Bottom Box**: Visited but Not Answered.
  - 🟩 **Green Curved-Top Box**: Selected and Saved Answer (Evaluated).
  - 🟪 **Purple Circle**: Marked for Review (Not Evaluated).
  - 🟪✅ **Purple Circle + Green Badge**: Answered and Marked for Review (Evaluated).
- **Robust Resilient Timer**: A persistent exam countdown timer that continuously saves state. The test and remaining duration survive hard page refreshes or short network dropouts.
- **Advanced Performance Diagnostics**: Provides a professional report showing:
  - Positive/Negative marking calculations (+5 for correct, -1 for incorrect, 0 for unattempted).
  - Dynamic SVG-based response distribution pie charts.
  - **AI-Style Weak Topic Analysis**: Groups question results by syllabus chapter, calculates chapter accuracy, and automatically isolates weak areas requiring immediate study.
  - Full question-by-question academic solution review with step-by-step derivations.
- **Interactive Admin Panel**: Allows administrators to manually manage questions (CRUD), import question arrays in bulk via JSON, and adjust active test durations or draw limits.
- **Exam Lock-down & Anti-Cheating Simulator**: Blocks standard right-clicks, copy, cut, and paste actions. Tracks visibility states: if a student switches tabs or minimizes the window, warning popups are immediately triggered and the exam may auto-submit.
- **Webcam Proctoring Simulation**: Optionally mounts a mock proctor camera feed in the candidate panel using the user's local web camera.
- **Modern Routing Architecture**: Full URL-based routing (using `react-router-dom`) cleanly isolates Admin and Student views, preventing cross-contamination of sessions.

---

## 📂 File Structure

```text
CUET/
├── frontend/                # React (Vite) Single Page App
│   ├── src/
│   │   ├── components/      # Protected Routes, Dashboard, Simulator, Results, Admin Panel
│   │   ├── context/         # Central State & Auto-save Context
│   │   └── index.css        # NTA custom CSS shapes stylesheet
│   └── Dockerfile           # Multi-stage optimized Nginx builder
├── backend/                 # Node.js + Express REST API Server
│   ├── data/                # Zero-setup JSON local database storage
│   ├── Dockerfile           # Backend container setup
│   ├── seed.js              # Question generator (English & Physics)
│   └── server.js            # Express API, auth, and scoring calculations
├── docker-compose.yml       # Coordinates React, Express, and MongoDB
└── README.md                # This manual
```

---

## 🔐 Mock Examination Credentials

The application uses strict client-side verification for the simulation. Use the following credentials to access the system:

### 🎓 Student Login (Candidate View)
- **Candidate Name:** `Taniyea Khanam Mazumder`
- **Roll Number:** `26051004928`
- **Date of Birth / Password:** `09052008`
- **Subject:** Any (defaults to English)

### 🛡️ Admin Login (Invigilator / Setup View)
To access the Admin Panel, toggle the "Login as Administrator" switch on the login page and use:
- **Admin Roll Number:** `admin`
- **Security Token / Password:** `13042007`

---

## 🚀 Quick Start Guide (Local Execution)

The application has been engineered with a **zero-configuration database fallback driver**. If MongoDB is not running on your computer, the backend transparently saves data to a local JSON file (`backend/data/local_db.json`). 

A root-level workspace manager is configured so that you can run both the frontend and backend simultaneously in a single terminal.

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or 20 recommended)

### Setup & Run Steps

1. **Install all dependencies:**
   In your root directory terminal (`CUET/`), execute:
   ```bash
   npm run install-all
   ```
   *This automatically installs the package trees for both the React frontend and the Express backend.*

2. **Start the Platform:**
   In the same terminal, run:
   ```bash
   npm run dev
   ```
   *This concurrently starts your backend API server on port `5000` and your Vite development portal on port `5173`.*

3. **Practice & Test:**
   Open your browser to `http://localhost:5173` and use the credentials provided in the section above.

---

## 🌐 Local Area Network (LAN) Hosting Guide

Want to host the exam simulator inside your home or local office network so students can practice on their mobile phones, tablets, or other laptops? It is fully pre-configured!

### Step 1: Find Your Local Network IP
On your host Windows computer:
1. Open command prompt or PowerShell and type:
   ```powershell
   ipconfig
   ```
2. Locate your active network adapter (e.g., Wi-Fi or Ethernet) and note down the **IPv4 Address** (typically `192.168.x.x` or `10.0.x.x`, for example `192.168.1.15`).

### Step 2: Bind Vite to the Network
To allow other devices to locate your Vite server, run the development server with the `--host` flag:
```bash
npm run dev --prefix frontend -- --host 0.0.0.0
```
*(Ensure your backend is also running on port 5000)*

### Step 3: Access from Other Devices
Connect your tablet, phone, or second laptop to the **same Wi-Fi network**.
1. Open the browser on the tablet/phone.
2. Enter the address of your host computer with port `5173`:
   - `http://192.168.1.15:5173` (replace with your actual IPv4 address).
3. The frontend automatically detects the network IP address and directs API scoring requests to the backend API binding at `http://192.168.1.15:5000`.

---

## 🐳 Docker Compose Deployment

If you want to run the full stack with a **real MongoDB cluster** running alongside, we provide a unified Docker Compose configuration:

### Execution Command
In the root directory of the project (where `docker-compose.yml` resides), execute:
```bash
docker compose up --build
```

This will automatically:
1. Download and run a persistent MongoDB container.
2. Compile and launch the Node.js Express backend (running seeder on startup).
3. Compile the Vite React frontend and serve it through Nginx.

**Access the application in your browser:**
- Mock Exam Portal: `http://localhost:5173`
- Backend API Endpoint: `http://localhost:5000`
