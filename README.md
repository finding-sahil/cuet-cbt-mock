# CUET Exam CBT Simulation Web App

An ultra-realistic, high-fidelity Computer-Based Test (CBT) practice platform specifically engineered to simulate the official **National Testing Agency (NTA) CUET (Common University Entrance Test)** interface. 

This project is tailored for beginner students to practice in an exact replica of the official test-day software, reducing anxiety, teaching question palette navigation, and tracking progress through advanced subject performance diagnostics.

---

## Key Core Features

1. **Exact NTA Layout & Palette Shapes**: Replicates the exact colors and geometric shapes of the official NTA question palette:
   - **White Box**: Not Visited.
   - **Red Curved-Bottom Box**: Visited but Not Answered.
   - **Green Curved-Top Box**: Selected and Saved Answer (Evaluated).
   - **Purple Circle**: Marked for Review (Not Evaluated).
   - **Purple Circle + Green Badge**: Answered and Marked for Review (Evaluated).
2. **Robust Resilient Timer**: A persistent exam countdown timer that continuously saves state. The test and remaining duration survive hard page refreshes or short network dropouts.
3. **Advanced Performance diagnostics**: Provides a professional report showing:
   - Positive/Negative marking calculations (+5 for correct, -1 for incorrect, 0 for unattempted).
   - Dynamic SVG-based response distribution pie charts.
   - **AI-Style Weak Topic Analysis**: Groups question results by syllabus chapter, calculates chapter accuracy, and automatically isolates weak areas requiring immediate study.
   - Full question-by-question academic solution review with step-by-step derivations.
4. **Interactive Admin Panel**: Access the panel by logging in with the roll number `admin`. Allows administrators to manually manage questions (CRUD), import question arrays in bulk via JSON, and adjust active test durations or draw limits.
5. **Exam Lock-down & Anti-Cheating Simulator**: Blocks standard right-clicks, copy, cut, and paste actions. Tracks visibility states: if a student switches tabs or minimizes the window, warning popups are immediately triggered.
6. **Webcam Proctoring Simulation**: Optionally mounts a mock proctor camera feed in the candidate panel using the user's local web camera with permission.

---

## File Structure

```text
CUET/
├── frontend/                # React (Vite) Single Page App
│   ├── src/
│   │   ├── components/      # Login, Dashboard, Instructions, Simulator, Results, Admin Panel
│   │   ├── context/         # Central State & Auto-save Context
│   │   └── index.css        # NTA custom CSS shapes stylesheet
│   └── Dockerfile           # Multi-stage optimized Nginx builder
├── backend/                 # Node.js + Express REST API Server
│   ├── data/                # Zero-setup JSON local database storage
│   ├── Dockerfile           # Backend container setup
│   ├── seed.js              # 1010+ question generator (English & Physics)
│   └── server.js            # Express API, auth, and scoring calculations
├── docker-compose.yml       # Coordinates React, Express, and MongoDB
└── README.md                # This manual
```

---

## Quick Start Guide (Local Execution)

The application has been engineered with a **zero-configuration database fallback driver**. If MongoDB is not running on your computer, the backend transparently saves files to a local JSON file (`backend/data/local_db.json`). 

We have pre-configured a root-level workspace manager so that you can run both the frontend and backend simultaneously in a single terminal!

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or 20 recommended)

### Quick Start Steps

1. **Install all dependencies:**
   In your root directory terminal (`C:\Users\Sahil\Desktop\CUET`), execute:
   ```bash
   npm run install-all
   ```
   *This automatically installs the package trees for both the React frontend and the Express backend.*

2. **Start the Platform:**
   In the same terminal, run:
   ```bash
   npm run dev
   ```
   *This concurrently starts your backend API server on port `5000` and your Vite development portal on port `5173`!*

3. **Practice & Test:**
   Open your browser to `http://localhost:5173`.
   - To practice as a student: Login with any candidate name and numeric roll number.
   - To manage the system: Login with the roll number **`admin`** to access the Question CRUD Manager.

---

## Local Area Network (LAN) Hosting Guide

Want to host the exam simulator inside your home or local office network so students can practice on their mobile phones, tablets, or other laptops? It is fully pre-configured!

### Step 1: Bind Vite to the Network
To allow other devices to locate your Vite server, run the development server with the `--host` flag:
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### Step 2: Find Your Local Network IP
On your host Windows computer:
1. Open command prompt or PowerShell and type:
   ```powershell
   ipconfig
   ```
2. Locate your active network adapter (e.g. Wi-Fi or Ethernet) and note down the **IPv4 Address** (typically looks like `192.168.x.x` or `10.0.x.x`, for example `192.168.1.15`).

### Step 3: Access from Other Devices
Connect your tablet, phone, or second laptop to the **same Wi-Fi network**.
1. Open the browser on the tablet/phone.
2. Enter the address of your host computer with port `5173`:
   - `http://192.168.1.15:5173` (replace with your actual IPv4 address).
3. **The app will load and operate flawlessly!** The frontend automatically detects the network IP address and directs API scoring requests to the backend API binding at `http://192.168.1.15:5000` automatically.

---

## Docker Compose Deployment

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

Access the application in your browser:
- Mock Exam Portal: `http://localhost:5173`
- Backend API Endpoint: `http://localhost:5000`

---

## Mock Examination Credentials
- **Student Mock Login:** Fill in any candidate name, any numeric roll number, select a subject, and click Sign In.
- **Admin Panel Access:** In the Candidate Login screen, enter **`admin`** in the Roll Number field and click Sign In. This opens the dedicated administrative system control panel immediately.
