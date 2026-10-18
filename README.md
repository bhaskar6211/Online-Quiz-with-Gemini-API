# Online Quiz with Gemini API

An interactive topic-driven quiz and examination web application built with **Vue 3**, **Vite**, and **Google Gemini API**.

Developed by **BHASKAR SAH**.

---

## ✨ Features

- **Strictly Topic-Focused Questions**: Enter any topic (e.g. *Python*, *JavaScript*, *World History*, *Quantum Physics*), and questions are generated specifically for that topic using Gemini API.
- **System Stored Topics**: Built-in stored topic banks covering *JavaScript*, *Python*, *Vue.js*, *React*, *HTML & CSS*, *SQL & Databases*, *World History*, *World Geography*, *Science & Biology*, and *Space & Astronomy*.
- **Configurable Question Count**: Select 5, 10, 15, 20 questions or enter any custom count between 1 and 50.
- **Candidate Registration**: Name and Gmail verification before starting the examination.
- **Executive Score Report**:
  - Radial animated percentage score gauge.
  - KPI metric cards: Correct, Incorrect, Duration, Pace per question.
  - Performance grade assessment (*Distinction*, *Merit*, *Pass*, *Needs Review*).
- **Verified Certificate of Completion**: Clean printable/PDF-ready certificate with unique credential ID and verification authority.
- **Answer Review with Explanations**: Review all questions with candidate answers, correct answers, and educational explanations.
- **White Theme**: Elegant, modern, distraction-free white theme design.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/bhaskar6211/Online-Quiz-with-Gemini-API.git
cd Online-Quiz-with-Gemini-API
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Gemini API Key
Create a `.env` file in the root directory:
```env
VITE_GOOGLE_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Framework**: Vue 3 (Composition API `<script setup>`)
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI SDK (`gemini-3.8-flash`)
- **Styling**: Modern CSS Design System (White Theme)
- **Author**: BHASKAR SAH
