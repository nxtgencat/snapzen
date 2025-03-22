"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Keyboard, Zap, Github, Cpu, KeyRound, Download } from "lucide-react"
import Navbar from "@/components/navbar"
import { KeyboardShortcut } from "@/components/keyboard-shortcut"
import { ThemeToggle } from "@/components/theme-toggle"

interface LandingPageProps {
  onGetStarted: () => void
  isAuthenticated?: boolean
  userName?: string
  onSignOut?: () => void
}

interface Release {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
  published_at: string
}

export default function LandingPage({ onGetStarted, isAuthenticated = false, userName, onSignOut }: LandingPageProps) {
  const [latestRelease, setLatestRelease] = useState<Release | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://api.github.com/repos/nxtgencat/snapzen/releases/latest")
        if (response.ok) {
          const data = await response.json()
          setLatestRelease(data)
        }
      } catch (error) {
        console.error("Failed to fetch release:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestRelease()
  }, [])

  const getExeAsset = () => {
    if (!latestRelease || !latestRelease.assets) return null
    return latestRelease.assets.find((asset) => asset.name.endsWith(".exe"))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const exeAsset = getExeAsset()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} userName={userName} onSignOut={onSignOut} onGetStarted={onGetStarted} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Intelligent Screenshot Analysis with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              SnapZen leverages AI models like Gemini and GPT-4o to extract and analyze content from your screenshots
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {exeAsset ? (
                <Button size="lg" className="gap-2" asChild>
                  <a href={exeAsset.browser_download_url} download>
                    <Download className="h-4 w-4" />
                    Download v{latestRelease?.tag_name.replace("v", "")}
                    <span className="text-xs ml-1 opacity-70">({formatFileSize(exeAsset.size)})</span>
                  </a>
                </Button>
              ) : (
                <Button size="lg" className="gap-2" disabled={isLoading}>
                  <Download className="h-4 w-4" />
                  {isLoading ? "Loading..." : "Download App"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SnapZen runs silently in the background, ready to analyze your screenshots with powerful AI models at the
              press of a key.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Analyze screenshots using Gemini AI, GPT-4o Mini, or GPT-4o to extract structured data and insights.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Keyboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Quick Keyboard Shortcuts</h3>
              <p className="text-muted-foreground">
                Use simple keyboard shortcuts to capture and analyze screenshots without interrupting your workflow.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Lightweight Background Process</h3>
              <p className="text-muted-foreground">
                SnapZen runs silently in the system tray, using minimal resources while always being ready when you need
                it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 my-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SnapZen is designed to be simple and efficient, helping you analyze screenshots with just a few keystrokes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">1. Press Shortcut</h3>
            <p className="text-muted-foreground">
              Use Z+A for Gemini, Z+S for GPT-4o Mini, or Z+D for GPT-4o analysis.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">2. Capture Screenshot</h3>
            <p className="text-muted-foreground">
              SnapZen automatically captures your current screen or selected area.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">3. AI Analysis</h3>
            <p className="text-muted-foreground">
              The AI model processes the screenshot to extract and analyze the content.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">4. View Results</h3>
            <p className="text-muted-foreground">Results appear instantly in a window. Press Z+X to close when done.</p>
          </div>
        </div>

        <div className="mt-12 bg-muted p-6 rounded-lg border border-border max-w-2xl mx-auto">
          <h3 className="font-medium mb-4 text-center">Keyboard Shortcuts Reference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KeyboardShortcut keys={["Z", "A"]} label="Gemini Analysis" />
            <KeyboardShortcut keys={["Z", "S"]} label="GPT-4o Mini" />
            <KeyboardShortcut keys={["Z", "D"]} label="GPT-4o" />
            <KeyboardShortcut keys={["Z", "X"]} label="Close Results" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 mt-auto">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SnapZen. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/nxtgencat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                @nxtgencat
              </a>
              <ThemeToggle className="h-8 w-8" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

