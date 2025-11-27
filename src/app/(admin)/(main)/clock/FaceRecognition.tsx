'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  mode: 'register' | 'authenticate';
  userId?: string;
  isLoggedIn?: boolean;
}

export default function FaceRecognition({ onSuccess, onError, mode, userId, isLoggedIn }: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera stopped');
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initialize = async () => {
      try {
        setStatus('Loading AI models...');
        
        // Load models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        
        if (!mounted) return;
        
        console.log('Models loaded');
        setModelsLoaded(true);
        setStatus('Starting camera...');
        
        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' 
          } 
        });
        
        if (!mounted || !videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Store stream reference for cleanup
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playing');
                if (mounted) {
                  setStatus('Ready');
                  setIsLoading(false);
                }
              })
              .catch(err => console.error('Play error:', err));
          }
        };
        
        // Fallback timeout
        timeoutId = setTimeout(() => {
          if (mounted && isLoading) {
            console.log('Timeout - forcing ready state');
            setStatus('Ready');
            setIsLoading(false);
          }
        }, 3000);
        
      } catch (error: any) {
        console.error('Initialization error:', error);
        if (mounted) {
          setStatus('Error: ' + error.message);
          onError(error.message);
          setIsLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    if (!modelsLoaded || !videoRef.current) {
      onError('System not ready. Please wait...');
      return;
    }

    setIsProcessing(true);
    setStatus('Detecting face...');

    try {
      // Detect face
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        throw new Error('No face detected. Please look at the camera.');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Only one person should be visible.');
      }

      const faceDescriptor = Array.from(detections[0].descriptor);
      setStatus('Processing...');

      // Call API
      if (mode === 'register') {
        const response = await fetch('/api/clock/face-recognition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            userId,
            faceDescriptor
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Registration failed');
        }

        stopCamera(); // Stop camera after successful registration
        onSuccess({ message: 'Face registered successfully!' });

      } else {
        // Authenticate and clock in/out
        const action = isLoggedIn ? 'clock-out' : 'clock-in';
        
        const response = await fetch('/api/clock/face-recognition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            faceDescriptor
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Authentication failed');
        }

        stopCamera(); // Stop camera after successful authentication
        onSuccess({ 
          message: result.message, 
          userId: result.userId,
          action,
          userRole: result.userRole
        });
      }

    } catch (error: any) {
      console.error('Capture error:', error);
      onError(error.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
      setStatus('Ready');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Video Container */}
      <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">{status}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="text-sm mb-2 dark:text-gray-300">
          {mode === 'register' 
            ? 'Position your face clearly and click Register'
            : isLoggedIn 
              ? 'Ready to clock out?'
              : 'Ready to clock in?'
          }
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
          <span>Models: {modelsLoaded ? 'Ready' : 'Loading'}</span>
          <span>•</span>
          <span>Camera: {isLoading ? 'Loading' : 'Ready'}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleCapture}
        disabled={isLoading || isProcessing || !modelsLoaded}
        className="px-8 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing 
          ? 'Processing...' 
          : mode === 'register' 
            ? 'Register Face' 
            : isLoggedIn 
              ? 'Clock Out'
              : 'Clock In'
        }
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-400 text-center max-w-xs">
        {mode === 'register' 
          ? 'Make sure your face is well-lit and clearly visible'
          : 'Your face will be verified for attendance'
        }
      </p>
    </div>
  );
}