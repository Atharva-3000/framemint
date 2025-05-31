"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, RotateCcw, Wallet, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConnectButton } from "@/components/ConnectWallet"
import { useAccount } from "wagmi"
import { fromDataURLtoBuffer, mintWithContract } from "@/lib/utils"
import { generateImage } from "@/utils/img-uploading"

export default function FrameMint() {
  const {address} = useAccount();
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const eventName = "Monad Blitz Bangalore"
  const eventSubtitle = "EXCLUSIVE ACCESS"
  const [isMinting, setIsMinting] = useState(false)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user",
        },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame
    ctx.drawImage(video, 0, 0)

    // Add the banner overlay
    const bannerHeight = canvas.height * 0.12
    const bannerY = canvas.height * 0.75

    // Banner background (solid purple)
    ctx.save()
    ctx.translate(canvas.width / 2, bannerY + bannerHeight / 2)
    ctx.rotate((-3 * Math.PI) / 180) // -3 degrees
    ctx.fillStyle = "#836EF9"
    ctx.fillRect(-canvas.width / 2, -bannerHeight / 2, canvas.width, bannerHeight)

    // Add diagonal lines pattern
    ctx.strokeStyle = "rgba(255,255,255,0.15)"
    ctx.lineWidth = 3
    const spacing = 24
    for (let x = -canvas.width / 2 - bannerHeight; x < canvas.width / 2 + bannerHeight; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, -bannerHeight / 2)
      ctx.lineTo(x + bannerHeight, bannerHeight / 2)
      ctx.stroke()
    }

    // Add text: 'Monad Blitz'
    ctx.fillStyle = "#fff"
    ctx.font = `bold ${bannerHeight * 0.45}px 'Inter', sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(0,0,0,0.18)"
    ctx.shadowBlur = 6
    ctx.fillText("Monad Blitz Bangalore", 0, 0)
    ctx.shadowBlur = 0
    ctx.restore()

    const imageDataUrl = canvas.toDataURL("image/png")
    setCapturedImage(imageDataUrl)
    setShowPreview(true)

    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const retakePhoto = () => {
    setCapturedImage(null)
    setShowPreview(false)
    startCamera()
  }

  const connectWallet = async () => {
    setIsCapturing(true)
    setTimeout(() => {
      setIsCapturing(false)
      startCamera()
    }, 2000)
  }

  const mintPhoto = async () => {
    if (!capturedImage || !address) {
      alert("No image captured!")
      return
    }
    setIsMinting(true);
    try {
      console.log("Minting photo...",address)
      const base64String = capturedImage.split(",")[1];
      const result = await generateImage(base64String);
      console.log("Image generation result:", result)
      if (!result) {
        alert("Failed to upload image or metadata to IPFS.")
        setIsMinting(false);
        return
      }
      if(result.nftIpfsUrl){
        await mintWithContract(result.nftIpfsUrl);
        console.log("NFT Metadata IPFS URL:", result.nftIpfsUrl)
        alert(`NFT ready to mint! Metadata IPFS URL:\n${result.nftIpfsUrl}`)
      }else{
        setIsMinting(false);
        return ;
      }
    } catch (err) {
      console.error("Error minting photo:", err)
      alert("Something went wrong while minting.")
    }
    setIsMinting(false);
  }

  useEffect(() => {
    if (address && !showPreview && !stream) {
      startCamera();
    }
  }, [address, showPreview, stream, startCamera]);

  useEffect(() => {
    if (!address && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [address, stream]);

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <div className="text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  FrameMint
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Capture. Frame. Mint.</h2>
              <p className="text-white/70 text-lg">Create exclusive event memories on the blockchain</p>
            </div>

            <div className="space-y-4">
              <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                <Zap className="w-3 h-3 mr-1" />
                {eventName}
              </Badge>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2">How it works:</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">
                      1
                    </div>
                    <span>Connect your wallet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">
                      2
                    </div>
                    <span>Capture your moment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">
                      3
                    </div>
                    <span>Mint as NFT</span>
                  </div>
                </div>
              </div>
            </div>

            <ConnectButton/>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                FrameMint
              </h1>
              <p className="text-white/60 text-sm">Event Photo Minting</p>
            </div>
          </div>

          <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <ConnectButton/>
          </Badge>
        </div>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Camera/Preview Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {showPreview ? "Preview Your Shot" : "Live Camera"}
                  </h2>
                  <Badge variant="outline" className="border-yellow-400/30 text-yellow-400">
                    {eventName}
                  </Badge>
                </div>

                {/* Browser-style Camera Interface */}
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
                  {/* Browser Header */}
                  <div className="bg-slate-700 px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-slate-600 rounded-md px-3 py-1 text-sm text-white/70 ml-4">
                      framemint.app/capture
                    </div>
                  </div>

                  {/* Camera View */}
                  <div className="relative aspect-video bg-black">
                    {showPreview && capturedImage ? (
                      <img
                        src={capturedImage || "/placeholder.svg"}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    )}

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      {!showPreview ? (
                        <Button
                          onClick={capturePhoto}
                          size="lg"
                          className="bg-white hover:bg-white/90 text-black rounded-full w-16 h-16 p-0 shadow-lg"
                        >
                          <Camera className="w-8 h-8" />
                        </Button>
                      ) : (
                        <div className="flex space-x-3">
                          <Button
                            onClick={retakePhoto}
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake
                          </Button>
                          <Button
                            onClick={mintPhoto}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold"
                            disabled={isMinting}
                          >
                            {isMinting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                <span>Minting...</span>
                              </div>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Mint NFT
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Live indicator */}
                    {!showPreview && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500/90 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
                  <h4 className="font-semibold text-yellow-400">{eventName}</h4>
                  <p className="text-white/70 text-sm">{eventSubtitle}</p>
                </div>
                <div className="text-sm text-white/60">
                  <p>Your photo will include an exclusive event banner that proves your attendance.</p>
                </div>
              </div>
            </Card>

            {/* Banner Preview */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Banner Preview</h3>
              <div className="relative rounded-lg p-4 transform -rotate-2 shadow-lg flex items-center justify-center min-h-[80px]" style={{ background: '#836EF9' }}>
                {/* Diagonal lines pattern */}
                <svg className="absolute inset-0 w-full h-full rounded-lg" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="diagonalLines" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(45)">
                      <rect x="0" y="0" width="8" height="24" fill="white" fillOpacity="0.13" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalLines)" />
                </svg>
                <div className="relative z-10 w-full flex items-center justify-center">
                  <span className="font-bold text-white text-lg md:text-xl drop-shadow-lg tracking-wide" style={{letterSpacing: '0.04em'}}>Monad Blitz</span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Session Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">1</div>
                  <div className="text-white/60 text-sm">Photos Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-white/60 text-sm">NFTs Minted</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
