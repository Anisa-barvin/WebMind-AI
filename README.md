<!-- # WebMind AI — Grounded RAG Website Chatbot

WebMind AI is a full-stack RAG (Retrieval-Augmented Generation) platform that transforms static website URLs into conversational AI assistants. Users can submit URLs, crawl them recursively, generate semantic text chunk embeddings using Google's Gemini API, store vectors in ChromaDB (with a fallback search engine in MongoDB), and interact with a grounded chatbot complete with source citations, charts, and administrative analytics.

---

## 🚀 Key Features

*   **Recursively Crawler**: Dual-engine crawler (Fast `cheerio` parsing with a headless browser `puppeteer` fallback for JavaScript-heavy single-page apps) targeting the same domain (max 50 pages).
*   **Semantic Segmentation**: Clean text chunking with overlay buffers (800 chars, 150 chars overlap) to retain contextual continuity.
*   **Google Gemini RAG Pipeline**:
    *   Generates a structured website summary (Executive Summary, Topics, Services, Key Info) returned in clean JSON.
    *   Generates grounded chat answers using `gemini-1.5-flash` model context restrictions (prevents hallucinations).
*   **Dual-Mode Vector Store**:
    *   **ChromaDB Mode**: High-performance local index store using `@chromadb/chromadb`.
    *   **MongoDB Fallback Mode**: If ChromaDB is unavailable or unconfigured, the system automatically falls back to MongoDB chunk storage and calculates cosine vector similarity in-memory using JavaScript.
*   **Server-Sent Events (SSE) Streaming**: Chatbot responses stream chunk-by-chunk to the client in real-time, displaying grounding source citations alongside the text.
*   **Premium Visual Dashboard**: Dark slate aesthetic accented with indigo, purple, and cyan glassmorphism panels. Features interactive Recharts analytics, system logs, quick-links, and responsive controls.

---

## 🛠️ Technology Stack

*   **Backend**: Node.js, Express, MongoDB (Mongoose), Google Gemini API (`@google/generative-ai`), ChromaDB (`chromadb`), Cheerio, Puppeteer.
*   **Frontend**: React (v19), Vite (v8), Tailwind CSS (v4), Axios, Lucide React, Recharts, React Router.

---

## 📂 Codebase Directory Structure

```text
d:\WebMind\
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── analyticsController.js # Aggregations for user activity charts
│   │   ├── authController.js      # User registration, login, and profile metrics
│   │   ├── chatController.js      # Conversations history, chat response, and SSE streaming
│   │   └── websiteController.js   # Background web training pipeline orchestration
│   ├── middleware/
│   │   └── authMiddleware.js      # Express JWT validation middleware
│   ├── models/
│   │   ├── Chunk.js               # Embeddings chunk schema
│   │   ├── Conversation.js        # Chat sessions tracking
│   │   ├── CrawledPage.js         # Raw HTML-extracted page contents
│   │   ├── Message.js             # Chat messages with citations array
│   │   ├── User.js                # Encrypted login profile
│   │   └── Website.js             # Website status, pages count, and summaries
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── websiteRoutes.js
│   ├── services/
│   │   ├── crawlerService.js      # Recursive cheerio scraper and Puppeteer fallback
│   │   ├── embeddingService.js    # Gemini API text-embedding-004 vector creator
│   │   ├── geminiService.js       # Grounded prompt template and generative responses
│   │   └── vectorStoreService.js  # Dual index orchestrator (ChromaDB + MongoDB similarity fallback)
│   ├── tests/
│   │   └── verifyServices.js      # Local validation script for core pipeline
│   ├── .env                       # Local secrets (PORT, MONGODB_URI, GEMINI_API_KEY, etc.)
│   ├── package.json
│   └── server.js                  # Entry point
└── frontend/
    ├── src/
    │   ├── components/            # protected routes, loading widgets, toast messages
    │   ├── context/
    │   │   └── AuthContext.jsx    # React state holding login profile/tokens
    │   ├── layouts/
    │   │   └── DashboardLayout.jsx# Responsive sidebar navigation framework
    │   ├── pages/
    │   │   ├── LandingPage.jsx    # Glowing marketing landing page
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── Dashboard.jsx      # Activity charts and quick access actions
    │   │   ├── WebsiteTraining.jsx# Real-time console logs during URL crawling
    │   │   ├── WebsiteManagement.jsx
    │   │   ├── ChatInterface.jsx  # Grounded chat board with collapsible sources sidebar
    │   │   └── Analytics.jsx      # Recharts graphs covering requests over time
    │   ├── services/
    │   │   └── api.js             # Axios base connector
    │   ├── App.jsx                # Router endpoints mapping
    │   └── index.css              # Custom Tailwind v4 styling theme and animations
    ├── vite.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Installation & Configuration

### Prerequisites

*   **Node.js**: v18 or higher recommended.
*   **MongoDB**: Run locally or configure a connection string (e.g. MongoDB Atlas).
*   **ChromaDB** *(Optional)*: If running ChromaDB locally on port `8000`, the server will index vectors directly. If not running, it automatically switches to MongoDB vector calculations.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/webmind
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_google_gemini_api_key
   CHROMA_URL=http://localhost:8000
   NODE_ENV=development
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development build:
   ```bash
   npm run dev
   ```
   The Vite interface will start running on `http://localhost:5173`.

