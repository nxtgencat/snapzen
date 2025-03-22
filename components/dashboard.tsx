"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updateSnapSageRecord, deleteSnapSageRecord } from "@/lib/pocketbase-service"
import { Key, User, Trash2, AlertTriangle, KeyRound, Github, Cpu, LogOut, Eye, Settings, Ban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import { PasswordInput } from "@/components/password-input"

interface DashboardProps {
  passphrase: string
  userData: {
    id: string
    name: string
    data: Record<string, any>
    status?: boolean
  }
  onSignOut: () => void
  onDataUpdated: (newData: any) => void
  onViewLanding: () => void
}

export default function Dashboard({ passphrase, userData, onSignOut, onDataUpdated, onViewLanding }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [name, setName] = useState(userData.name)
  const [dataValues, setDataValues] = useState<Record<string, any>>(userData.data || {})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassphraseDialog, setShowPassphraseDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const isBanned = userData.status === false

  // Track changes to enable/disable save button
  useEffect(() => {
    // Check if name has changed
    const nameChanged = name !== userData.name

    // Check if any data values have changed
    const originalData = userData.data || {}
    const dataChanged = Object.keys({ ...dataValues, ...originalData }).some(
      (key) => dataValues[key] !== originalData[key],
    )

    setHasChanges(nameChanged || dataChanged)
  }, [name, dataValues, userData])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedData = {
        name: name,
        data: JSON.stringify(dataValues),
      }

      const result = await updateSnapSageRecord(userData.id, passphrase, updatedData)

      // Update the parent component with the new data
      onDataUpdated({
        ...userData,
        name: name,
        data: dataValues,
      })

      setSuccess("Profile updated successfully")
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateKey = (key: string, value: any) => {
    setDataValues({
      ...dataValues,
      [key]: value,
    })
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await deleteSnapSageRecord(userData.id, passphrase)
      setShowDeleteDialog(false)
      onSignOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} userName={userData.name} onSignOut={onSignOut} />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {isBanned && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <Ban className="h-4 w-4 text-red-800 dark:text-red-300 mr-2" />
            <AlertDescription className="text-red-800 dark:text-red-300 font-medium">
              Your account has been banned. Please contact support for assistance.
            </AlertDescription>
          </Alert>
        )}

        {!dataValues.GITHUB_TOKEN && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-800 dark:text-yellow-300" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
              Please add your GitHub token to start using SnapZen's screenshot analysis features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar with user info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={isBanned}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Passphrase
                  </Label>
                  <div className="flex items-center">
                    <div className="font-mono text-xs bg-muted p-2 rounded-md truncate flex-1">
                      {passphrase.substring(0, 8)}...{passphrase.substring(passphrase.length - 8)}
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => setShowPassphraseDialog(true)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">This is your secure access key</p>
                </div>

                {isBanned && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-medium mb-1">
                      <Ban className="h-4 w-4" /> Account Status: Banned
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      Your account has been suspended. All features are disabled.
                    </p>
                  </div>
                )}

                <Button variant="outline" className="w-full gap-2" onClick={onSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>

                <Button
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  disabled={isBanned}
                >
                  <Settings className="h-4 w-4" />
                  {showAdvancedSettings ? "Hide Advanced Settings" : "Show Advanced Settings"}
                </Button>

                {showAdvancedSettings && (
                  <div className="pt-4">
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Account
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and all your data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 text-sm text-destructive dark:text-destructive-foreground">
                          All your API keys and settings will be permanently removed.
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Account"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="api-keys" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="api-keys" className="flex items-center gap-2" disabled={isBanned}>
                  <Key className="h-4 w-4" /> API Keys
                </TabsTrigger>
                <TabsTrigger value="app-settings" className="flex items-center gap-2" disabled={isBanned}>
                  <Cpu className="h-4 w-4" /> App Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api-keys" className="space-y-6">
                {isBanned ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
                        <Ban className="h-8 w-8 text-red-800 dark:text-red-300 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Account Banned</h3>
                        <p className="text-red-700 dark:text-red-400">
                          Your account has been suspended. API key configuration is disabled.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>API Keys Configuration</CardTitle>
                      <CardDescription>
                        Configure your API keys to enable SnapZen's screenshot analysis features
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gemini-api-key" className="flex items-center gap-2">
                            Gemini API Key
                            {dataValues.GEMINI_API_KEY ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              >
                                Optional
                              </Badge>
                            )}
                          </Label>
                          <PasswordInput
                            id="gemini-api-key"
                            value={dataValues.GEMINI_API_KEY || ""}
                            onChange={(e) => handleUpdateKey("GEMINI_API_KEY", e.target.value)}
                            placeholder="Enter your Gemini API key"
                            label="Gemini API Key"
                          />
                          <p className="text-xs text-muted-foreground">
                            Used for screenshot analysis with Gemini AI model
                          </p>
                        </div>

                        <hr className="border-border" />

                        <div className="space-y-2">
                          <Label htmlFor="github-token" className="flex items-center gap-2">
                            <Github className="h-4 w-4" /> GitHub Token
                            {dataValues.GITHUB_TOKEN ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              >
                                Required
                              </Badge>
                            )}
                          </Label>
                          <PasswordInput
                            id="github-token"
                            value={dataValues.GITHUB_TOKEN || ""}
                            onChange={(e) => handleUpdateKey("GITHUB_TOKEN", e.target.value)}
                            placeholder="Enter your GitHub token"
                            label="GitHub Token"
                          />
                          <p className="text-xs text-muted-foreground">Used for GitHub integration features</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleUpdateProfile} disabled={isLoading || !hasChanges} className="ml-auto">
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="app-settings" className="space-y-6">
                {isBanned ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
                        <Ban className="h-8 w-8 text-red-800 dark:text-red-300 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Account Banned</h3>
                        <p className="text-red-700 dark:text-red-400">
                          Your account has been suspended. Application settings are disabled.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>Configure how SnapZen works on your system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-center text-muted-foreground">
                          App settings will be available in future updates
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Passphrase Dialog */}
      <Dialog open={showPassphraseDialog} onOpenChange={setShowPassphraseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Your Passphrase
            </DialogTitle>
            <DialogDescription>
              This is your secure access key. Keep it safe and don't share it with anyone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="font-medium text-yellow-800 mb-2 dark:text-yellow-300">Security Warning</p>
            <p className="text-yellow-700 dark:text-yellow-400">
              Anyone with this passphrase can access your account. Store it securely.
            </p>
          </div>
          <div className="font-mono text-sm bg-muted p-3 rounded-md break-all">{passphrase}</div>
          <DialogFooter>
            <Button onClick={() => setShowPassphraseDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

