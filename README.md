# 📚 BookSphere - Digital Library Management System

![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=github)
![MERN Stack](https://img.shields.io/badge/MERN_Stack-Powered-blue?style=for-the-badge&logo=react)
![API](https://img.shields.io/badge/API-Brevo_Integrated-orange?style=for-the-badge)

**BookSphere** is a premium, full-stack Digital Library Management System built with the MERN stack (MongoDB, Express, React, Node.js). It streamlines library operations, book borrowing, fine management, and role-based access for Admins, Librarians, and Members through a modern, fully responsive UI.

🌐 **Live Demo:** [khushboo164.github.io/Digital_Library_Management_system](https://khushboo164.github.io/Digital_Library_Management_system/)

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Dedicated portals and dashboards for `Admin`, `Librarian`, and `Member`.
- **Book & Inventory Management:** Add, update, delete, and track available/total copies of books seamlessly.
- **Smart Borrowing System:** Members can request books, track due dates, and monitor fines. Librarians can approve/reject requests and handle returns.
- **Automated Notifications & Emails:** Integrated with **Brevo API** for sending OTPs, warning emails, and custom notifications instantly.
- **Analytics & Dashboard:** Real-time statistics, transaction timelines, and collection insights for library staff.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router, Context API, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs
- **Email Delivery:** Brevo API (HTTP integration)
- **Deployment:** GitHub Pages (Frontend), Render (Backend)

---

## 💡 Demo Mode / Test Credentials

To test the application quickly, you can use the following default bypass credentials:

**Registration OTP Bypass:** 
Use the code **`123456`** when verifying a new email address.

**Staff Codes:**
- Admin Access Code: **`ADMIN2026`**
- Librarian Access Code: **`LIB2026`**

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Khushboo164/Digital_Library_Management_system.git
cd Digital_Library_Management_system
```

### 2. Setup Backend
```bash
cd server
npm install
# Create a .env file based on environment variables
npm start
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```