---

## 🧪 Testing and Verification

### Services Validation Script
A mock script is provided to verify chunking, cosine vector matching, and crawler extraction outside the API layer:
```bash
cd backend
node tests/verifyServices.js
```

### Running Locally
To test the web flow:
1. Start the backend: `npm run start` or `npm run dev` in `backend/`.
2. Start the frontend: `npm run dev` in `frontend/`.
3. Open `http://localhost:5173/` in a browser.
4. Register a test user, train on `https://example.com`, and test grounding capabilities. -->


# 🚀 WebMind AI

<p align="center">

<img src="screenshots/landing-page.png" width="100%">

</p>

<h3 align="center">
AI-Powered RAG Website Chatbot Platform
</h3>

<p align="center">
Transform any website into an intelligent AI assistant using Retrieval-Augmented Generation (RAG), semantic search, and Google Gemini.
</p>

# 📌 Project Overview

WebMind AI is a modern SaaS platform that allows users to train AI on any public website.

Simply provide a website URL.

The system automatically:

• Crawls the website

• Extracts content

• Splits into chunks

• Generates embeddings

• Stores vectors

• Creates an AI assistant

• Lets users chat with the website using RAG.


# 🎯 Problem Statement

Modern websites contain thousands of pages.

Users often spend significant time searching for information.

Traditional keyword search cannot understand context.

Businesses also struggle to provide instant customer support.

A semantic AI chatbot is needed to understand website content and answer questions accurately.



# 💡 Solution

WebMind AI uses Retrieval-Augmented Generation (RAG).

The platform:

✔ Crawls websites

✔ Cleans HTML

✔ Creates embeddings

✔ Stores vectors inside ChromaDB

✔ Retrieves relevant chunks

✔ Uses Google Gemini to generate grounded answers

✔ Provides AI chat with citations


# ✨ Features

✅ Website Crawling

✅ Automatic Content Extraction

✅ AI Generated Embeddings

✅ Vector Database Storage

✅ Semantic Search

✅ Google Gemini Integration

✅ AI Chat Assistant

✅ Documentation Generator

✅ Website Analytics

✅ Authentication

✅ User Dashboard

✅ Training Progress

✅ Dark Mode

✅ Light Mode

✅ Responsive UI

✅ MongoDB Atlas

✅ JWT Authentication

✅ Chat History

✅ Executive Summary

✅ Training Report

✅ Multi-page Website Support



# 🖼 Screenshots

## Landing Page

![Landing](screenshots/landing.png)

---

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Train Website

![Train](screenshots/train.png)

---

## Manage Sites

![Manage](screenshots/manage.png)

---

## AI Chat

![Chat](screenshots/chat.png)

---

## Documentation

![Docs](screenshots/documentation.png)

---

## Analytics

![Analytics](screenshots/analytics.png)

---

## Profile

![Profile](screenshots/profile.png)


# 🏗 System Architecture

![Architecture](screenshots/architecture.png)


# ⚙ Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Axios

## Backend

- Node.js
- Express.js
- LangChain
- Cheerio

## AI

- Google Gemini API
- Gemini Embeddings

## Vector Database

- ChromaDB

## Database

- MongoDB Atlas

## Authentication

- JWT Authentication

# 📂 Project Structure

```text
WebMind-AI
│
├── client
├── server
├── screenshots
├── README.md
├── package.json
└── .env
```

# 🚀 Installation

```bash
git clone https://github.com/Anisa-barvin/WebMind-AI.git

cd WebMind-AI

npm install
```

# 🔧 Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret

GEMINI_API_KEY=your_api_key
```

# ▶ Usage

1. Register/Login

2. Enter Website URL

3. Train Website

4. Generate Embeddings

5. View Executive Summary

6. Open AI Chat

7. Ask Questions

8. Download Documentation

9. View Analytics

# 🧠 RAG Pipeline

Website URL

↓

Crawler (Cheerio)

↓

HTML Cleaning

↓

Text Chunking

↓

Gemini Embeddings

↓

ChromaDB Vector Store

↓

Semantic Retrieval

↓

Gemini LLM

↓

AI Response


# 📈 Future Enhancements

- PDF Support
- DOCX Support
- Sitemap Crawling
- Image Understanding
- OCR
- Multi-language Support
- Voice Chat
- Team Workspaces
- API Integration
- Cloud Deployment


# 👩‍💻 Developed By

**Anisa Barvin**

B.Tech Information Technology

Sri Shakthi Institute of Engineering and Technology

# 📄 License

This project is developed for educational and placement purposes.