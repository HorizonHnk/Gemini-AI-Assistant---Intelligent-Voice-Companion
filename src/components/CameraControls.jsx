import React, { useRef, useEffect, useState } from 'react';

const CameraControls = ({ onImageCapture, isCameraOn, onToggleCamera, isDarkTheme = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-slate-700/g, 'bg-gray-200')
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/bg-slate-500/g, 'bg-gray-400')
        .replace(/text-white/g, 'text-gray-900')
        .replace(/text-slate-300/g, 'text-gray-600')
        .replace(/text-slate-400/g, 'text-gray-500');
    }
  };

  useEffect(() => {
    enumerateCameras();
  }, []);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn, currentCameraIndex]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (error) {
      console.error('Error enumerating cameras:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');

      let constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (availableCameras.length > 0 && availableCameras[currentCameraIndex]) {
        constraints.video.deviceId = availableCameras[currentCameraIndex].deviceId;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(error.message);
      if (onToggleCamera) onToggleCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isCameraOn) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      if (onImageCapture) {
        onImageCapture(imageData);
      }

      return imageData;
    }
    return null;
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
    }
  };

  return (
    <div className="camera-controls">
      {/* Video Element */}
      <div className="relative mb-4">
        <div className={`aspect-video ${getThemeClasses('bg-slate-700')} rounded-lg overflow-hidden ${isCameraOn ? '' : 'flex items-center justify-center'}`}>
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={getThemeClasses("text-center text-slate-400")}>
              <div className="text-4xl mb-2">📷</div>
              <p>Camera Off</p>
            </div>
          )}
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div className="absolute top-2 left-2 right-2 bg-red-600 text-white p-2 rounded text-sm">
            Camera Error: {cameraError}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onToggleCamera(!isCameraOn)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            isCameraOn
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isCameraOn ? '📷 Stop Camera' : '📷 Start Camera'}
        </button>

        <button
          onClick={captureImage}
          disabled={!isCameraOn}
          className={getThemeClasses("px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-white")}
          title="Capture Image"
        >
          📸 Capture
        </button>

        {availableCameras.length > 1 && (
          <button
            onClick={switchCamera}
            disabled={!isCameraOn}
            className={getThemeClasses("px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-white")}
            title="Switch Camera"
          >
            🔄 Switch
          </button>
        )}
      </div>

      {/* Camera Info */}
      {availableCameras.length > 0 && isCameraOn && (
        <div className={getThemeClasses("mt-2 text-sm text-slate-400")}>
          Camera: {availableCameras[currentCameraIndex]?.label || `Camera ${currentCameraIndex + 1}`}
          {availableCameras.length > 1 && ` (${currentCameraIndex + 1}/${availableCameras.length})`}
        </div>
      )}

      {/* Hidden Canvas for Image Capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraControls;