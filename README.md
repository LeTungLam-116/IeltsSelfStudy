<h1 align="center">
  <br>
  <img src="docs/home_page.png" width="400">
  <br>
  IELTS Self-Study Platform
  <br>
</h1>

<h4 align="center">An AI-powered IELTS preparation platform built with Clean Architecture.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=flat&logo=dotnet" alt=".NET 8">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/OpenAI-Whisper/GPT--4o--mini-412991?style=flat&logo=openai" alt="OpenAI">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/SQL%20Server-2022-CC2927?style=flat&logo=microsoft-sql-server" alt="SQL Server">
</p>

## 📌 Overview
This project is an automated IELTS self-study system designed to help learners (Band 3.5 - 6.0) improve their 4 skills: Reading, Listening, Speaking, and Writing. The system leverages **OpenAI (GPT-4o-mini & Whisper)** for real-time grading, speech-to-text conversion, and providing personalized feedback for subjective skills like Speaking and Writing.

The backend is strictly built upon **Clean Architecture** patterns, ensuring high maintainability, testability, and separation of concerns.

## ✨ Key Features
- **🤖 AI-Powered Grading:** Automated grading for Writing and Speaking tests with detailed grammar correction and vocabulary suggestions using OpenAI APIs.
- **🗣️ Speech-to-Text Integration:** Real-time audio recording and transcription using the Whisper model.
- **📈 Personalized Roadmap:** A dynamic Placement Test workflow that evaluates the user's overall band and generates a month-by-month study roadmap.
- **🔐 Robust Security:** Role-based Access Control (RBAC) with secure JWT Authentication & Refresh Tokens.
- **☁️ Cloud Storage:** Seamless multi-media file upload management using Cloudinary.

## 🏗️ System Architecture
The backend follows the principles of **Clean Architecture** to maintain a scalable structure:
1. **Domain Layer:** Contains core business entities (`User`, `Course`, `Attempt`, etc.) and exceptions.
2. **Application Layer:** Contains business logic, Use Cases, DTOs, and Interfaces.
3. **Infrastructure Layer:** Implements Data Access (Entity Framework Core), External Services (OpenAI API, Cloudinary).
4. **Presentation/API Layer:** HTTP endpoints (Controllers, Middlewares) interacting with the Client.

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- SQL Server

### Backend Setup
1. Clone the repository and navigate to the API directory:
   ```bash
   cd IeltsSelfStudy.Api
   ```
2. Update the `appsettings.json` with your credentials:
   - Database Connection String
   - JWT Secret Key
   - OpenAI API Key
   - Cloudinary Configuration
3. Run Entity Framework Migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the project:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd frontend/ielts-selfstudy-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📸 Screenshots
| Landing Page | Placement Test & Roadmap |
| :---: | :---: |
| <img src="docs/home_page.png" width="400"> | <img src="docs/score_roadmap.png" width="400"> |

| AI Writing Feedback | Admin Dashboard |
| :---: | :---: |
| <img src="docs/feedback_writting.png" width="400"> | <img src="docs/admin_dashbroad.png" width="400"> |

## 👨‍💻 Author
**Lê Tùng Lâm** - .NET Developer
- Email: tuglam1164@gmail.com

---
⭐️ If you found this project helpful, please give it a star!
