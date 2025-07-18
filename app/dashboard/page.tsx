// app/dashboard/page.tsx
"use client" // Keep this at the very top

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, PiggyBank, Send, MapPin, MessageCircle, Sparkles, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

// --- NEW IMPORTS ---
import { NeonDB, User, Transaction, Account } from "@/lib/neon"
// If you have a Supabase client configured to get the current user ID, import it here:
// import { createClient } from "@/lib/supabase"; // Adjust path if needed

// --- UPDATED USERDATA INTERFACE ---
interface UserData {
  id: string; // User ID from NeonDB
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  balance: number; // From checking account
  savingsBalance: number; // From savings account
  registeredAt: string; // User creation date
  lastLogin?: string;
  isLoggedIn: boolean;
  transactions: Transaction[]; // Array of fetched transactions
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null); // For handling fetch errors

  // If using Supabase for user auth, initialize client here or import from a shared utility
  // const supabase = createClient(); // Example

  useEffect(() => {
    const fetchRealUserData = async () => {
      setIsLoading(true); // Start loading state
      setError(null); // Clear previous errors

      try {
        // --- Authenticated User ID (IMPORTANT for real apps) ---
        // In a real app, you would get the current logged-in user's ID from Supabase.
        // For now, as a starting point to see data, let's fetch ALL users and accounts
        // and assume the first user in the database is the one whose data we display.
        // YOU WILL NEED TO REPLACE THIS WITH ACTUAL USER ID FETCHING FROM SUPABASE AUTH.

        // Example (if fetching user from Supabase auth and then using their ID):
        // const { data: { user }, error: authError } = await supabase.auth.getUser();
        // if (authError || !user) {
        //   console.warn("No authenticated user or auth error:", authError?.message);
        //   setError("Please log in to view real data.");
        //   setUserData(null);
        //   return;
        // }
        // const currentUserId = user.id;

        // --- Fetching data from NeonDB ---
        // Fetch users (you'll want to modify NeonDB to fetch by ID later)
        const users = await NeonDB.getUsers(1); // Fetches a limited number of users
        const currentUser = users ? users[0] : null; // Get the first user if available

        if (!currentUser) {
          setError("No user data found in the database. Please seed test data.");
          setUserData(null);
          return;
        }

        // Fetch accounts for the user (you'll need to implement getAccountsByUserId in NeonDB)
        // For now, let's assume accounts are associated with the first user's ID
        // Modify NeonDB.getAccounts or add getAccountsByUserId(userId: string)
        // For this example, let's hardcode some balances if not fetching directly
        // Or, if NeonDB.getAccounts provides all, filter them
        const allAccounts = await NeonDB.getAccounts(); // You might need to add getAccounts() or filter by user_id
        const checkingAccount = allAccounts?.find(acc => acc.user_id === currentUser.id && acc.account_type === 'checking');
        const savingsAccount = allAccounts?.find(acc => acc.user_id === currentUser.id && acc.account_type === 'savings');

        // Fetch transactions for the user (you'll need to modify getTransactions to filter by user_id)
        // For this example, let's fetch all and filter by the current user's ID
        const allTransactions = await NeonDB.getTransactions();
        const userTransactions = allTransactions?.filter(tx => tx.user_id === currentUser.id) || [];

        setUserData({
          id: currentUser.id,
          firstName: currentUser.name.split(' ')[0] || 'User',
          lastName: currentUser.name.split(' ')[1] || '',
          fullName: currentUser.name,
          email: currentUser.email,
          balance: checkingAccount?.balance || 0.00, // Use fetched checking balance
          savingsBalance: savingsAccount?.balance || 0.00, // Use fetched savings balance
          registeredAt: currentUser.created_at,
          isLoggedIn: true,
          transactions: userTransactions, // Use fetched transactions
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data.");
        // Fallback to a default user on error, so the UI doesn't break
        setUserData({
          id: "error-fallback",
          firstName: "Fallback",
          lastName: "User",
          fullName: "Fallback User",
          email: "fallback@moneybuddy.com",
          balance: 0.00,
          savingsBalance: 0.00,
          registeredAt: new Date().toISOString(),
          isLoggedIn: true,
          transactions: [],
        });
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    fetchRealUserData();
  }, []); // Empty dependency array means this runs once on mount

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium text-lg drop-shadow-lg">Loading your Money Buddy dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Handle error state display
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96 text-red-500 text-center">
          <p>Error loading dashboard: {error}. Please check database connection and ensure data is seeded.</p>
          {/* You might want a refresh button or redirect here */}
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) { // Fallback if no user data even after loading
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-96 text-white text-center">
                <p>No user data available. Please try logging in or seeding the database.</p>
            </div>
        </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-lime-400/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Welcome Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white drop-shadow-2xl">
                Welcome back, {userData?.firstName || "Friend"}!<span className="text-lime-300 ml-2">🐵</span>
              </h1>
              <p className="text-white/95 text-xl font-medium drop-shadow-lg">
                Your Money Buddy is ready to help you manage your finances
              </p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-2xl font-bold text-purple-900">Current Balance</CardTitle>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-2">
                ${userData?.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-2xl font-bold text-purple-900">Savings Account</CardTitle>
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-2">
                ${userData?.savingsBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                +5.2% APY interest
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-lime-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              What would you like to do today with Money Buddy?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/transfer">
                <Button className="w-full h-24 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <Send className="h-6 w-6" />
                    <span>Send Money</span>
                  </div>
                </Button>
              </Link>

              <Link href="/transfer/geofence">
                <Button className="w-full h-24 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <MapPin className="h-6 w-6" />
                    <span>Geofence Transfer</span>
                  </div>
                </Button>
              </Link>

              <Link href="/deposit">
                <Button className="w-full h-24 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <DollarSign className="h-6 w-6" />
                    <span>Deposit</span>
                  </div>
                </Button>
              </Link>

              <Link href="/chat">
                <Button className="w-full h-24 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <MessageCircle className="h-6 w-6" />
                    <span>AI Assistant</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-900">Recent Activity</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Your latest Money Buddy transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Render transactions from fetched data */}
              {userData?.transactions && userData.transactions.length > 0 ? (
                userData.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {/* You might need icons based on tx.transaction_type */}
                      <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
                        {tx.transaction_type === 'deposit' && <DollarSign className="h-5 w-5 text-white" />}
                        {tx.transaction_type === 'withdrawal' && <Send className="h-5 w-5 text-white" />}
                        {tx.transaction_type === 'transfer' && <Send className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-purple-900">{tx.description || tx.transaction_type}</p>
                        {/* You might want to display user_name if fetched */}
                        <p className="text-sm text-gray-600">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.transaction_type === 'deposit' ? 'text-lime-700' : 'text-red-700'}`}>
                        {tx.transaction_type === 'deposit' ? '+' : '-'}${tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600">{(tx.created_at ? new Date(tx.created_at) : new Date()).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No recent transactions found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

