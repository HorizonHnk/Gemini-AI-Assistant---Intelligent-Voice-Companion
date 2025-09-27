import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RobotFace } from './RobotFace';
import { ControlBar } from './ControlBar';
import { SidePanel } from './SidePanel';
import { DebugControls } from './DebugControls';
import { SpeakerControls } from './SpeakerControls';
import { cn } from '../lib/utils';

const AIAssistant = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [lastSpokenTime, setLastSpokenTime] = useState(0);

  // Camera switching states
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back camera

  // Enhanced voice interaction states
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceSensitivity, setVoiceSensitivity] = useState(0.3); // 0.1 = very sensitive, 0.9 = less sensitive
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [lastVoiceActivity, setLastVoiceActivity] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [speechBuffer, setSpeechBuffer] = useState('');
  const [conversationMode, setConversationMode] = useState('auto'); // 'auto', 'push-to-talk', 'continuous'
  const [pauseThreshold, setPauseThreshold] = useState(1500); // ms of silence before processing speech

  // Enhanced noise handling states
  const [noiseFloor, setNoiseFloor] = useState(0.05); // Adaptive baseline noise level
  const [noiseHistory, setNoiseHistory] = useState([]); // Track noise levels for adaptive filtering
  const [voiceInterruptionEnabled, setVoiceInterruptionEnabled] = useState(true); // Manual override
  const [lastSpeechTime, setLastSpeechTime] = useState(0);
  const [backgroundNoiseLevel, setBackgroundNoiseLevel] = useState(0);
  const [animationState, setAnimationState] = useState('offline');
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [faceBoundingBox, setFaceBoundingBox] = useState(null);
  const [isEyeRolling, setIsEyeRolling] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyDBzJeHlB5ayYe0iiM0bN9BtIn09Udnz6Y');
  const [showSettings, setShowSettings] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const talkingIntervalRef = useRef(null);
  const wakeUpSequenceRef = useRef([]);
  const recognitionRef = useRef(null);
  const recognitionRestartTimeoutRef = useRef(null);
  const voiceActivityRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const streamRef = useRef(null);

  // Enhanced voice interaction refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speechProcessingRef = useRef(false);
  const audioLevelIntervalRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    // Don't initialize speech recognition here - it will be handled by automatic voice listening
    return () => {
      wakeUpSequenceRef.current.forEach(clearTimeout);
      if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
      // Clean up speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition cleanup');
        }
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    console.log('🔧 Initializing speech recognition...');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      console.log('✅ Speech recognition instance created:', {
        continuous: recognitionRef.current.continuous,
        interimResults: recognitionRef.current.interimResults,
        lang: recognitionRef.current.lang,
        serviceURI: recognitionRef.current.serviceURI || 'default'
      });

      console.log('Speech recognition configured:', {
        continuous: recognitionRef.current.continuous,
        interimResults: recognitionRef.current.interimResults,
        lang: recognitionRef.current.lang
      });

      // Improve responsiveness
      if (recognitionRef.current.serviceURI) {
        recognitionRef.current.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
      }

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        // Stop any current speech when user starts talking
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
          setCurrentSpeakingText('');
          setIsSpeaking(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Restart listening after a brief delay if camera is on
        if (isCameraOn && !isThinking) {
          setTimeout(() => {
            if (!isThinking && isCameraOn) {
              startAutomaticVoiceListeningForced();
            }
          }, 1000);
        }
      };

      recognitionRef.current.onresult = (event) => {
        console.log('🎤 Speech recognition result received:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          isFinal: event.results[event.results.length - 1]?.isFinal,
          timestamp: new Date().toISOString()
        });

        // Log all results for debugging
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          console.log(`📝 Result ${i}:`, {
            transcript: result[0].transcript,
            confidence: result[0].confidence,
            isFinal: result.isFinal
          });
        }

        // Immediately stop any AI speech when user starts talking (even interim results)
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
          setCurrentSpeakingText('');
          setIsSpeaking(false);
          console.log('Stopped AI speech due to user input');
        }

        let finalTranscript = '';
        let interimTranscript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          confidence = event.results[i][0].confidence || 0.8;

          if (event.results[i].isFinal) {
            finalTranscript = transcript;
            console.log('✅ Final transcript:', finalTranscript, 'confidence:', confidence);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim transcript:', interimTranscript);
          }
        }

        // Enhanced speech buffer management
        if (interimTranscript) {
          setSpeechBuffer(interimTranscript);
          setTranscript(interimTranscript + '...');

          // Auto-process high-confidence interim results after a delay
          if (confidence > 0.85 && interimTranscript.length > 10) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              if (!speechProcessingRef.current && interimTranscript.trim()) {
                handleSmartTranscriptProcessing(interimTranscript);
              }
            }, pauseThreshold * 0.7); // Process earlier for high confidence
          }
        }

        // Process final transcript with improved logic
        if (finalTranscript && !speechProcessingRef.current) {
          setTranscript(finalTranscript);
          handleSmartTranscriptProcessing(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        // Restart listening after error if camera is still on
        if (isCameraOn && event.error !== 'aborted') {
          setTimeout(() => {
            if (isCameraOn && !isThinking) {
              startAutomaticVoiceListeningForced();
            }
          }, 2000);
        }
      };
    } else {
      console.error('Speech recognition not supported in this browser');
      console.log('Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        navigator: !!navigator,
        mediaDevices: !!navigator?.mediaDevices,
        getUserMedia: !!navigator?.mediaDevices?.getUserMedia
      });
    }
  };

  // Enhanced Audio Level Monitoring System
  const initializeAudioMonitoring = async () => {
    try {
      console.log('Initializing audio monitoring...');

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context created:', audioContextRef.current.state);
      }

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('Audio context resumed');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      console.log('Microphone access granted');

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current.connect(analyserRef.current);

      console.log('Audio monitoring setup complete');
      startAudioLevelMonitoring();
    } catch (error) {
      console.error('Audio monitoring initialization failed:', error);
      console.log('Error details:', error.name, error.message);

      // Try to continue without audio monitoring
      if (error.name === 'NotAllowedError') {
        console.log('Microphone permission denied. Voice detection will be limited.');
      } else if (error.name === 'NotFoundError') {
        console.log('No microphone found. Voice detection will be limited.');
      }
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let noiseCalibrationCount = 0;
    const maxNoiseHistory = 100; // Track last 100 readings for noise floor

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate RMS with frequency weighting for voice detection
      let sum = 0;
      let voiceFreqSum = 0;
      const voiceFreqStart = Math.floor(bufferLength * 0.1); // ~300Hz
      const voiceFreqEnd = Math.floor(bufferLength * 0.6);   // ~3000Hz

      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
        // Focus on voice frequency range for better detection
        if (i >= voiceFreqStart && i <= voiceFreqEnd) {
          voiceFreqSum += dataArray[i] * dataArray[i];
        }
      }

      const rms = Math.sqrt(sum / bufferLength);
      const voiceRms = Math.sqrt(voiceFreqSum / (voiceFreqEnd - voiceFreqStart));
      const normalizedLevel = rms / 255;
      const voiceLevel = voiceRms / 255;

      setAudioLevel(normalizedLevel);

      // Adaptive noise floor calibration
      if (noiseCalibrationCount < 50) {
        // Calibrate noise floor for first 50 readings (~1-2 seconds)
        setNoiseHistory(prev => {
          const newHistory = [...prev, normalizedLevel].slice(-10);
          const avgNoise = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
          setNoiseFloor(avgNoise + 0.02); // Add small buffer above noise floor
          return newHistory;
        });
        noiseCalibrationCount++;
        setBackgroundNoiseLevel(normalizedLevel);
      } else {
        // Update noise floor continuously but slowly
        setNoiseHistory(prev => {
          const newHistory = [...prev, normalizedLevel].slice(-maxNoiseHistory);
          if (newHistory.length > 10) {
            const sortedLevels = [...newHistory].sort((a, b) => a - b);
            const medianNoise = sortedLevels[Math.floor(sortedLevels.length * 0.3)]; // 30th percentile as noise floor
            setNoiseFloor(Math.max(0.02, medianNoise + 0.03)); // Ensure minimum threshold
            setBackgroundNoiseLevel(medianNoise);
          }
          return newHistory;
        });
      }

      // Enhanced voice detection with noise compensation
      const currentTime = Date.now();
      const dynamicThreshold = Math.max(voiceSensitivity, noiseFloor * 1.5);

      // Use voice-frequency focused detection and require sustained level
      const isVoiceDetected = voiceInterruptionEnabled &&
                             voiceLevel > dynamicThreshold &&
                             normalizedLevel > (backgroundNoiseLevel * 2) &&
                             !synthRef.current.speaking; // Don't detect voice while AI is speaking

      // Additional filtering: require speech recognition to be active for interruption
      const shouldInterrupt = isVoiceDetected &&
                             isListening &&
                             (currentTime - lastSpeechTime) > 1000; // Prevent rapid interruptions

      if (shouldInterrupt) {
        setLastVoiceActivity(currentTime);
        if (!isUserSpeaking) {
          setIsUserSpeaking(true);
          handleVoiceActivityStart();
          setLastSpeechTime(currentTime);
        }

        // Clear any pending silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (isUserSpeaking && !isVoiceDetected) {
        // Start silence detection timer only if voice is no longer detected
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            setIsUserSpeaking(false);
            handleVoiceActivityEnd();
            silenceTimerRef.current = null;
          }, pauseThreshold);
        }
      }

      audioLevelIntervalRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const handleVoiceActivityStart = () => {
    // Immediately stop AI speech when user starts speaking
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setCurrentSpeakingText('');
      setIsSpeaking(false);
    }

    // Change animation to indicate listening
    if (animationState !== 'talking') {
      setAnimationState('curious');
    }
  };

  const handleVoiceActivityEnd = () => {
    // Return to neutral state when user stops speaking
    if (animationState === 'curious') {
      setAnimationState('neutral');
    }
  };

  const stopAudioMonitoring = () => {
    if (audioLevelIntervalRef.current) {
      cancelAnimationFrame(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setIsUserSpeaking(false);
  };

  // Smart transcript processing with improved conversation flow
  const handleSmartTranscriptProcessing = (transcript) => {
    console.log('🧠 Processing transcript:', transcript);

    if (speechProcessingRef.current) {
      console.log('⚠️ Already processing, skipping duplicate');
      return; // Prevent duplicate processing
    }

    const cleanTranscript = transcript.trim().toLowerCase();
    console.log('🧹 Clean transcript:', cleanTranscript);

    if (!cleanTranscript || cleanTranscript.length < 2) {
      console.log('❌ Transcript too short, ignoring');
      return;
    }

    speechProcessingRef.current = true;
    console.log('🔄 Starting transcript processing...');

    // Check for conversation intent patterns
    const isQuestion = cleanTranscript.includes('?') ||
                      cleanTranscript.startsWith('what') ||
                      cleanTranscript.startsWith('how') ||
                      cleanTranscript.startsWith('why') ||
                      cleanTranscript.startsWith('when') ||
                      cleanTranscript.startsWith('where') ||
                      cleanTranscript.startsWith('can you') ||
                      cleanTranscript.startsWith('could you') ||
                      cleanTranscript.startsWith('do you') ||
                      cleanTranscript.startsWith('would you');

    const isCommand = cleanTranscript.startsWith('tell me') ||
                     cleanTranscript.startsWith('show me') ||
                     cleanTranscript.startsWith('explain') ||
                     cleanTranscript.startsWith('describe');

    const isGreeting = cleanTranscript.includes('hello') ||
                      cleanTranscript.includes('hi ') ||
                      cleanTranscript.includes('hey') ||
                      cleanTranscript.startsWith('good morning') ||
                      cleanTranscript.startsWith('good afternoon') ||
                      cleanTranscript.startsWith('good evening');

    // Only process if it seems like intentional communication
    if (isQuestion || isCommand || isGreeting || cleanTranscript.length > 8) {
      console.log('✅ Transcript passed intent check:', {
        isQuestion,
        isCommand,
        isGreeting,
        length: cleanTranscript.length
      });
      setTimeout(() => {
        console.log('📤 Sending to handleConversation:', transcript);
        handleConversation(transcript);
        speechProcessingRef.current = false;
      }, 200); // Small delay to ensure clean processing
    } else {
      console.log('❌ Transcript failed intent check - too short or unclear:', {
        isQuestion,
        isCommand,
        isGreeting,
        length: cleanTranscript.length
      });
      // Short utterances that might not be intentional
      setTimeout(() => {
        speechProcessingRef.current = false;
      }, 500);
    }
  };

  const handleNewTranscript = (transcript) => {
    handleSmartTranscriptProcessing(transcript);
  };

  const startListening = async () => {
    console.log('🎤 startListening called:', {
      hasRecognition: !!recognitionRef.current,
      isCurrentlyListening: isListening,
      recognitionState: recognitionRef.current?.state || 'no recognition',
      isCameraOn,
      isThinking
    });

    // First check if recognition is available
    if (!recognitionRef.current) {
      console.error('❌ No recognition instance available');
      alert('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    if (isListening) {
      console.log('⚠️ Already listening, skipping start');
      return;
    }

    try {
      // Set listening state first
      setIsListening(true);

      // Initialize audio monitoring for better voice detection
      if (!audioContextRef.current) {
        console.log('🔊 Initializing audio monitoring...');
        await initializeAudioMonitoring();
      }

      // Add event listeners if they don't exist
      if (!recognitionRef.current.onstart) {
        console.log('📝 Adding speech recognition event listeners...');

        recognitionRef.current.onstart = () => {
          console.log('✅ Speech recognition started successfully');
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          console.log('🛑 Speech recognition ended');
          setIsListening(false);

          // Restart if camera is still on and not thinking
          if (isCameraOn && !isThinking) {
            console.log('🔄 Auto-restarting speech recognition...');
            setTimeout(() => {
              if (recognitionRef.current && isCameraOn && !isThinking) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.error('❌ Auto-restart failed:', error);
                }
              }
            }, 100);
          }
        };
      }

      console.log('▶️ Starting speech recognition...');
      recognitionRef.current.start();

      // Start voice activity detection
      startVoiceActivityDetection();

    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      setIsListening(false);

      // Retry once after a short delay
      setTimeout(() => {
        if (recognitionRef.current && !isListening && isCameraOn) {
          try {
            console.log('🔄 Retrying speech recognition start...');
            recognitionRef.current.start();
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError);
          }
        }
      }, 1000);
    }
  };

  // Manual voice test function for debugging
  const handleManualVoiceTest = () => {
    console.log('=== MANUAL VOICE TEST STARTED ===');
    console.log('Voice Recognition Status:', {
      isListening,
      hasRecognition: !!recognitionRef.current,
      recognitionState: recognitionRef.current?.state || 'no recognition',
      voiceInterruptionEnabled,
      audioLevel,
      noiseFloor,
      isUserSpeaking,
      speechBuffer,
      transcript,
      currentSpeakingText,
      isSpeaking
    });

    // Test browser speech recognition support
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    console.log('Browser support:', {
      hasSpeechRecognition,
      hasWebkitSpeechRecognition: 'webkitSpeechRecognition' in window,
      hasSpeechRecognition: 'SpeechRecognition' in window,
      userAgent: navigator.userAgent
    });

    if (!hasSpeechRecognition) {
      alert('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (!recognitionRef.current) {
      console.error('No speech recognition instance available');
      alert('Speech recognition not initialized. Try refreshing the page.');
      return;
    }

    // Test microphone permissions first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('✅ Microphone access granted');
        stream.getTracks().forEach(track => track.stop());

        // Now test speech recognition
        if (!isListening) {
          console.log('▶️ Starting listening for manual test...');
          startAutomaticVoiceListeningForced();

          // Add a test timeout
          setTimeout(() => {
            console.log('🕒 Manual test timeout - checking if listening started...');
            console.log('Recognition state after 3 seconds:', {
              isListening,
              recognitionState: recognitionRef.current?.state,
              audioLevel,
              isUserSpeaking
            });
          }, 3000);

        } else {
          console.log('🎤 Already listening, checking recognition status...');
          console.log('Current recognition state:', {
            state: recognitionRef.current.state,
            continuous: recognitionRef.current.continuous,
            interimResults: recognitionRef.current.interimResults,
            lang: recognitionRef.current.lang
          });

          // Try to restart recognition
          try {
            console.log('🔄 Restarting speech recognition...');
            recognitionRef.current.stop();
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                console.log('✅ Speech recognition restarted');
              }
            }, 500);
          } catch (error) {
            console.error('❌ Error restarting recognition:', error);
          }
        }

        alert('Voice test started! Check console for details. Try speaking now...');
      })
      .catch(error => {
        console.error('❌ Microphone access denied:', error);
        alert('Microphone access denied. Please:\n1. Click the microphone icon in your browser address bar\n2. Allow microphone access\n3. Refresh the page and try again');
      });
  };

  // Automatic continuous voice recognition - FIXED VERSION
  const startAutomaticVoiceListening = () => {
    console.log('🎤 Starting automatic voice listening...', { isCameraOn });

    if (!isCameraOn) {
      console.log('❌ Camera not on, skipping voice activation. Current isCameraOn:', isCameraOn);
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('No existing recognition to stop');
      }
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const autoRecognition = new SpeechRecognition();

      // Configure recognition
      autoRecognition.continuous = true;
      autoRecognition.interimResults = true;
      autoRecognition.lang = 'en-US';
      autoRecognition.maxAlternatives = 1;

      console.log('🔧 Configuring new recognition instance...');

      autoRecognition.onstart = () => {
        console.log('✅ Speech recognition STARTED successfully');
        setIsListening(true);
      };

      autoRecognition.onresult = (event) => {
        console.log('🎤 Voice result received:', event.results);

        // Process results
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript.trim();
            console.log('📝 Final transcript:', finalTranscript);

            // Send to AI if meaningful
            if (finalTranscript.length > 2) {
              console.log('📤 Sending to AI:', finalTranscript);
              handleConversation(finalTranscript);
            }
          } else {
            console.log('⏳ Interim result:', transcript);
          }
        }
      };

      autoRecognition.onerror = (event) => {
        console.error('❌ Recognition error:', event.error);
        setIsListening(false);

        // Only restart on certain errors
        if (event.error !== 'aborted' && event.error !== 'not-allowed' && event.error !== 'network') {
          console.log('🔄 Will restart after error...');
          setTimeout(() => {
            if (isCameraOn && !isThinking) {
              startAutomaticVoiceListening();
            }
          }, 2000);
        }
      };

      autoRecognition.onend = () => {
        console.log('🛑 Recognition ended');
        setIsListening(false);

        // Auto-restart if still active
        if (isCameraOn && !isThinking) {
          console.log('🔄 Auto-restarting recognition...');
          setTimeout(() => {
            startAutomaticVoiceListening();
          }, 1000);
        }
      };

      // Store reference and start
      recognitionRef.current = autoRecognition;

      try {
        console.log('▶️ Attempting to start recognition...');
        autoRecognition.start();

        // Set listening state immediately
        setTimeout(() => {
          if (autoRecognition && !isListening) {
            console.log('⚠️ Recognition should have started, setting state manually');
            setIsListening(true);
          }
        }, 500);

      } catch (error) {
        console.error('❌ Failed to start recognition:', error);
        setIsListening(false);
      }
    } else {
      console.error('❌ Speech recognition not supported');
    }
  };

  const startAutomaticVoiceListeningForced = () => {
    console.log('🎤 FORCING automatic voice listening (bypassing camera check)...');

    // Don't start if AI is currently speaking
    if ((synthRef.current && synthRef.current.speaking) || isSpeaking) {
      console.log('🗣️ AI is speaking, skipping voice recognition start');
      return;
    }

    // Clear any pending restart timeouts
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
      recognitionRestartTimeoutRef.current = null;
      console.log('🔄 Cleared pending restart timeout');
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('No existing recognition to stop');
      }
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const autoRecognition = new SpeechRecognition();

      // Configure recognition
      autoRecognition.continuous = true;
      autoRecognition.interimResults = true;
      autoRecognition.lang = 'en-US';
      autoRecognition.maxAlternatives = 1;

      console.log('🔧 Configuring FORCED recognition instance...');

      autoRecognition.onstart = () => {
        console.log('✅ FORCED Speech recognition STARTED successfully');
        setIsListening(true);
      };

      autoRecognition.onresult = (event) => {
        console.log('🎤 FORCED Voice result received:', event.results);

        // Process results
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript.trim();
            console.log('📝 FORCED Final transcript:', finalTranscript);

            // Send to AI if meaningful
            if (finalTranscript.length > 2) {
              console.log('📤 FORCED Sending to AI:', finalTranscript);
              handleConversation(finalTranscript);
            }
          } else {
            console.log('⏳ FORCED Interim result:', transcript);
          }
        }
      };

      autoRecognition.onerror = (event) => {
        console.error('❌ FORCED Recognition error:', event.error);
        setIsListening(false);

        // Only restart on certain errors, with longer delay to prevent cycling
        if (event.error !== 'aborted' && event.error !== 'not-allowed' && event.error !== 'network') {
          console.log('🔄 FORCED Will restart after error in 5 seconds...');
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            if (!isThinking && !isSpeaking && !(synthRef.current && synthRef.current.speaking)) {
              console.log('🔄 FORCED Executing restart after error');
              startAutomaticVoiceListeningForced();
            }
          }, 5000);
        }
      };

      autoRecognition.onend = () => {
        console.log('🛑 FORCED Recognition ended');
        setIsListening(false);

        // Auto-restart if still active, with longer delay to prevent rapid cycling
        if (!isThinking && !isSpeaking && !(synthRef.current && synthRef.current.speaking)) {
          console.log('🔄 FORCED Auto-restarting recognition in 3 seconds...');
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            console.log('🔄 FORCED Executing auto-restart');
            startAutomaticVoiceListeningForced();
          }, 3000);
        }
      };

      // Store reference and start
      recognitionRef.current = autoRecognition;

      try {
        console.log('▶️ FORCED Attempting to start recognition...');
        autoRecognition.start();

        // Set listening state immediately
        setTimeout(() => {
          if (autoRecognition && !isListening) {
            console.log('⚠️ FORCED Recognition should have started, setting state manually');
            setIsListening(true);
          }
        }, 500);

      } catch (error) {
        console.error('❌ FORCED Failed to start recognition:', error);
        setIsListening(false);
      }
    } else {
      console.error('❌ FORCED Speech recognition not supported');
    }
  };

  const stopAutomaticVoiceListening = () => {
    console.log('🛑 Stopping automatic voice listening...');

    // Clear any pending restart timeouts
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
      recognitionRestartTimeoutRef.current = null;
      console.log('🔄 Cleared pending restart timeout in stop function');
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
  };

  const startVoiceActivityDetection = () => {
    // Create a separate speech recognition instance just for voice activity detection
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      voiceActivityRef.current = new SpeechRecognition();
      voiceActivityRef.current.continuous = true;
      voiceActivityRef.current.interimResults = true;
      voiceActivityRef.current.lang = 'en-US';

      voiceActivityRef.current.onresult = (event) => {
        // Any voice activity should immediately stop AI speech
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
          setCurrentSpeakingText('');
          setIsSpeaking(false);
        }
      };

      voiceActivityRef.current.onerror = () => {
        // Silently restart if there's an error
        setTimeout(() => {
          if (isCameraOn && !isThinking) {
            startVoiceActivityDetection();
          }
        }, 1000);
      };

      voiceActivityRef.current.onend = () => {
        // Restart voice activity detection if camera is still on
        if (isCameraOn && !isThinking) {
          setTimeout(() => {
            startVoiceActivityDetection();
          }, 100);
        }
      };

      try {
        voiceActivityRef.current.start();
      } catch (error) {
        console.log('Voice activity detection failed to start:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (voiceActivityRef.current) {
      voiceActivityRef.current.stop();
      voiceActivityRef.current = null;
    }
    stopAudioMonitoring();
    speechProcessingRef.current = false;
    setSpeechBuffer('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startAutomaticVoiceListeningForced();
    }
  };

  const handleConversationEnd = useCallback(() => {
    setIsThinking(false);
    if (isGenerating) {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const callGeminiAPI = async (text, image = null) => {
    if (!geminiApiKey) {
      throw new Error('API key not set');
    }

    const parts = [{ text }];
    if (image) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image.split(',')[1]
        }
      });
    }

    // Add system instruction for shorter responses
    const systemInstruction = "Please provide concise, clear responses. Keep answers brief and to the point. Use 1-3 sentences for simple questions, and no more than 5 sentences for complex topics. Be helpful but concise.";
    const finalParts = [{ text: systemInstruction + "\n\nUser: " + text }, ...parts.slice(1)];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: finalParts }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini API failed:', error);
      throw error;
    }
  };

  const handleConversation = async (query, image = null) => {
    if ((!query || query.trim() === '') && !image) {
      return;
    }
    if (isThinking) {
      return;
    }

    setLastSpokenTime(performance.now());
    console.log(`Handling conversation for query: "${query}"`);
    if (isListening) stopListening();

    // Detect vision-related queries and automatically capture image if camera is on
    const needsVision = query && (
      query.toLowerCase().includes('can you see') ||
      query.toLowerCase().includes('do you see') ||
      query.toLowerCase().includes('what do you see') ||
      query.toLowerCase().includes('look at me') ||
      query.toLowerCase().includes('how do i look') ||
      query.toLowerCase().includes('what am i wearing') ||
      query.toLowerCase().includes('describe what you see') ||
      query.toLowerCase().includes('what\'s in front of you') ||
      query.toLowerCase().includes('am i visible') ||
      query.toLowerCase().includes('can you view')
    );

    // Capture image if vision is needed, camera is on, and no image was provided
    if (needsVision && isCameraOn && !image) {
      console.log('🔍 Vision query detected, capturing image from camera...');
      image = captureImage();
      if (image) {
        console.log('📸 Successfully captured image for AI vision');
      } else {
        console.log('❌ Failed to capture image from camera');
      }
    }

    setIsThinking(true);
    setAudioUrl(null);
    setConversationHistory(prev => [...prev, {
      role: 'user',
      text: query || 'What do you see in this image?',
      image: image
    }]);

    const isAnticipatingLesson = query && (query.toLowerCase().includes('teach') || query.toLowerCase().includes('about'));
    if (isAnticipatingLesson) {
      setIsGenerating(true);
      setStoryContent('');
    }

    try {
      console.log("Getting conversational response with history:", conversationHistory);
      const response = await callGeminiAPI(query || 'What do you see in this image?', image);
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        console.log('AI Response:', responseText);
        setConversationHistory(prev => [...prev, { role: 'model', text: responseText }]);

        if (isAnticipatingLesson) {
          setStoryContent(responseText);
        } else {
          setStoryContent('');
        }

        // Don't automatically speak, just set the text ready for manual play
        setCurrentSpeakingText(responseText);
        setIsThinking(false);

        // Restart listening after AI response
        setTimeout(() => {
          if (isCameraOn && !isListening) {
            startAutomaticVoiceListeningForced();
          }
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = "Sorry, I had trouble thinking of a response.";
      setConversationHistory(prev => [...prev, { role: 'model', text: errorMsg }]);
      setCurrentSpeakingText(errorMsg);
      setIsThinking(false);

      // Restart listening after error response
      setTimeout(() => {
        if (isCameraOn && !isListening) {
          startAutomaticVoiceListeningForced();
        }
      }, 1000);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current || synthRef.current.speaking) return;

    console.log('🗣️ AI starting to speak, pausing voice recognition...');

    // Stop voice recognition while AI is speaking to prevent self-response
    stopAutomaticVoiceListening();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;

    utterance.onstart = () => {
      console.log('🗣️ AI speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('🗣️ AI speech ended, resuming voice recognition...');
      setIsSpeaking(false);
      // Resume voice recognition after AI finishes speaking
      setTimeout(() => {
        if (isCameraOn && !isThinking) {
          startAutomaticVoiceListeningForced();
        }
      }, 1000); // 1 second delay to avoid picking up speech echo
    };

    utterance.onerror = () => {
      console.log('🗣️ AI speech error, resuming voice recognition...');
      setIsSpeaking(false);
      // Resume voice recognition on error too
      setTimeout(() => {
        if (isCameraOn && !isThinking) {
          startAutomaticVoiceListeningForced();
        }
      }, 1000);
    };

    synthRef.current.speak(utterance);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      return imageData;
    }
    return null;
  };

  const startCamera = async () => {
    // Enumerate cameras first if not done yet
    if (availableCameras.length === 0) {
      await enumerateCameras();
    }

    // Use the enhanced camera function
    await startCameraWithDevice(null, facingMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Enumerate available cameras
  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('📷 Available cameras:', videoDevices);
      setAvailableCameras(videoDevices);
      return videoDevices;
    } catch (error) {
      console.error('Error enumerating cameras:', error);
      return [];
    }
  };

  // Start camera with specific device ID or facing mode
  const startCameraWithDevice = async (deviceId = null, preferredFacingMode = null) => {
    try {
      const constraints = {
        video: {
          width: 1280,
          height: 720
        },
        audio: false
      };

      if (deviceId) {
        constraints.video.deviceId = { exact: deviceId };
      } else if (preferredFacingMode) {
        constraints.video.facingMode = { ideal: preferredFacingMode };
      }

      console.log('📷 Starting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setCameraError('');

        // Update current camera info
        const track = stream.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();
          setCurrentCameraId(settings.deviceId);
          setFacingMode(settings.facingMode || preferredFacingMode || 'user');
          console.log('📷 Camera started with settings:', settings);
        }
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(error.message);
    }
  };

  // Switch to next available camera
  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      console.log('📷 Only one camera available, cannot switch');
      return;
    }

    // Stop current camera
    stopCamera();

    // Find next camera
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    console.log('📷 Switching to camera:', nextCamera.label || `Camera ${nextIndex + 1}`);
    await startCameraWithDevice(nextCamera.deviceId);
  };

  // Toggle between front and back camera (for mobile devices)
  const toggleFacingMode = async () => {
    stopCamera();
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    console.log(`📷 Switching from ${facingMode} to ${newFacingMode} camera`);
    setFacingMode(newFacingMode);
    await startCameraWithDevice(null, newFacingMode);
  };

  const toggleCamera = async () => {
    const turningOn = !isCameraOn;
    if (turningOn) {
      console.log('📷 Turning camera ON...');
      await startCamera(); // This should set isCameraOn to true
      onCameraOn();

      // Use a callback to ensure camera state is updated
      setTimeout(() => {
        console.log('🎤 Camera ready, starting voice listening...', {
          isCameraOn: true, // Force check since state should be true now
          actualState: isCameraOn
        });
        // Force start voice listening since we know camera is on
        startAutomaticVoiceListeningForced();
      }, 1500);
    } else {
      console.log('📷 Turning camera OFF...');
      stopCamera();
      onCameraOff();
      stopAutomaticVoiceListening();
    }
  };

  const onCameraOn = async () => {
    wakeUpSequenceRef.current.forEach(clearTimeout);
    wakeUpSequenceRef.current = [];
    setAnimationState('neutral');
    await new Promise(r => setTimeout(r, 100));
    setAnimationState('blink');
    await new Promise(r => setTimeout(r, 200));
    setAnimationState('happy');
    await new Promise(r => setTimeout(r, 1500));
    setAnimationState('neutral');
    setLastSpokenTime(performance.now());

    // Add greeting and capability explanation
    const greetingMessage = "Hello! I'm your AI assistant. I can help you with questions, provide information, teach you about topics, and have conversations with you. Just ask me anything you'd like to know or discuss!";
    setConversationHistory(prev => [...prev, { role: 'model', text: greetingMessage }]);
    setCurrentSpeakingText(greetingMessage);

    // Automatically start listening - no need to click mic
    startAutomaticVoiceListeningForced();
  };

  const onCameraOff = () => {
    if (isListening) {
      stopListening();
    }
    if (voiceActivityRef.current) {
      voiceActivityRef.current.stop();
      voiceActivityRef.current = null;
    }
    setAnimationState('sad');
    setTimeout(() => {
      setAnimationState('offline');
    }, 2000);
  };

  const handleWakeUp = () => {
    if (animationState !== 'offline' || wakeUpSequenceRef.current.length > 0) return;

    const sequence = [
      () => setAnimationState('shocked'),
      () => {
        setEyePosition({ x: -1.5, y: -0.5 });
        setTimeout(() => setEyePosition({ x: 1.5, y: 0 }), 500);
        setTimeout(() => setEyePosition({ x: 0, y: 0 }), 1000);
      },
      () => setAnimationState('sad'),
      () => setAnimationState('thinking'),
      () => setAnimationState('offline'),
    ];

    const timeouts = [
      setTimeout(sequence[0], 0),
      setTimeout(sequence[1], 500),
      setTimeout(sequence[2], 2000),
      setTimeout(sequence[3], 4000),
      setTimeout(sequence[4], 7000),
    ];

    wakeUpSequenceRef.current = timeouts;
    setTimeout(() => {
      wakeUpSequenceRef.current = [];
    }, 7500);
  };

  const triggerEyeRoll = () => {
    setIsEyeRolling(true);
    setTimeout(() => setIsEyeRolling(false), 2000);
  };

  const triggerWink = () => {
    setAnimationState('wink');
    setTimeout(() => setAnimationState('neutral'), 1000);
  };

  const endCall = () => {
    stopCamera();
    stopListening();
    setAnimationState('offline');
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const clearChat = () => {
    setConversationHistory([]);
    setCurrentSpeakingText('');
    setIsSpeaking(false);
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
  };

  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-black\/90/g, 'bg-white/90')
        .replace(/bg-black\/75/g, 'bg-white/90')
        .replace(/bg-black\/50/g, 'bg-white/80')
        .replace(/bg-black/g, 'bg-white')
        .replace(/bg-slate-900/g, 'bg-gray-50')
        .replace(/bg-slate-800\/90/g, 'bg-gray-100/90')
        .replace(/bg-slate-800\/50/g, 'bg-gray-100/80')
        .replace(/bg-slate-800/g, 'bg-gray-100')
        .replace(/bg-slate-700/g, 'bg-gray-200')
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/bg-slate-500/g, 'bg-gray-400')
        .replace(/text-white/g, 'text-gray-900')
        .replace(/text-slate-300/g, 'text-gray-600')
        .replace(/text-slate-400/g, 'text-gray-500')
        .replace(/border-slate-600/g, 'border-gray-300')
        .replace(/border-slate-700/g, 'border-gray-400');
    }
  };

  // Enumerate cameras on component mount
  useEffect(() => {
    enumerateCameras();
  }, []);

  useEffect(() => {
    if (isThinking) {
      setAnimationState('thinking');
    } else if (animationState === 'thinking' && !isThinking) {
      setAnimationState('neutral');
    }
  }, [isThinking, animationState]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handlePlay = () => {
        setLastSpokenTime(performance.now());
        if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
        talkingIntervalRef.current = setInterval(() => {
          setAnimationState(prev => prev === 'mouthOpen' ? 'talking' : 'mouthOpen');
        }, 150);
      };
      const handleEnded = () => {
        if (talkingIntervalRef.current) {
          clearInterval(talkingIntervalRef.current);
          talkingIntervalRef.current = null;
        }
        setAnimationState('neutral');
        handleConversationEnd();
        if (isCameraOn && !isListening) {
          setLastSpokenTime(performance.now());
          startAutomaticVoiceListeningForced();
        }
      };

      audioEl.addEventListener('play', handlePlay);
      audioEl.addEventListener('ended', handleEnded);
      audioEl.addEventListener('pause', handleEnded);

      return () => {
        audioEl.removeEventListener('play', handlePlay);
        audioEl.removeEventListener('ended', handleEnded);
        audioEl.removeEventListener('pause', handleEnded);
        if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
      };
    }
  }, [isCameraOn, isListening, startAutomaticVoiceListeningForced, handleConversationEnd]);

  // Handle voice recognition control based on AI speaking state
  useEffect(() => {
    if (isSpeaking) {
      console.log('🗣️ AI started speaking, stopping voice recognition to prevent self-response...');
      stopAutomaticVoiceListening();
    } else if (!isSpeaking && isCameraOn && !isThinking) {
      console.log('🗣️ AI stopped speaking, resuming voice recognition...');
      // Add a delay to avoid picking up speech echo
      setTimeout(() => {
        if (!isSpeaking && isCameraOn && !isThinking) {
          startAutomaticVoiceListeningForced();
        }
      }, 2000); // 2-second delay to ensure speech has fully stopped
    }
  }, [isSpeaking, isCameraOn, isThinking]);

  if (!isMounted) {
    return (
      <div className={getThemeClasses("flex items-center justify-center h-screen w-screen bg-slate-900")}>
        <div className={getThemeClasses("w-full max-w-4xl h-96 bg-slate-800 animate-pulse rounded-lg")}></div>
      </div>
    );
  };

  const videoBorderColor = () => {
    if (!isCameraOn) return 'border-transparent';
    switch (animationState) {
      case 'happy':
      case 'smile':
      case 'wink':
        return 'border-green-500 shadow-green-500/50';
      case 'angry':
        return 'border-red-500 shadow-red-500/50';
      case 'curious':
      case 'thinking':
        return 'border-yellow-500 shadow-yellow-500/50';
      case 'shocked':
        return 'border-purple-500 shadow-purple-500/50';
      default:
        return 'border-blue-500 shadow-blue-500/50';
    }
  };

  return (
    <div className={getThemeClasses("w-full h-screen flex flex-col bg-black")}>
      <audio ref={audioRef} src={audioUrl || undefined} />

      {/* Header - Always visible with responsive layout */}
      <header className={getThemeClasses("px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-2 flex justify-between items-center bg-slate-800/90 backdrop-blur-sm border-b border-slate-700")}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            R
          </div>
          <h1 className={getThemeClasses("font-bold text-sm sm:text-lg tracking-tight text-white")}>
            RoboFace Live
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className={getThemeClasses("p-1 sm:p-2 text-white hover:bg-slate-700 rounded-lg transition-colors")}
            title="Clear chat history"
          >
            🗑️
          </button>
          <button
            onClick={toggleTheme}
            className={getThemeClasses("p-1 sm:p-2 text-white hover:bg-slate-700 rounded-lg transition-colors")}
            title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDarkTheme ? '🌞' : '🌙'}
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className={getThemeClasses("p-1 sm:p-2 text-white hover:bg-slate-700 rounded-lg transition-colors")}
          >
            {isSidePanelOpen ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <main className={getThemeClasses("flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2 md:gap-4 p-1 xs:p-2 sm:p-4 lg:p-6 transition-all duration-300 ease-in-out relative bg-black/90 min-h-0")}>
          {/* User Video */}
          <div className={cn(getThemeClasses("relative w-full h-full min-h-[150px] xs:min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[400px] xl:min-h-[500px] aspect-video bg-slate-800/50 rounded-lg overflow-hidden flex items-center justify-center border-2 md:border-4 transition-all shadow-lg"), videoBorderColor())}>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
            {!isCameraOn && (
              <div className={getThemeClasses("absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10")}>
                <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-2 sm:mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm">Your camera is off</p>
              </div>
            )}
            {faceBoundingBox && videoRef.current && (
              <div
                className="absolute border-2 border-green-500/80 rounded-md shadow-lg"
                style={{
                  left: `${(faceBoundingBox.x / videoRef.current.videoWidth) * 100}%`,
                  top: `${(faceBoundingBox.y / videoRef.current.videoHeight) * 100}%`,
                  width: `${(faceBoundingBox.width / videoRef.current.videoWidth) * 100}%`,
                  height: `${(faceBoundingBox.height / videoRef.current.videoHeight) * 100}%`,
                  transition: 'all 0.2s ease-out'
                }}
              />
            )}
          </div>

          {/* Robot Face */}
          <div className={cn(getThemeClasses("relative w-full h-full min-h-[200px] sm:min-h-[300px] lg:min-h-0 aspect-video bg-slate-800/50 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"))} onClick={handleWakeUp}>
            <RobotFace animation={animationState} eyePosition={eyePosition} isEyeRolling={isEyeRolling} />
            {transcript && (
              <p className={getThemeClasses("absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white bg-black/50 p-1 sm:p-2 rounded text-xs sm:text-sm max-w-[80%] sm:max-w-xs")}>
                {transcript}
              </p>
            )}

            {/* Current Speaking Controls - Responsive */}
            {currentSpeakingText && (
              <div className={getThemeClasses("absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 bg-black/75 rounded-lg p-2")}>
                <div className={getThemeClasses("text-xs text-slate-300 mb-1")}>AI Speaking:</div>
                <div className="scale-75 sm:scale-100 origin-top-left">
                  <SpeakerControls
                    text={currentSpeakingText}
                    isAutoPlay={true}
                    onPlayStateChange={setIsSpeaking}
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 right-2 sm:right-4 max-w-md mx-auto z-30 bg-red-600 text-white p-2 sm:p-3 rounded-lg">
              <h4 className="font-semibold text-sm">Error</h4>
              <p className="text-xs sm:text-sm">{cameraError}</p>
            </div>
          )}

          {/* Control Bar */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 sm:p-4 z-30">
            <div className={getThemeClasses("flex items-center justify-center gap-2 sm:gap-3 rounded-full bg-slate-800/80 backdrop-blur-sm p-2 sm:p-3 border border-slate-600")}>
              {/* Microphone Button */}
              <button
                onClick={toggleListening}
                disabled={!isCameraOn}
                className={`rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-white font-medium transition-all ${
                  isListening
                    ? 'bg-green-600 hover:bg-green-700 animate-pulse'
                    : 'bg-red-600 hover:bg-red-700'
                } ${!isCameraOn ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isListening ? 'Mute' : 'Unmute'}
              >
                {isListening ? (
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0L18.485 7.757a1 1 0 010 1.414L17.071 10.586a1 1 0 11-1.414-1.414L16.243 8.586l-.586-.586a1 1 0 010-1.414l.586-.586a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Camera Button */}
              <button
                onClick={toggleCamera}
                className={`rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-white font-medium transition-all ${
                  isCameraOn
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? (
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a2 2 0 00-2-2h-2.586l-1.707-1.707A1 1 0 0011 3H9a1 1 0 00-.707.293L6.586 5H4a2 2 0 00-2 2v6c0 .695.355 1.308.894 1.664L3.707 2.293z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Camera Switch Button - Show only if multiple cameras available */}
              {availableCameras.length > 1 && (
                <button
                  onClick={toggleFacingMode}
                  disabled={!isCameraOn}
                  className={`rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-white font-medium transition-all ${
                    isCameraOn
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                  title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                >
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                    <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    <circle cx="12" cy="12" r="1"/>
                    <path d="M16 2l3 3-3 3v-2h-2V4h2V2z"/>
                  </svg>
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="rounded-full w-10 h-8 sm:w-16 sm:h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
                title="End call"
              >
                <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        {/* Side Panel */}
        <SidePanel
          isOpen={isSidePanelOpen}
          isGenerating={isGenerating}
          isThinking={isThinking}
          storyContent={storyContent}
          onConversation={handleConversation}
          conversationHistory={conversationHistory}
          isDarkTheme={isDarkTheme}
          isListening={isListening}
        >
          <DebugControls
            setAnimationState={setAnimationState}
            onSay={handleConversation}
            triggerEyeRoll={triggerEyeRoll}
            triggerWink={triggerWink}
            isDarkTheme={isDarkTheme}
            audioLevel={audioLevel}
            voiceSensitivity={voiceSensitivity}
            onSensitivityChange={setVoiceSensitivity}
            pauseThreshold={pauseThreshold}
            onPauseThresholdChange={setPauseThreshold}
            isUserSpeaking={isUserSpeaking}
            voiceInterruptionEnabled={voiceInterruptionEnabled}
            onVoiceInterruptionToggle={() => setVoiceInterruptionEnabled(!voiceInterruptionEnabled)}
            noiseFloor={noiseFloor}
            backgroundNoiseLevel={backgroundNoiseLevel}
            onManualVoiceTest={handleManualVoiceTest}
          />
        </SidePanel>
      </div>
    </div>
  );
};

export default AIAssistant;