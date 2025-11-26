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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      console.log('Loading face-api models...');
      setModelError('');
      
      const modelLoading = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      
      await modelLoading;
      
      console.log('Models loaded successfully');
      setModelsLoaded(true);
      startCamera();
    } catch (error) {
      console.error('Model loading failed:', error);
      setModelError('Failed to load face recognition models');
      setModelsLoaded(false);
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Multiple event listeners for better compatibility
        const handleVideoReady = () => {
          console.log('Camera ready');
          setIsLoading(false);
        };
        
        videoRef.current.onloadedmetadata = handleVideoReady;
        videoRef.current.oncanplay = handleVideoReady;
        
        // Force play the video
        videoRef.current.play().catch(console.error);
        
        // Fallback timeout
        setTimeout(() => {
          console.log('Camera timeout, forcing ready state');
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsLoading(false);
      onError(`Camera access failed: ${error.message}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded) return null;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  };

  const handleCapture = async () => {
    setIsProcessing(true);
    try {
      if (!modelsLoaded) {
        onError('Face recognition models not loaded. Please try again or use password authentication.');
        setIsProcessing(false);
        return;
      }
      
      const detections = await detectFace();
      
      if (!detections || detections.length === 0) {
        onError('No face detected. Please position your face clearly in the camera.');
        setIsProcessing(false);
        return;
      }

      if (detections.length > 1) {
        onError('Multiple faces detected. Please ensure only one person is in frame.');
        setIsProcessing(false);
        return;
      }

      const faceDescriptor = detections[0].descriptor;
      
      if (mode === 'register') {
        const response = await fetch('/api/clock/face-recognition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            userId,
            faceDescriptor: Array.from(faceDescriptor)
          })
        });
        
        const result = await response.json();
        if (result.success) {
          onSuccess({ message: 'Face registered successfully' });
        } else {
          onError(result.error || 'Registration failed');
        }
      } else {
        // Determine action based on login status
        const action = isLoggedIn ? 'clock-out' : 'clock-in';
        
        const response = await fetch('/api/clock/face-recognition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            faceDescriptor: Array.from(faceDescriptor)
          })
        });
        
        const result = await response.json();
        if (result.success) {
          onSuccess({ 
            message: result.message, 
            userId: result.userId,
            action 
          });
        } else {
          onError(result.error || 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Face processing error:', error);
      onError('Face processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="relative w-80 h-60 bg-gray-100 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
                setIsLoading(false);
              }}
              onCanPlay={() => {
                console.log('Video can play');
                setIsLoading(false);
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {mode === 'register' 
            ? 'Position your face in the center and click Register'
            : 'Look at the camera for authentication'
          }
        </p>
        
        <p className="text-xs text-gray-500 mb-2">
          Models: {modelsLoaded ? '✅ Loaded' : modelError ? '❌ Failed' : '⏳ Loading...'} | 
          Camera: {isLoading ? '⏳ Starting...' : '✅ Ready'}
        </p>
        
        {modelError && (
          <p className="text-xs text-red-500 mb-2">{modelError}</p>
        )}
        
        <button
          onClick={handleCapture}
          disabled={isLoading || isProcessing}
          className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}