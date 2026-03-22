# TaskFlow — Setup Guide

## Prerequisites
- Node.js 18+
- Firebase project with Firestore enabled
- OpenAI API key

## 1. Firebase Setup
1. Create a project at https://console.firebase.google.com
2. Enable Firestore Database (Start in production mode)
3. Go to Project Settings > Service Accounts > Generate new private key
4. Copy the values into `backend/.env`

## 2. Backend Setup
```bash
cd backend
npm install
# Edit .env with your Firebase + OpenAI credentials
npm run dev
```

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 4. Required Firestore Indexes
Firestore requires composite indexes for some queries. Run the app and check the console — Firebase will log index creation links automatically.

Key indexes needed:
- `tasks`: userId + order (asc)
- `tasks`: userId + completed + priority (asc)
- `tasks`: userId + projectId + order (asc)
- `projects`: userId + createdAt (asc)

## Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 3001) |
| JWT_SECRET | Secret for JWT signing (min 32 chars) |
| OPENAI_API_KEY | Your OpenAI API key |
| FIREBASE_PROJECT_ID | Firebase project ID |
| FIREBASE_PRIVATE_KEY | Service account private key |
| FIREBASE_CLIENT_EMAIL | Service account email |

## Features
- Dark theme with purple/cyan accent
- Task management with drag & drop reordering (@dnd-kit)
- Gamification: XP, levels (Iniciante > Explorador > Guerreiro > Mestre), badges, streaks
- 3 default projects: Mobile Mercado, Cripto Moeda, Projetos Pessoais
- AI: priority suggestion, weekly report, task summary (GPT-4o-mini)
- Framer Motion animations + confetti on task completion
- Fully responsive
