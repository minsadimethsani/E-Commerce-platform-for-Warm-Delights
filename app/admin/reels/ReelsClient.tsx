"use client";

import { useState, useEffect } from "react";
import { Reel } from "@/lib/reels";
import { doc, setDoc, deleteDoc, collection, query, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface ReelsClientProps {
  initialReels: Reel[];
}

export default function ReelsClient({ initialReels }: ReelsClientProps) {
  const { setIsMutating } = useAuth();
  const [reels, setReels] = useState<Reel[]>(initialReels);

  // Form states
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState("");
  
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  useEffect(() => {
    const reelsRef = collection(db, "reels");
    const q = query(reelsRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Reel[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            videoUrl: data.videoUrl,
            title: data.title || "",
            createdAt: data.createdAt,
          });
        });
        // Sort by date descending
        list.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setReels(list);
      },
      (error) => {
        console.error("Firestore onSnapshot for reels failed:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const compressVideo = (file: File, onProgress: (progress: number) => void): Promise<{ videoUrl: string; posterUrl: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      
      video.onloadedmetadata = () => {
        // Seek to 0.2s to capture a valid poster frame
        video.currentTime = 0.2;
      };

      video.onseeked = () => {
        // 1. Capture Poster Image (WebP)
        const posterCanvas = document.createElement("canvas");
        const posterHeight = 360;
        const posterScale = posterHeight / video.videoHeight;
        const posterWidth = Math.round(video.videoWidth * posterScale);
        posterCanvas.width = posterWidth;
        posterCanvas.height = posterHeight;
        const posterCtx = posterCanvas.getContext("2d");
        let posterUrl = "";
        if (posterCtx) {
          posterCtx.drawImage(video, 0, 0, posterWidth, posterHeight);
          posterUrl = posterCanvas.toDataURL("image/webp", 0.6); // 60% quality WebP is ~10KB
        }

        // 2. Setup Full HD Video Compressor (Target Height 1080px)
        const targetHeight = 1080;
        const scale = targetHeight / video.videoHeight;
        const targetWidth = Math.round(video.videoWidth * scale);
        
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to initialize canvas render context"));
          return;
        }
        
        const stream = (canvas as any).captureStream ? (canvas as any).captureStream(24) : null;
        if (!stream) {
          reject(new Error("Canvas stream capture is not supported in this browser"));
          return;
        }
        
        let mimeType = "video/webm;codecs=vp8";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "";
        }
        
        const chunks: Blob[] = [];
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, mimeType ? {
            mimeType,
            videoBitsPerSecond: 1200000 // 1.2 Mbps for 1080p Full HD
          } : undefined);
        } catch (e) {
          reject(e);
          return;
        }
        
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              videoUrl: e.target?.result as string,
              posterUrl: posterUrl
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(blob);
          URL.revokeObjectURL(objectUrl);
        };
        
        // Seek back to start and begin play/record
        video.currentTime = 0;
        video.onseeked = null; // Clear seeks listener
        
        video.play()
          .then(() => {
            recorder.start();
            
            const duration = video.duration || 1;
            let animationId: number;
            
            const drawFrame = () => {
              if (video.paused || video.ended) {
                recorder.stop();
                cancelAnimationFrame(animationId);
                return;
              }
              
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              const progress = Math.min(Math.round((video.currentTime / duration) * 100), 99);
              onProgress(progress);
              animationId = requestAnimationFrame(drawFrame);
            };
            
            animationId = requestAnimationFrame(drawFrame);
          })
          .catch((err) => {
            reject(err);
            URL.revokeObjectURL(objectUrl);
          });
      };
      
      video.onerror = (err) => {
        reject(err);
        URL.revokeObjectURL(objectUrl);
      };
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) return;

    setIsUploading(true);
    setIsMutating(true);
    setCompressionProgress(0);
    setCompressionStatus("Compressing video frames to 1080p Full HD WebM...");

    try {
      const { videoUrl, posterUrl } = await compressVideo(videoFile, (p) => {
        setCompressionProgress(p);
      });

      setCompressionStatus("Uploading optimized reel to Firestore...");
      
      const newId = `reel-${slugify(title.trim())}-${Date.now()}`;
      const docRef = doc(db, "reels", newId);
      
      const newReel: Reel = {
        id: newId,
        videoUrl: videoUrl,
        posterUrl: posterUrl,
        title: title.trim(),
        createdAt: Timestamp.now(),
      };

      await setDoc(docRef, newReel);
      
      setTitle("");
      setVideoFile(null);
      setLocalPreviewUrl("");
      setSelectedReelId(newId);
      // Reset input element
      const fileInput = document.getElementById("reel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Compression/Upload failed:", error);
      alert("Failed to compress and upload the video file. Please check video format.");
    } finally {
      setIsUploading(false);
      setIsMutating(false);
      setCompressionProgress(0);
      setCompressionStatus("");
    }
  };

  const handleDelete = async (reel: Reel) => {
    if (!confirm(`Are you sure you want to delete the reel "${reel.title}"?`)) {
      return;
    }

    setIsMutating(true);
    try {
      const docRef = doc(db, "reels", reel.id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting reel:", error);
      alert("Failed to delete the video reel.");
    } finally {
      setIsMutating(false);
    }
  };

  const previewVideoUrl = localPreviewUrl 
    ? localPreviewUrl 
    : (reels.find((r) => r.id === selectedReelId)?.videoUrl || reels[0]?.videoUrl || "");
  
  const previewTitle = localPreviewUrl 
    ? (title || "Selected Local Draft Video") 
    : (reels.find((r) => r.id === selectedReelId)?.title || reels[0]?.title || "No reels active");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Active Reels Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-[#A47251]/10 p-6 rounded-none shadow-xs">
          <h2 className="font-serif text-xl font-bold text-[#A47251] border-b border-[#A47251]/5 pb-4 mb-4">
            Active Video Reels
          </h2>

          {reels.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#A47251]/55">
              No video reels configured. Upload your first video on the right.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => {
                    setSelectedReelId(reel.id);
                    setLocalPreviewUrl("");
                  }}
                  className={`border p-3 flex flex-col space-y-3 bg-[#F0D8A1]/10 cursor-pointer transition-all duration-200 ${
                    selectedReelId === reel.id || (!selectedReelId && !localPreviewUrl && reels[0]?.id === reel.id)
                      ? "border-[#DD9E59] ring-1 ring-[#DD9E59]"
                      : "border-[#A47251]/10 hover:border-[#A47251]/30"
                  }`}
                >
                  {/* Aspect ratio frame 9:16 */}
                  <div className="relative w-full aspect-[9/16] bg-black border border-[#A47251]/5 overflow-hidden">
                    <video
                      src={reel.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    {(selectedReelId === reel.id || (!selectedReelId && !localPreviewUrl && reels[0]?.id === reel.id)) && (
                      <span className="absolute top-2 left-2 bg-[#DD9E59] text-[#A47251] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 z-10">
                        Live Preview
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-[#A47251] truncate" title={reel.title}>
                        {reel.title}
                      </h3>
                      <p className="text-[9px] text-[#A47251]/55 font-mono mt-0.5">
                        {reel.createdAt?.seconds 
                          ? new Date(reel.createdAt.seconds * 1000).toLocaleDateString()
                          : "Just now"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(reel)}
                      className="text-rose-650 hover:text-rose-800 text-[10px] font-bold tracking-wider uppercase pt-2 cursor-pointer mt-2 text-left"
                    >
                      Delete Reel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Form Column */}
      <div className="space-y-6">
        <div className="bg-white border border-[#A47251]/10 p-6 rounded-none shadow-xs">
          <h2 className="font-serif text-xl font-bold text-[#A47251] border-b border-[#A47251]/5 pb-4 mb-4">
            Upload Video Reel
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reel-title" className="block text-[10px] font-bold uppercase tracking-wider text-[#A47251]/75">
                Reel Title *
              </label>
              <input
                id="reel-title"
                type="text"
                required
                disabled={isUploading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Signature Fondant Decorating"
                className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-none p-2.5 text-xs text-[#A47251] focus:outline-none focus:border-[#DD9E59] disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reel-file-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A47251]/75">
                Choose Video File *
              </label>
              <input
                id="reel-file-input"
                type="file"
                required
                accept="video/*"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setVideoFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setLocalPreviewUrl(url);
                    setSelectedReelId(null);
                  } else {
                    setLocalPreviewUrl("");
                  }
                }}
                className="w-full text-xs text-[#A47251]/70 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-[#A47251]/10 file:text-[10px] file:font-bold file:bg-[#F0D8A1] file:text-[#A47251] file:hover:bg-[#DD9E59] hover:file:text-[#A47251] transition-colors cursor-pointer disabled:opacity-50"
              />
              <p className="text-[9px] text-[#A47251]/55">
                MP4 or WebM format recommended. Short vertical reels (9:16) work best.
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-amber-600 block animate-pulse font-semibold">
                  [PROCESSING] {compressionStatus}
                </span>
                {compressionProgress > 0 && (
                  <div className="w-full bg-[#F0D8A1] h-1.5 rounded-none overflow-hidden border border-[#A47251]/5">
                    <div 
                      className="bg-[#DD9E59] h-full transition-all duration-300"
                      style={{ width: `${compressionProgress}%` }}
                    />
                  </div>
                )}
                <span className="text-[9px] text-[#A47251]/60 block text-right font-mono">
                  {compressionProgress}% Done
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-[#A47251] hover:bg-[#DD9E59] hover:text-[#A47251] text-white font-bold py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none disabled:opacity-50 mt-4"
            >
              {isUploading ? "Uploading..." : "Upload Reel"}
            </button>
          </form>
        </div>
      </div>

      {/* Live Storefront Mockup Preview Section */}
      <div className="lg:col-span-3 mt-4 space-y-4">
        <div className="bg-white border border-[#A47251]/10 p-6 rounded-none shadow-xs">
          <div className="flex items-center justify-between border-b border-[#A47251]/5 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#A47251]">
                Live Storefront Slide 1 Preview
              </h2>
              <p className="text-[11px] text-[#A47251]/60 mt-0.5">
                Simulated real-time view of how the homepage hero slider looks with the active video.
              </p>
            </div>
            {localPreviewUrl && (
              <span className="bg-amber-100 text-amber-850 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                Previewing Local Draft Video
              </span>
            )}
          </div>

          {/* Browser Container Mockup */}
          <div className="border border-[#A47251]/10 bg-[#F0D8A1]/50 p-2 sm:p-4 rounded-none">
            {/* Browser Header Tab Mock */}
            <div className="flex items-center space-x-2 bg-white border border-[#A47251]/10 px-3 py-1.5 text-[10px] font-semibold text-[#A47251]/60 font-mono mb-2">
              <div className="flex space-x-1">
                <span className="w-2.5 h-2.5 bg-[#A47251]/25 border border-[#A47251]/10" />
                <span className="w-2.5 h-2.5 bg-[#A47251]/25 border border-[#A47251]/10" />
                <span className="w-2.5 h-2.5 bg-[#A47251]/25 border border-[#A47251]/10" />
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-[#F0D8A1] border border-[#A47251]/5 px-4 py-0.5 text-center text-[9px] select-none truncate">
                https://warmdelights.com
              </div>
            </div>

            {/* Simulated Hero Section Slide 1 */}
            <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-[#A47251] p-6 sm:p-10 border border-[#A47251]/10">
              <div className="absolute inset-0 bg-gradient-to-b from-[#A47251]/90 via-[#A47251]/45 to-[#A47251]" />
              
              <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left content block */}
                <div className="space-y-4 text-left">
                  <span className="inline-block bg-white/10 border border-white/10 px-3 py-1 text-[8px] font-semibold tracking-widest text-[#F0D8A1] uppercase">
                    Handcrafted Daily in Small Batches
                  </span>
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white leading-tight">
                    Warm Delights
                    <span className="block text-lg font-sans font-light tracking-wide text-[#DD9E59] mt-1">
                      Artisanal Pastries & Cakes
                    </span>
                  </h1>
                  <p className="text-[11px] leading-relaxed text-[#F0D8A1]/75 max-w-sm">
                    From rustic, decadent signature cakes for your special milestones to warm, flaky, golden-brown savory pastries. Baked fresh daily.
                  </p>
                  <div className="flex space-x-3 pt-2">
                    <span className="bg-[#DD9E59] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#A47251] select-none">
                      Order Online
                    </span>
                    <span className="border border-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white select-none">
                      Explore Menu
                    </span>
                  </div>
                </div>

                {/* Right video block */}
                <div className="flex justify-center items-center">
                  {previewVideoUrl ? (
                    <div className="relative w-full max-w-[180px] aspect-[9/16] bg-black border-2 border-white/15 shadow-xl overflow-hidden">
                      <video
                        key={previewVideoUrl} // Remount video player when src changes to force autoplay
                        src={previewVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-[#A47251]/95 border border-white/10 p-2 text-[8px] text-white">
                        <span className="font-bold text-[#DD9E59] uppercase tracking-wider block text-[7px]">Active Reel</span>
                        <div className="truncate font-semibold mt-0.5">{previewTitle}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[180px] aspect-[9/16] bg-[#A47251]/40 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-[9px] text-[#F0D8A1]/40 italic">No reel active. Fallback product image will display on the storefront.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
