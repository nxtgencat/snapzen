"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavbarProps {
  isAuthenticated: boolean
  userName?: string
  onSignOut?: () => void
  onGetStarted?: () => void
}

export default function Navbar({ isAuthenticated, userName, onSignOut, onGetStarted }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="#" className="flex items-center gap-2">
            <span className="text-2xl">😎</span>
            <span className="text-xl font-bold">SnapZen</span>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium">Welcome, {userName}</div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        onGetStarted?.()
                        setIsOpen(false)
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {!isAuthenticated && <Button onClick={onGetStarted}>Get Started</Button>}
        </div>
      </div>
    </header>
  )
}

