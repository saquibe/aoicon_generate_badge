"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Share2, Award, Hash } from "lucide-react";
import { toPng } from "html-to-image";

export default function BadgePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      const qrData = user.registrationNumber;
      generateQRCode(qrData);
    }
  }, [session]);

  const generateQRCode = async (data: string) => {
    try {
      const QRCode = await import("qrcode");
      const url = await QRCode.toDataURL(data, {
        width: 150, // Smaller for better fit
        margin: 0, // No margin
        color: {
          dark: "#000000", // Black QR code
          light: "#ffffff",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("QR Code generation error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;

  const handleDownload = async () => {
    if (!badgeRef.current) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the actual dimensions
      const width = badgeRef.current.offsetWidth;
      const height = badgeRef.current.offsetHeight;

      const dataUrl = await toPng(badgeRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          margin: "0 auto",
          display: "block",
        },
        cacheBust: true,
        filter: (node) => {
          return !node.classList?.contains("ignore-in-image");
        },
      });

      const link = document.createElement("a");
      link.download = `AOICON-2026-Badge-${user.registrationNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download badge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!badgeRef.current) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const width = badgeRef.current.offsetWidth;
      const height = badgeRef.current.offsetHeight;

      const dataUrl = await toPng(badgeRef.current, {
        quality: 0.9,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        cacheBust: true,
        filter: (node) => {
          return !node.classList?.contains("ignore-in-image");
        },
      });

      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `AOICON-2026-Badge-${user.registrationNumber}.png`,
        {
          type: "image/png",
        }
      );

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `AOICON 2026 Badge - ${user.name}`,
            text: `My AOICON 2026 KOLKATA Badge - Registration: ${user.registrationNumber}`,
          });
        } catch (err) {
          console.error("Share error:", err);
          handleDownload();
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      handleDownload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mb-2 shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Digital Conference Badge
          </h1>
          <p className="text-gray-600 text-xs">AOICON 2026 • KOLKATA</p>
        </div> */}

        {/* Badge Container */}
        <div
          className="mb-6"
          style={{ width: "350px", maxWidth: "100%", margin: "0 auto" }}
        >
          <Card
            ref={badgeRef}
            className="overflow-hidden shadow-xl border border-gray-300 bg-white mx-auto"
            style={{
              width: "100%",
              maxWidth: "350px",
              margin: "0 auto",
            }}
          >
            {/* Badge Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-5 text-center relative overflow-hidden">
              <div className="relative">
                {/* <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2 shadow">
                  <Award className="w-6 h-6 text-white" />
                </div> */}
                <h2 className="text-xl font-bold text-white mb-1">
                  AOICON 2026
                </h2>
                <p className="text-sm text-blue-100">KOLKATA</p>
              </div>
            </div>

            {/* Badge Content */}
            <div className="px-4 py-4 space-y-4">
              {/* Participant Name */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {user.name}
                </h3>
              </div>

              {/* Registration Number */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  REGISTRATION NUMBER
                </p>
                <div className="inline-block bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-2 rounded-md">
                  <p className="text-base font-bold tracking-wider">
                    {user.registrationNumber}
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              {qrCodeUrl && (
                <div className="text-center pt-2">
                  <div className="inline-block p-2 bg-white rounded border border-gray-300">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan QR for verification
                  </p>
                </div>
              )}
            </div>

            {/* Badge Footer */}
            {/* <div className="bg-gray-50 px-4 py-3 border-t border-gray-300">
              <div className="flex justify-between text-xs text-gray-600">
                <div className="text-center">
                  <p className="font-semibold">YEAR</p>
                  <p>2026</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">EVENT</p>
                  <p>AOICON</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">VENUE</p>
                  <p>KOLKATA</p>
                </div>
              </div>
            </div> */}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 ignore-in-image mt-10">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="h-10 text-sm bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-3 w-3" />
                Download
              </>
            )}
          </Button>

          <Button
            onClick={handleShare}
            disabled={loading}
            variant="outline"
            className="h-10 text-sm border border-gray-500 hover:bg-blue-50 ignore-in-image"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-3 w-3" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Return Button */}
        <div className="text-center ignore-in-image">
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
            className="text-xs text-gray-600 hover:text-gray-900"
            size="sm"
          >
            ← Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
