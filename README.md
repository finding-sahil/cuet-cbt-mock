# CUET CBT Simulation Web Application

A high-fidelity **Computer-Based Test (CBT) simulation platform** built to accurately replicate the official **National Testing Agency (NTA) Common University Entrance Test (CUET)** examination interface.

Designed for students preparing for CUET, the application delivers an exam experience that closely mirrors the official NTA software. From the question palette and timer behavior to navigation and scoring, every component is engineered to help candidates become familiar with the real examination environment while providing detailed performance analytics for effective preparation.

---

# ✨ Features

## 🎯 Authentic NTA Examination Experience

The application faithfully reproduces the visual appearance and workflow of the official CUET CBT interface, including the original question palette design.

### Question Status Indicators

* ⬜ **White** — Not Visited
* 🟥 **Red (Curved Bottom)** — Visited but Not Answered
* 🟩 **Green (Curved Top)** — Answered and Saved
* 🟣 **Purple Circle** — Marked for Review
* 🟣✅ **Purple Circle with Green Badge** — Answered and Marked for Review

The layout, navigation flow, color scheme, and interactions are designed to closely resemble the official NTA examination portal.

---

## ⏱ Persistent Examination Timer

The built-in countdown timer automatically preserves its state throughout the examination.

Features include:

* Automatic progress saving
* Timer recovery after browser refresh
* Resilient against temporary network interruptions
* Accurate remaining-time restoration

---

## 📊 Advanced Performance Analytics

After completing the examination, students receive a comprehensive performance report including:

* Automatic score calculation

  * **+5** for each correct answer
  * **−1** for each incorrect answer
  * **0** for unanswered questions

* Subject-wise performance summary

* Chapter-wise accuracy analysis

* Response distribution charts (SVG)

* Question-by-question review

* Detailed academic solutions with step-by-step explanations

* AI-style weak topic identification for focused revision

---

## 👨‍💼 Administrative Dashboard

A dedicated administrator panel provides complete control over examination content.

Capabilities include:

* Create, update, and delete questions
* Bulk import questions using JSON
* Configure examination duration
* Modify question limits
* Manage test settings without editing source code

---

## 🔒 Examination Lockdown & Anti-Cheating Simulation

To emulate a real CBT environment, the simulator includes several exam security features:

* Disable right-click menu
* Block copy, cut, and paste operations
* Detect tab switching
* Detect window minimization
* Display warning dialogs upon suspicious activity
* Optional automatic submission after repeated violations

---

## 📷 Webcam Proctoring Simulation

An optional webcam module allows candidates to enable their local camera during the examination, simulating remote proctoring used in modern online examinations.

---

## 🛣 Modern Application Architecture

The project uses **React Router** for clean URL-based routing.

Separate routes are maintained for:

* Student Portal
* Administrator Dashboard
* Results
* Authentication

This prevents session overlap and ensures proper separation between candidate and administrator interfaces.

---

# 📁 Project Structure

```text
CUET/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── index.css
│   └── Dockerfile
│
├── backend/
│   ├── data/
│   ├── Dockerfile
│   ├── seed.js
│   └── server.js
│
├── docker-compose.yml
└── README.md
```

---

# 🔐 Demo Credentials

## 🎓 Student Login

| Field          | Value                     |
| -------------- | ------------------------- |
| Candidate Name | `Taniyea Khanam Mazumder` |
| Roll Number    | `26051004928`             |
| Password (DOB) | `09052008`                |
| Subject        | Any (Default: English)    |

---

## 🛡 Administrator Login

Enable **"Login as Administrator"** on the login screen.

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `13042007` |

---

# 🚀 Getting Started

## Prerequisites

* Node.js **v18** or **v20**
* npm

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd CUET
```

Install dependencies for both frontend and backend:

```bash
npm run install-all
```

---

## Run the Development Server

Start both services simultaneously:

```bash
npm run dev
```

Default URLs:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

# 💾 Database

The application includes a **zero-configuration storage fallback**.

If MongoDB is unavailable, the backend automatically stores application data in:

```text
backend/data/local_db.json
```

This allows the project to run immediately without additional database setup.

---

# 🌐 LAN Deployment

Host the examination platform across your local network for use on multiple devices.

## Step 1 — Find Your Local IP

On Windows:

```powershell
ipconfig
```

Locate the IPv4 address of your active network adapter.

Example:

```text
192.168.1.15
```

---

## Step 2 — Start Vite on the Network

```bash
npm run dev --prefix frontend -- --host 0.0.0.0
```

Ensure the backend is running on **port 5000**.

---

## Step 3 — Access From Other Devices

Connect every device to the same Wi-Fi network and open:

```text
http://YOUR-IP:5173
```

Example:

```text
http://192.168.1.15:5173
```

The frontend automatically communicates with the backend running on:

```text
http://YOUR-IP:5000
```

---

# 🐳 Docker Deployment

Run the complete application stack using Docker Compose.

```bash
docker compose up --build
```

This command will:

* Launch a MongoDB container
* Build and run the Express backend
* Seed the database
* Build the React frontend
* Serve the frontend through Nginx

### Services

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

# 🛠 Technology Stack

### Frontend

* React
* Vite
* React Router DOM
* Context API
* CSS3

### Backend

* Node.js
* Express.js
* MongoDB (Optional)
* Local JSON Storage Fallback

### DevOps

* Docker
* Docker Compose
* Nginx

---

# 📌 Highlights

* Pixel-inspired NTA CUET interface
* Persistent examination timer
* Advanced result analytics
* AI-style weak topic analysis
* Chapter-wise performance tracking
* Full solution review
* Admin dashboard
* Webcam simulation
* Anti-cheating mechanisms
* Local JSON fallback database
* MongoDB support
* Docker-ready deployment

---

# 👨‍💻 Developer

**Sahil Mazumder**

GitHub: **[@finding-sahil](https://github.com/finding-sahil)**

---

# 📄 License

This project is intended for **educational and practice purposes only**.

It is an independent simulation and is **not affiliated with or endorsed by the National Testing Agency (NTA)**. All trademarks and examination names belong to their respective owners.
