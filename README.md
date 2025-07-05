# 🏫 Workshop Feedback & Certificate System

A full-stack web application to manage workshop feedback and automatically generate and send certificates to participants via **Email** and **WhatsApp**.

Built with **React + TypeScript** (Frontend) and **Firebase** (Auth, Firestore, Storage, Cloud Functions).

---

## 🚀 Features

- 🔐 OTP verification for Email & Phone (Firebase Auth)
- 📝 Feedback form with autosave and progress tracking
- 📄 Dynamic certificate generation (PDF)
- 📧 Certificate delivery via Email (Nodemailer)
- 📱 Certificate delivery via WhatsApp (Business API)
- 📊 Admin Dashboard with:
  - Workshop form creation
  - Certificate template upload & positioning
  - Feedback submissions view & search

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/workshop-system.git
cd workshop-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

Create a `.env` file in the root directory and add:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-msg-id
VITE_FIREBASE_APP_ID=your-app-id
```

You can get these from your Firebase project settings.

---

## 🌐 Deployment (Firebase Hosting)

```bash
npm run build
firebase deploy
```

Make sure Firebase CLI is set up and you're logged in.

---

## 📖 User Guide

### 👩‍🎓 Student Flow

1. Open workshop-specific feedback link
2. Fill feedback form
3. Verify email + phone via OTP
4. Submit form
5. Certificate is emailed & WhatsApped automatically

### 👨‍💼 Admin Flow

1. Login via email/password (manual admin setup in Firestore)
2. Create new workshop form
3. Upload certificate template and place dynamic fields
4. View feedback submissions per workshop

---

## 📂 Folder Structure

```
src/
├── components/          # UI components
├── pages/               # Route-based pages
├── utils/               # Firebase, OTP, certificate generation, etc.
├── context/             # Auth context
├── tests/               # Test files
└── App.tsx              # App routing and layout
```

---

## 📑 API Documentation

### Firebase Firestore Collections

- `users`: admin credentials (`uid`, `role: "admin"`)
- `workshops`: workshop form metadata (`college`, `date`, `isActive`, etc.)
- `certificateTemplates`: template `downloadURL`, `fieldPositions`, `workshopId`
- `submissions`: feedback entries with attached `certificateURL`

---

## 🔐 Authentication

- Email & Phone OTPs are validated before form submission
- Admin login is restricted using Firebase Auth + Firestore `role` field

---

## 📦 Technologies Used

- React 19 + TypeScript
- Firebase (Auth, Firestore, Storage, Cloud Functions)
- Tailwind CSS
- Jodit Rich Text Editor
- Nodemailer (Email certificates)
- WhatsApp Business API (Certificate delivery)

---

## 👨‍💻 Author

**Devansh Raghav**  
[GitHub](https://github.com/devansh373) • [LinkedIn](https://www.linkedin.com/in/devansh-raghav-b14690231/)

---

## 📝 License

This project is for educational purposes and may be modified for personal or institutional use.

## Repo Link

[GitHub](https://github.com/dev-brnMntrs-wc) 