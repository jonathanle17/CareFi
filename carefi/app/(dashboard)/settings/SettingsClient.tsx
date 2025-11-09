'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingsClientProps {
  userId: string;
  email: string;
  displayName: string | null;
}

export function SettingsClient({ userId, email, displayName: initialDisplayName }: SettingsClientProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [displayNameSuccess, setDisplayNameSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayNameLoading(true);
    setDisplayNameError(null);
    setDisplayNameSuccess(false);

    try {
      const response = await fetch('/api/settings/update-display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() || null }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to update display name';
        throw new Error(errorMessage);
      }

      setDisplayNameSuccess(true);
      setTimeout(() => {
        setDisplayNameSuccess(false);
        router.refresh();
      }, 2000);
    } catch (error) {
      setDisplayNameError(error instanceof Error ? error.message : 'Failed to update display name');
    } finally {
      setDisplayNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordError('Password must contain at least one letter and one number');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to change password';
        throw new Error(errorMessage);
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-600" />
              <CardTitle>My Account</CardTitle>
            </div>
            <CardDescription>
              Update your account information and display name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-neutral-50"
              />
              <p className="text-xs text-neutral-500">
                Email address cannot be changed
              </p>
            </div>

            {/* Display Name */}
            <form onSubmit={handleUpdateDisplayName} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-neutral-700">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={80}
                />
                <p className="text-xs text-neutral-500">
                  This name will be displayed throughout the application
                </p>
              </div>

              {displayNameError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {displayNameError}
                </div>
              )}

              {displayNameSuccess && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  Display name updated successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={displayNameLoading || displayName === initialDisplayName}
                className="w-full sm:w-auto"
              >
                {displayNameLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Display Name
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-neutral-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-neutral-700">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                />
                <p className="text-xs text-neutral-500">
                  Must be at least 8 characters with at least one letter and one number
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              {passwordError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  Password changed successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

