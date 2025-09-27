# AI Assistant - React + Vite + Tailwind CSS 4.0

A comprehensive AI Assistant application with voice, video, and chat capabilities, powered by Google's Gemini AI.

## ✨ Features

### 🎤 Voice Features
- **Voice Chat**: Real-time speech recognition and text-to-speech
- **Voice Calls**: Hands-free conversation with AI
- **Multiple Voices**: Choose from available system voices
- **Speech Rate Control**: Adjust speaking speed
- **Auto-speak**: Automatic reading of AI responses

### 📹 Video Features
- **Video Calls**: Full video chat with AI vision capabilities
- **Camera Control**: Start/stop camera, switch between multiple cameras
- **Image Analysis**: AI can see and analyze what you show it
- **Real-time Processing**: Live video feed analysis

### 💬 Chat Features
- **Text Chat**: Traditional messaging interface
- **Message History**: Full conversation tracking
- **Copy Conversations**: Export chat history
- **Timestamp Tracking**: Message timing information

### 🤖 AI Capabilities
- **Google Gemini 2.0 Flash**: Latest AI model integration
- **Multimodal**: Text, voice, and vision processing
- **Context Awareness**: Maintains conversation context
- **Image Understanding**: Analyzes photos and video feeds

## 🛠 Technology Stack

- **React 18** - Modern JavaScript framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4.0** - Latest utility-first CSS framework
- **Web APIs**:
  - Speech Recognition API
  - Speech Synthesis API
  - MediaDevices API (Camera/Microphone)
  - Canvas API (Image capture)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or latest LTS
- Modern browser (Chrome, Firefox, Safari, Edge)
- Microphone and camera (optional, for voice/video features)
- Google Gemini API key

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Visit `http://localhost:5173`
   - Grant microphone and camera permissions when prompted

## ⚙️ Configuration

### API Key Setup
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the **Settings** button in the app
3. Enter your API key and save

## 🎮 How to Use

### Text Chat
1. Type your message in the input field
2. Press Enter or click the send button
3. AI responds with text and optionally speaks

### Voice Chat
1. Click "🎤 Speak" to start voice recognition
2. Speak your message clearly
3. AI processes and responds with voice

### Voice Call
1. Click "📞 Voice Call" to start a hands-free conversation
2. AI greets you and starts listening
3. Speak naturally - conversation flows automatically
4. Click "📞 End Call" to finish

### Video Call
1. Click "📹 Video Call" to start video chat
2. Grant camera permissions
3. AI can see you and your surroundings
4. Show objects, documents, or gestures for AI analysis
5. Click "📹 End Video" to finish

## 🔧 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚨 Browser Compatibility

**Recommended**: Chrome, Edge, Safari (latest versions)
**Features Support**:
- Speech Recognition: Chrome, Edge, Safari
- Speech Synthesis: All modern browsers
- Camera/Microphone: All modern browsers
- Tailwind CSS 4.0: All modern browsers

---

**Built with ❤️ using React, Vite, and Tailwind CSS 4.0**
