# VisualDash Chatbot

A modern chatbot application built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Component Library**: Rich set of UI components using Radix UI
- **Responsive Design**: Mobile-first approach with smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components
- **Build Tool**: Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── ChatList.tsx    # Chat list component
│   │   ├── ChatWindow.tsx  # Chat window component
│   │   ├── MessageInput.tsx # Message input component
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/           # React contexts (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with TypeScript

## Development

The application is built with modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components

## Production

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment. 