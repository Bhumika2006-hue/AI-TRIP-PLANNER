
# 🌍 TripGenie – AI-Powered Trip Planning Platform

TripGenie is an intelligent, AI-driven trip planning web application that helps users create personalized travel itineraries, optimize routes, and estimate budgets — all powered by Generative AI (GPT-4o-mini via Emergent LLM).
Built as a React + FastAPI + MongoDB SaaS platform, TripGenie simplifies the travel planning process with automation, personalization, and real-time data insights.

# 🔗 Live Demo: 
https://travel-genie-6.emergent.host/


---

# 🚀 Features

🧭 Core Functionalities

🧠 AI Itinerary Generator: Creates personalized day-by-day travel plans based on user preferences like destination, duration, and budget.

💬 AI Chatbot Assistant: Provides destination insights, travel tips, and AI-based recommendations using LLM-powered chat.

💸 Budget Estimator: Calculates total travel costs including flights, accommodation, and activities.

🌐 Multi-language Support: Auto-translates itineraries into 6 different languages for global travelers.

📍 Smart Route Optimization: Suggests the most efficient routes and attractions using location data.

🧳 User Dashboard: Allows users to save, edit, and manage multiple trip plans.


👤 SaaS Functionality

JWT-based user authentication & authorization

Subscription tiers (Free, Pro, Enterprise) for scalable usage

Admin dashboard for user and analytics management



---

# 🧠 Tech Stack

Backend Stack

Framework: FastAPI (Python)

Database: MongoDB (NoSQL)

Database Driver: Motor (Async MongoDB driver)

Authentication: JWT (JSON Web Tokens)

Password Hashing: bcrypt

AI Integration: Emergent LLM (OpenAI GPT-4o-mini)

API Documentation: Swagger / OpenAPI


Frontend Stack

Framework: React 18

Routing: React Router v6

UI Components: Shadcn UI (Radix UI primitives)

Styling: Tailwind CSS

Icons: Lucide React

HTTP Client: Axios

Notifications: Sonner (toast notifications)

Build Tool: Webpack (CRA with CRACO)


DevOps & Environment

Containerization: Docker

Orchestration: Kubernetes

Reverse Proxy: Nginx

Process Manager: Supervisord

Package Managers: pip (Backend), Yarn (Frontend)

Deployment: Cloud-native environment

Python Version: 3.x

Node Version: Latest LTS



---

# 🧩 Architecture Overview

Architecture Pattern: Full-stack monorepo

API Design: RESTful architecture

Authentication: JWT Bearer Tokens

Database Schema: Document-based (MongoDB collections)

AI Integration: RAG pipeline with GPT-4o-mini for intelligent responses

Deployment: Kubernetes cluster for scalability



---

⚙️ Installation & Setup

# 1️⃣ Clone the repository
git clone https://github.com/yourusername/tripgenie.git

# 2️⃣ Navigate into the project
cd tripgenie

# 3️⃣ Install backend dependencies
cd backend
pip install -r requirements.txt

# 4️⃣ Install frontend dependencies
cd ../frontend
yarn install

# 5️⃣ Set up environment variables (.env)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

# 6️⃣ Run the development servers
# Start backend
cd backend
uvicorn main:app --reload

# Start frontend
cd ../frontend
yarn start


---

🤝 Contributing

Contributions, feature requests, and ideas are welcome!
Fork this repository, make changes, and submit a pull request.


---

📬 Contact

Author: Bhumika Tewari
