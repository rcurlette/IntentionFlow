# 🧠⚡ FlowTracker

An intention-based productivity app designed to help you achieve flow state and maximize your daily output.

## ✨ Features

### Core Productivity System

- **🌅 Morning/Afternoon Split**: Organize your day into strategic time periods
- **🧠 Brain vs Admin Tasks**: Categorize work into deep focus vs routine tasks
- **🍅 Pomodoro Integration**: Built-in focus timer for flow state sessions
- **📊 Progress Tracking**: Visual analytics and "don't break the chain" motivation
- **🎯 Daily Intentions**: Evening planning for tomorrow's success

### Flow State Optimization

- **⚡ First Hour Planning**: Prep your most productive hour the night before
- **🌊 Flow State Tracking**: Monitor your deep work sessions
- **🚫 Distraction Minimization**: Tools to help you stay focused
- **💪 Positive Reinforcement**: Motivational messages and achievement system

### Design Philosophy

- **🎨 Energetic & Vibrant**: Motivating color scheme with purple, orange, and blue
- **😊 Light & Fun**: Emojis and encouraging interface design
- **📱 Responsive**: Works beautifully on all devices
- **🚀 Modern**: Built with the latest web technologies

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router 6
- **Styling**: TailwindCSS with custom productivity color system
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite
- **State Management**: Local Storage (with future Supabase integration planned)
- **Icons**: Lucide React
- **Testing**: Vitest

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm, yarn, or pnpm

### Installation

1. **Clone and install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser** to `http://localhost:5173`

### Environment Variables (Optional)

Copy `.env.example` to `.env.local` for future integrations:

```bash
cp .env.example .env.local
```

Currently, the app works entirely with local storage - no backend required!

## 📖 How to Use FlowTracker

### 1. Daily Planning

- Start your day by adding tasks to **Morning** and **Afternoon** sections
- Categorize tasks as:
  - 🧠 **Brain Tasks**: Development, creative work, complex problem-solving
  - 📋 **Admin Tasks**: Emails, meetings, routine administrative work

### 2. Setting Intentions

- Use the evening before to plan tomorrow's first hour
- Add resources, documentation links, or project files you'll need
- Set your daily focus and prepare your workspace

### 3. Flow State Sessions

- Use the Pomodoro timer for focused work sessions
- Track your flow state and minimize distractions
- Celebrate completions with motivational feedback

### 4. Progress Tracking

- Monitor daily completion rates
- Track your productivity streak
- View analytics on your work patterns

## 🎨 Design System

### Color Palette

- **Primary**: Purple (`#8B5CF6`) - Main brand color
- **Energy**: Orange (`#F59E0B`) - Motivational and energetic elements
- **Focus**: Blue (`#3B82F6`) - Brain tasks and deep work
- **Admin**: Green (`#10B981`) - Administrative tasks
- **Morning**: Yellow (`#FCD34D`) - Morning time period
- **Afternoon**: Purple (`#A855F7`) - Afternoon time period

### Typography & Animations

- Clean, modern typography for readability
- Subtle animations for motivation (pulse, wiggle, celebration)
- Responsive design with mobile-first approach

## 📁 Project Structure

```
src/
├── components/
│   ├── app/              # App-specific components
│   │   ├── Navigation.tsx
│   │   ├── TaskCard.tsx
│   │   └── QuickStart.tsx
│   └── ui/               # Reusable UI components (Radix-based)
├── lib/
│   ├── utils.ts          # General utilities
│   ├── storage.ts        # Local storage management
│   └── productivity-utils.ts  # App-specific utilities
├── pages/
│   ├── Dashboard.tsx     # Main dashboard (fully implemented)
│   ├── Tasks.tsx         # Task management (placeholder)
│   ├── Pomodoro.tsx      # Focus timer (placeholder)
│   ├── Analytics.tsx     # Progress tracking (placeholder)
│   └── Settings.tsx      # App settings (placeholder)
├── types/
│   └── index.ts          # TypeScript type definitions
└── App.tsx               # Main app with routing
```

## 🛣 Roadmap

### Phase 1 (Current)

- ✅ Basic task management with morning/afternoon split
- ✅ Brain vs admin task categorization
- ✅ Local storage persistence
- ✅ Energetic, motivational design
- ✅ Responsive layout

### Phase 2 (Next)

- 🍅 Full Pomodoro timer implementation
- 📊 Detailed analytics and progress charts
- 🏆 Achievement system and gamification
- 📝 Evening reflection prompts
- 🔗 First hour resource management

### Phase 3 (Future)

- 🔐 Google OAuth authentication
- ☁️ Supabase backend integration
- 👥 "Over the shoulder" sharing features
- 📱 Mobile app (React Native)
- 🔄 Cross-device synchronization
- 📧 Email/Slack integration for "Later Bird" tasks

## 🤝 Contributing

This project is designed to be easily customizable and extensible. Key areas for contribution:

1. **Pomodoro Timer**: Implement the full focus timer with breaks
2. **Analytics**: Add charts and progress visualization
3. **Achievement System**: Gamification and motivation features
4. **Export/Import**: Data portability features
5. **Integrations**: Third-party app connections

## 📄 License

This project is built on the Fusion Starter template and is available under the MIT License.

## 🙏 Acknowledgments

- Built with [Fusion Starter](https://github.com/your-repo/fusion-starter)
- UI components powered by [Radix UI](https://radix-ui.com)
- Icons by [Lucide](https://lucide.dev)
- Inspired by productivity methodologies like Pomodoro Technique and Flow State research

---

**Start your productive journey today! 🚀✨**

For questions or suggestions, feel free to open an issue or contribute to the project.
