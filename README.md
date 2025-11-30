# No Signal - Community Event Platform

A modern web app for discovering and creating local events, with personalized AI-powered recommendations.

## 🎯 Features

- **Firebase Authentication**: Login/Sign Up with email and password
- **Custom Survey**: Fill out your profile for personalized recommendations
- **Custom Feed**: See recommended events based on your preferences
- **CRUD Events**: Create, view, edit, and delete events
- **Gemini API Integration**: Smart recommendations using AI
- **Modern Design**: Vibrant purple-yellow gradient with subtle animations

## 🛠️ Technologies used

- **React 18** with TypeScript
- **Vite** for build and development
- **Firebase**:
- Authentication (Email/Password)
- Realtime Database
- **Google Gemini API** for AI recommendations
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation

## 📋 Requirements

- Node.js (v18 or newer)
- npm or yarn
- Firebase account (for Authentication and Realtime Database)
- Google Gemini API Key (for AI recommendations)

## 🚀 Installation and Configuration

### 1. Clone the repository

```bash
git clone https://github.com/imm1h01/fara-semnal.git
cd fara-semnal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project and fill it with your values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-pro
```

#### How to get the values ​​for Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select one existing
3. In project settings, find the required values ​​in the "Your apps" section
4. Enable **Authentication** (Email/Password) and **Realtime Database** from the console

#### How to get the Gemini API key:

1. Access [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to `.env`

### 4. Start the application

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project structure

```
src/
├── components/ # Reusable components
│ ├── EventCard.tsx
│ ├── Navbar.tsx
│ └── QuestionnaireModal.tsx
├── pages/ # Application pages
│ ├── Index.tsx # Landing page
│ ├── Auth.tsx # Login/Sign up
│ ├── Dashboard.tsx # Custom Feed
│ ├── AllEvents.tsx # All Events
│ ├── CreateEvent.tsx # Create Event
│ └── EventDetails.tsx # Event Details
├── context/ # API Context for State Management
│ └── AuthContext.tsx
├── services/ # Services for External APIs
│ ├── firebase.ts
│ └── gemini.ts
├── hooks/ # Custom React hooks
├── lib/ # Utilities and Helpers
└── App.tsx # Main Component
```

## 🎨 Design System

The application uses a design system based on:

- **Main Gradient**: Purple (#9333ea) → Yellow (#fbbf24)
- **Animations**: Fade-in, slide-up, hover effects
- **Components**: Custom Shadcn/ui with custom variants
- **Responsive**: Mobile and optimized design desktop

## 🔐 Security

- All sensitive variables are in `.env` (not committed to Git)

- Firebase Rules must be configured for data protection
- Input validation on client and server

## 📝 Recommended Firebase Rules

For Realtime Database, add these rules in Firebase Console:

```json
{
"rules": {
"users": {
"$uid": {
".read": "$uid === auth.uid",
".write": "$uid === auth.uid"
}
},
"events": {
".read": "auth != null",
"$eventId": {
".write": "auth != null && (!data.exists() || data.child('creatorId').val() === auth.uid)"
}
}
}
```

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

## 🆘 Support

If you encounter problems:

1. Check that all `.env` variables are set correctly
2. Make sure Firebase Authentication and Realtime Database are enabled
3. Check that the Gemini API key is valid
4. Consult the Firebase and Google AI documentation

---

Created with ❤️ using React, Firebase and Google Gemini AI