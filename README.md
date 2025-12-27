# AI Knowledge Base - Chat with URLs

A modern application that allows you to save URLs, automatically extract their content using AI, and chat with that content to get intelligent answers.

## 🚀 Features

- ✨ **Modern & Aesthetic Interface** - Dark mode design with gradients and smooth animations.
- 🔗 **URL Management** - Add URLs and let AI extract and categorize content automatically.
- 🛠️ **Manual Control** - Option to manually categorize and tag URLs, skipping AI processing for faster adding.
- ✏️ **Edit & Organize** - Easily edit categories and **delete tags** directly from the list view.
- 💬 **AI Chat** - Ask questions based specifically on the content of your saved URLs.
- 🗂️ **Smart Categorization** - Default "Product" category with AI fallback for automatic classification.
- 🔍 **Search & Filters** - Quickly find links with improved category and tag filters.
- 💾 **Cloud Persistence** - Data securely stored in Firebase Firestore.
- 📱 **Responsive Design** - Works perfectly on mobile and desktop.

## 🛠️ Tech Stack

- **React** + **Vite** - Fast and modern frontend framework.
- **Firebase Firestore** - Real-time NoSQL database.
- **OpenAI (GPT-4o-mini)** - Powering content extraction, summarization, and chat context.
- **Lucide React** - Beautiful, consistent icons.

## 📋 Prerequisites

1. **Node.js** (version 16 or higher)
2. **Firebase Account** (Free tier works)
3. **OpenAI API Key**

## ⚙️ Setup

### 1. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project.
3. Register a web app in the project settings.
4. Copy your Firebase configuration.
5. Create a `.env` file (see `.env.example`) or update `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

6. Enable **Firestore Database** in the console and start in "Test Mode".

### 2. Configure OpenAI

1. Get your API Key from [OpenAI Platform](https://platform.openai.com/api-keys).
2. Add it to your `.env` file:

```env
VITE_OPENAI_API_KEY=your_sk_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📖 How to Use

### Adding URLs

1. Go to the "Manage URLs" tab.
2. Paste a link.
3. (Optional) Select a **Category** or add **Tags** manually.
4. Click "Add Link". The AI will process the rest if fields are left empty.

### Managing Content

- **Delete Link**: Click the trash icon.
- **Change Category**: Click on the category badge to select a new one.
- **Remove Tag**: Click the 'x' button next to any tag to remove it.

### Chatting with AI

1. Switch to the "Chat with AI" tab.
2. Ask a question.
3. The AI will answer using **only** the knowledge from your saved links, citing sources.

## 🔒 Security Note

⚠️ **IMPORTANT**: API keys are currently exposed in the client code for demonstration/personal ease of use. For a production environment:

1. Move AI calls to a backend (Node.js/Express, Firebase Functions, or Next.js API routes).
2. Secure Firestore with proper security rules.

## 📄 License

MIT

---

Built with ❤️ using React, Firebase, and OpenAI.
