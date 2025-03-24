"use client"

import { useEffect, useState } from "react"
import AuthDialog from "@/components/auth-dialog"
import Dashboard from "@/components/dashboard"
import { getAndProcessRecord } from "@/lib/pocketbase-service"
import LandingPage from "@/components/landing-page"

export default function Home() {
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing")
  const [currentPassphrase, setCurrentPassphrase] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for stored session on page load
  useEffect(() => {
    const storedPassphrase = localStorage.getItem("Visica_passphrase")
    if (storedPassphrase) {
      setIsLoading(true)
      getAndProcessRecord(storedPassphrase, "view")
        .then((record) => {
          const dataObj = typeof record.data === "string" ? JSON.parse(record.data) : record.data

          setCurrentPassphrase(storedPassphrase)
          setUserData({
            id: record.id,
            name: record.name,
            data: dataObj,
            status: record.status !== undefined ? record.status : true, // Default to true if not present
          })
          setView("dashboard")
        })
        .catch((err) => {
          console.error("Failed to restore session:", err)
          localStorage.removeItem("Visica_passphrase")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleAuthSuccess = (passphrase: string, data: any) => {
    setCurrentPassphrase(passphrase)
    setUserData(data)
    localStorage.setItem("Visica_passphrase", passphrase)
    setView("dashboard")
  }

  const handleSignOut = () => {
    setCurrentPassphrase(null)
    setUserData(null)
    localStorage.removeItem("Visica_passphrase")
    setView("landing")
  }

  const handleGetStarted = () => {
    setView("auth")
  }

  const handleViewLanding = () => {
    setView("landing")
  }

  return (
    <main className="min-h-screen bg-background">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Loading Visica...</p>
          </div>
        </div>
      ) : (
        <>
          {view === "landing" && (
            <LandingPage
              onGetStarted={handleGetStarted}
              isAuthenticated={!!currentPassphrase}
              userName={userData?.name}
              onSignOut={handleSignOut}
            />
          )}

          {view === "auth" && <AuthDialog onSuccess={handleAuthSuccess} onCancel={() => setView("landing")} />}

          {view === "dashboard" && currentPassphrase && userData && (
            <Dashboard
              passphrase={currentPassphrase}
              userData={userData}
              onSignOut={handleSignOut}
              onDataUpdated={(newData) => setUserData(newData)}
              onViewLanding={handleViewLanding}
            />
          )}
        </>
      )}
    </main>
  )
}

