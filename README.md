# MediCare AI 🩺✨

**Remix: MediCare AI** is an advanced full-stack AI health assistant. It combines cutting-edge clinical assistance, smart diagnostics visualization, personal wellness planning, and a reliable medicine tracker in a single elegant workspace. Built on modern technologies like React, Vite, Tailwind CSS, Express, and powered by the Google Gemini AI API, MediCare AI offers a highly intuitive patient experience.

---

## 🚀 Key Features

### 🩺 1. AI Clinical Assistant & Symptom Checker
*   Engage with a state-of-the-art conversational health assistant.
*   Get real-time feedback on symptoms, wellness instructions, and direct answers to health-related questions.
*   Built-in emergency/urgency detector that alerts patients to seek immediate medical attention when critical signs are present.

### 🔬 2. Medical Lab Report Analyzer
*   Upload and run comprehensive analyses on diagnostic reports, medical lab summaries, and test certificates.
*   Supports uploading images or text input.
*   Gemini AI translates technical jargon, lists values outside the standard bounds, and explains what each indicator suggests in layperson terms.

### 🍳 3. Fitness & Nutrition Planner
*   Tailored meal schedules tailored to dietary rules, restriction guidelines, and allergen targets.
*   Dynamic exercise lists optimized for age, current proficiency layers, target frequency, and equipment situations.

### 💊 4. Medicine Finder & Dosage Guide
*   Look up side effects, primary indications, interactions, and recommended dosages based on demographics and ongoing conditions.
*   Allows tracking and checking active medication schedules natively.

### ⏰ 5. Smart Medication Reminders
*   Add, edit, toggle, and view daily medication checklists.
*   Visual calendar counters that help patients manage adherence and upcoming doses.

---

## 🛠️ Technology Stack

*   **Frontend**: React (v19), Vite, Tailwind CSS (v4), Motion (Animations)
*   **Icons**: Lucide React
*   **Backend**: Express Server with tsx and esbuild
*   **Core Engine**: Google Gemini API via the official `@google/genai` SDK

---

## ⚙️ Development & Quickstart

### Prerequisites
Make sure you have a `GEMINI_API_KEY` configured. AI Studio automatically injects this secret at runtime, but for standalone setups:
1. Create a `.env` file from `.env.example`.
2. Populate `GEMINI_API_KEY="your-gemini-key"`.

### Local Execution Instructions
1.  **Dependencies**: Install local dependency arrays:
    ```bash
    npm install
    ```
2.  **Dev Mode**: Start the dual-purpose development proxy:
    ```bash
    npm run dev
    ```
    This launches the Express API server and hooks the Vite asset pipeline simultaneously on port `3000`.

3.  **Production Production Builds**:
    ```bash
    npm run build
    npm run start
    ```

---

## 🔒 Safety and Medical Disclaimer
**Remix: MediCare AI** is intended solely for informational, educational, and motivational support. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified health provider regarding medical conditions or emergency signs.
