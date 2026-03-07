<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DocuFlow AI

DocuFlow AI is an AI-powered document generation and template management platform designed to automate and streamline your operations. 

View your app in AI Studio: https://ai.studio/apps/drive/16e15Er8eGef1FPs5thlalIkW3cpYrzkL

## 🚀 Core Features

- **Document Generation**: Harness the power of AI to automatically generate and populate fields in complex documents.
- **Template Management**: Upload, categorize, and manage your document templates in a centralized repository.
- **Brand Asset Management**: Configure workspace visual identity (primary colors, logos, letterheads) applied across all documents.
- **Team Workspaces**: Switch between different teams and manage distinct assets and templates per team.
- **AI Extraction & Review Flow**: Automated data extraction and pre-filling with user-friendly review and confirmation forms.

## 🧠 The Reasoning Loop

DocuFlow AI utilizes an advanced **Reasoning Loop** powered by Gemini to ensure high accuracy and reliability. We used **Chain-of-Thought prompting to reduce hallucinations in financial data extraction** and field mapping. By forcing the AI to break down its reasoning step-by-step before finalizing extraction, we drastically improve the fidelity of the generated documents and parsed templates, ensuring that critical data is mapped to the correct destination fields without fabrication.

## ⚠️ Current Limitations

- **API Rate limits**: The application may be subject to API rate limits.
- **Manual Field Mapping On PDF**: There may be edge cases where manually added template fields do not perfectly appear on the generated PDF export depending on browser rendering.

## 💻 Run Locally

**Prerequisites:** Node.js

This contains everything you need to run your app locally.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. Run the app:
   ```bash
   npm run dev
   ```
