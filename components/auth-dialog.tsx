"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSnapSageRecord, getAndProcessRecord } from "@/lib/pocketbase-service"
import { Copy, Check, KeyRound } from "lucide-react"
import { PasswordInput } from "@/components/password-input"

interface AuthDialogProps {
  onSuccess: (passphrase: string, data: any) => void
  onCancel: () => void
}

export default function AuthDialog({ onSuccess, onCancel }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "create">("signin")
  const [name, setName] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPassphrase, setNewPassphrase] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create default data object
      const defaultData = {
        GEMINI_API_KEY: null,
        GITHUB_TOKEN: null,
      }

      const result = await createSnapSageRecord(name, defaultData)
      setNewPassphrase(result.passphrase)
      setRecordId(result.recordId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passphrase.trim()) {
      setError("Please enter your passphrase")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const record = await getAndProcessRecord(passphrase, "view")

      // Parse the data JSON string into an object
      const dataObj = typeof record.data === "string" ? JSON.parse(record.data) : record.data

      // Pass the record data and passphrase to the parent component
      onSuccess(passphrase, {
        id: record.id,
        name: record.name,
        data: dataObj,
        status: record.status !== undefined ? record.status : true, // Default to true if not present
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (newPassphrase) {
      onSuccess(newPassphrase, {
        id: recordId,
        name: name,
        data: {
          GEMINI_API_KEY: null,
          GITHUB_TOKEN: null,
        },
        status: true, // Set status to true for new accounts
      })
    }
  }

  const copyToClipboard = () => {
    if (newPassphrase) {
      navigator.clipboard.writeText(newPassphrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        {!newPassphrase ? (
          <>
            <CardHeader>
              <CardTitle>Get Started with SnapZen</CardTitle>
              <CardDescription>Sign in or create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs
                defaultValue="signin"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "signin" | "create")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="create">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-passphrase" className="flex items-center gap-1">
                        <KeyRound className="h-3.5 w-3.5" /> Passphrase
                      </Label>
                      <PasswordInput
                        id="signin-passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter your passphrase"
                        label="Passphrase"
                      />
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-name">Name</Label>
                      <Input
                        id="create-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={isLoading}
                      />
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              {activeTab === "signin" ? (
                <Button type="submit" disabled={isLoading} onClick={handleSignIn}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} onClick={handleCreateAccount}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              )}
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Save Your Passphrase</CardTitle>
              <CardDescription>Save this passphrase to access your account in the future</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="font-medium text-yellow-800 mb-2 dark:text-yellow-300">
                    Important: Save your passphrase
                  </p>
                  <div className="relative">
                    <div className="font-mono text-sm bg-white p-3 rounded border break-all dark:bg-black/50 dark:border-yellow-800/50">
                      {newPassphrase}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-sm text-yellow-600 mt-2 dark:text-yellow-400">
                    This is the only way to access your account. Please copy it and store it securely.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>I've Saved My Passphrase</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

