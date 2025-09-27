# 🤖 AI Assistant - Intelligent Voice Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-brightgreen)](https://intelligent-voice-companion.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion)

A comprehensive AI Assistant application with advanced voice, video, and chat capabilities, powered by Google's Gemini AI. Experience seamless conversations across multiple platforms - web, desktop, and mobile.

## 🌐 Live Demo

**🚀 Try it now: [https://intelligent-voice-companion.netlify.app/](https://intelligent-voice-companion.netlify.app/)**

## ✨ Key Features

### 🎤 Advanced Voice Interaction
- **Automatic Voice Detection**: AI automatically listens when you speak (no button needed)
- **Noise Cancellation**: Advanced noise filtering for clear communication
- **Voice Activity Detection**: Smart microphone activation with audio level monitoring
- **Multiple Voice Options**: Choose from available system voices
- **Speech Rate Control**: Adjustable speaking speed
- **Auto-Speak**: Automatic reading of AI responses
- **Hands-Free Mode**: Continuous voice conversation without manual activation

### 📹 AI Vision Capabilities
- **Smart Camera Integration**: AI can see and analyze your surroundings
- **Multi-Camera Support**: Switch between front/back cameras on mobile devices
- **Automatic Image Capture**: AI captures images when you ask vision-related questions
- **Real-Time Analysis**: Live video feed processing
- **Object Recognition**: AI identifies and describes what it sees
- **Document Analysis**: Read and analyze documents, text, and images

### 💬 Enhanced Chat Experience
- **Responsive Design**: Optimized for all screen sizes (mobile to desktop)
- **Copy Functionality**: Copy AI responses with visual feedback
- **Message History**: Complete conversation tracking
- **Markdown Support**: Rich text formatting in responses
- **Real-Time Typing**: See AI responses as they're generated

### 🤖 Powered by Google Gemini 2.0 Flash
- **Latest AI Model**: Most advanced conversational AI
- **Multimodal Processing**: Text, voice, and vision understanding
- **Context Awareness**: Maintains conversation context
- **Intelligent Responses**: Natural, human-like interactions

## 🛠 Technology Stack

- **Frontend**: React 19.1.1 with modern hooks
- **Build Tool**: Vite 7.1.7 for lightning-fast development
- **Styling**: Tailwind CSS 4.1.13 with custom responsive breakpoints
- **AI Integration**: Google Gemini API
- **Voice Processing**: Web Speech API with Web Audio API
- **Cross-Platform**:
  - Web (all browsers)
  - Desktop (Electron)
  - Mobile (Android with Capacitor)

### Web APIs Used
- **Speech Recognition API**: Voice input processing
- **Speech Synthesis API**: AI voice output
- **Web Audio API**: Audio level monitoring and noise detection
- **MediaDevices API**: Camera and microphone access
- **Canvas API**: Image capture and processing

## 🚀 Quick Start

### 1. Online Demo (Recommended)
Visit [https://intelligent-voice-companion.netlify.app/](https://intelligent-voice-companion.netlify.app/) - no installation required!

### 2. Local Development

```bash
# Clone the repository
git clone https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion.git
cd ai-assistant-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### 3. API Key Setup
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the **Settings** gear icon in the app
3. Enter your API key and save

## 📱 Platform Support

### 🌐 Web Browser
- **Live**: [https://intelligent-voice-companion.netlify.app/](https://intelligent-voice-companion.netlify.app/)
- **Compatible**: Chrome, Edge, Safari, Firefox (latest versions)
- **Features**: Full functionality including voice and video

### 🖥 Desktop App (Electron)
```bash
# Run desktop app
npm run electron

# Build Windows executable
npm run dist:win
```
**Features**: Native desktop experience with keyboard shortcuts and system menus

### 📱 Android App (Capacitor)
```bash
# Build for Android
npm run build
npx cap sync
npx cap open android
```
**Features**: Native mobile experience with camera switching and voice interaction

## 🎮 How to Use

### Voice Interaction (Automatic)
1. **Start Speaking**: AI automatically detects when you begin talking
2. **Natural Conversation**: No buttons needed - just speak naturally
3. **Voice Responses**: AI responds with both text and speech
4. **Noise Handling**: Advanced filtering eliminates background noise

### AI Vision
1. **Camera Access**: Grant camera permissions when prompted
2. **Ask Visual Questions**: "What do you see?" or "Read this text"
3. **Automatic Capture**: AI captures images when needed
4. **Camera Switching**: Use camera switch button on mobile devices

### Text Chat
1. **Type Messages**: Use the input field for text conversations
2. **Copy Responses**: Click copy button on any AI response
3. **Responsive Interface**: Works perfectly on any screen size

## 🛠 Available Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build optimized production version
npm run preview      # Preview production build locally

# Desktop (Electron)
npm run electron     # Run desktop app
npm run electron:dev # Run desktop app with development features
npm run dist:win     # Build Windows executable

# Mobile (Android)
npx cap sync         # Sync web assets to native project
npx cap run android  # Run on connected Android device
npx cap open android # Open in Android Studio
```

## 🔧 Technical Features

### Advanced Voice Processing
- **Adaptive Noise Floor**: Dynamic background noise detection
- **Voice Activity Detection**: RMS audio analysis for speech detection
- **Anti-Feedback**: Prevents AI from responding to its own speech
- **Timeout Management**: Smart microphone activation timing

### Responsive Design
- **Custom Breakpoints**: xs (475px), sm, md, lg, xl, 2xl
- **Mobile-First**: Optimized for touch interfaces
- **Desktop Features**: Full header, keyboard shortcuts, native menus
- **Cross-Device**: Seamless experience across all devices

### Production Ready
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Performance Optimized**: Lazy loading and efficient rendering
- **Cross-Browser**: Tested on all major browsers
- **PWA Ready**: Installable web app capabilities

## 📖 Documentation

- **[Blank Screen Fix Guide](BLANK-SCREEN-FIX.md)**: Troubleshooting production builds
- **[Electron Build Guide](ELECTRON-BUILD-GUIDE.md)**: Desktop app development and distribution

## 🚨 Browser Requirements

### Recommended
- **Chrome/Edge**: Full feature support including voice recognition
- **Safari**: Full support on macOS and iOS
- **Firefox**: Good support with some voice limitations

### Required Permissions
- **Microphone**: For voice input
- **Camera**: For AI vision features
- **Notifications**: For system alerts (optional)

## 🔗 Links

- **🌐 Live Demo**: [https://intelligent-voice-companion.netlify.app/](https://intelligent-voice-companion.netlify.app/)
- **📂 GitHub Repository**: [https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion](https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion)
- **🤖 Google Gemini**: [https://ai.google.dev/](https://ai.google.dev/)

## 🚀 Recent Updates

### Latest Features
- ✅ Automatic voice detection (no manual activation needed)
- ✅ Advanced noise cancellation and audio processing
- ✅ AI vision with camera switching on mobile devices
- ✅ Responsive design for all screen sizes
- ✅ Desktop app with native features
- ✅ Android app with Capacitor
- ✅ Copy functionality with visual feedback
- ✅ Error boundaries and graceful error handling
- ✅ Production build fixes for deployment

### Platform Availability
- ✅ **Web**: Deployed on Netlify
- ✅ **Desktop**: Electron app ready
- ✅ **Android**: Capacitor build configured
- ✅ **GitHub**: Full source code available

---

**🎯 Experience the future of AI interaction: [Try it now!](https://intelligent-voice-companion.netlify.app/)**

*Built with ❤️ using React, Vite, Tailwind CSS, and Google Gemini AI*