"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface QrScannerProps {
  onScan: (token: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    setError(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        detectQr();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Check permissions or device availability.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
  };

  const detectQr = () => {
    if (!videoRef.current) return;

    if ("BarcodeDetector" in window) {
      const BarcodeDetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      const barcodeDetector = new BarcodeDetectorClass({ formats: ["qr_code"] });

      const scanLoop = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            // Extract token UUID if full URL was scanned
            const matchedToken = rawValue.match(/[0-9a-fA-F-]{36}/)?.[0] || rawValue;
            onScan(matchedToken);
            handleClose();
            return;
          }
        } catch {
          // ignore frame decode errors
        }
        animFrameRef.current = requestAnimationFrame(scanLoop);
      };
      animFrameRef.current = requestAnimationFrame(scanLoop);
    } else {
      // BarcodeDetector fallback note
      setError("Native barcode scanner not supported in this browser. Paste token or use modern Chrome/Edge/Safari.");
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          startCamera();
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/20"
      >
        <Camera className="h-4 w-4" />
        Scan QR Code
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-brand/20 bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold">QR Scanner</h3>
                <p className="text-xs text-brand/70">Point camera at patient VitalTag QR card</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-brand/60 hover:bg-brand/10 hover:text-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative my-2 aspect-square overflow-hidden rounded-2xl border-2 border-brand/30 bg-black/90">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />

              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="h-56 w-56 rounded-2xl border-2 border-brand shadow-[0_0_20px_rgba(33,120,104,0.6)]" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand shadow-[0_0_12px_#217868] animate-pulse" />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95">
                  <AlertCircle className="h-10 w-10 text-emergency-accent mb-2" />
                  <p className="text-sm font-medium text-brand">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-brand/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Live camera detection
              </span>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1 text-brand font-medium hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Restart Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
