/**
 * EduNest Student/Parent Portal
 * Requires Manus login — shows personal demo bookings and tutor matches
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen, Clock, CheckCircle2, XCircle, Calendar,
  GraduationCap, MapPin, User, LogIn, RefreshCw, Phone, Mail,
} from "lucide-react";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const BOOKING_STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmed", bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   icon: CheckCircle2 },
  completed: { label: "Completed", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  icon: CheckCircle2 },
  cancelled: { label: "Cancelled", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    icon: XCircle },
};

export default function StudentPortal() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");

  const { data: myBookings, isLoading: loadingBookings, refetch } =
    trpc.myBookings.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "oklch(0.68 0.18 50)18" }}>
              <LogIn size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
              Student / Parent Portal
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Log in to view your demo class bookings, track tutor matches, and manage your sessions.
            </p>
            <button
              onClick={() => startLogin()}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 mb-3"
              style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
            >
              Log In to Your Portal
            </button>
            <Link href="/find-tutor">
              <a className="block text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Browse tutors without logging in →
              </a>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const pendingCount   = myBookings?.filter(b => b.status === "pending").length ?? 0;
  const confirmedCount = myBookings?.filter(b => b.status === "confirmed").length ?? 0;
  const completedCount = myBookings?.filter(b => b.status === "completed").length ?? 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
        <div className="max-w-5xl mx-auto">

          {/* Welcome Banner */}
          <div className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.58 0.20 40) 100%)" }}>
            <div className="relative z-10">
              <p className="text-orange-100 text-sm font-semibold mb-1">Welcome back,</p>
              <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {user.name ?? "Student"}
              </h1>
              <p className="text-orange-100 text-sm">{user.email}</p>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <GraduationCap size={100} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: myBookings?.length ?? 0, color: "oklch(0.68 0.18 50)", icon: BookOpen },
              { label: "Confirmed",      value: confirmedCount,          color: "#3b82f6",              icon: CheckCircle2 },
              { label: "Completed",      value: completedCount,          color: "#22c55e",              icon: CheckCircle2 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{value}</div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["bookings", "profile"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize ${activeTab === tab ? "text-white shadow-sm" : "bg-white text-gray-500 hover:text-gray-700"}`}
                style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
              >
                {tab === "bookings" ? (
                  <span className="flex items-center gap-2">
                    <BookOpen size={15} /> My Demo Bookings
                    {pendingCount > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><User size={15} /> My Profile</span>
                )}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {loadingBookings ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading your bookings...
                </div>
              ) : !myBookings?.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No bookings yet</h3>
                  <p className="text-gray-400 mb-6">You haven't booked any demo classes yet. Find a tutor and book your first free demo!</p>
                  <Link href="/find-tutor">
                    <a className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                      <GraduationCap size={18} /> Find a Tutor
                    </a>
                  </Link>
                </div>
              ) : (
                myBookings.map(bk => {
                  const cfg = BOOKING_STATUS_CONFIG[bk.status] ?? BOOKING_STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={bk.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
                      {/* Tutor Avatar */}
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                        {bk.tutorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{bk.tutorName}</h3>
                            <div className="flex items-center gap-3 flex-wrap mt-1">
                              <span className="flex items-center gap-1 text-sm text-gray-500"><BookOpen size={13} /> {bk.subject}</span>
                              <span className="flex items-center gap-1 text-sm text-gray-500"><GraduationCap size={13} /> {bk.grade}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{bk.mode.replace("_", " ")}</span>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <StatusIcon size={12} /> {cfg.label}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-orange-400 flex-shrink-0" />
                            <span><strong>Date:</strong> {bk.preferredDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} className="text-orange-400 flex-shrink-0" />
                            <span><strong>Time:</strong> {bk.preferredTime}</span>
                          </div>
                          {bk.message && (
                            <div className="sm:col-span-2 text-sm text-gray-500 italic">"{bk.message}"</div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-gray-400">Booked on {formatDate(bk.createdAt)}</span>
                          {bk.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <a href={`https://wa.me/918618635627?text=Hi%2C%20I%20booked%20a%20demo%20with%20${encodeURIComponent(bk.tutorName)}%20on%20${encodeURIComponent(bk.preferredDate)}.%20Booking%20ID%3A%20${bk.id}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                                <Phone size={12} /> Follow up on WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* CTA to book more */}
              {myBookings && myBookings.length > 0 && (
                <div className="text-center pt-4">
                  <Link href="/find-tutor">
                    <a className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                      <GraduationCap size={18} /> Book Another Demo Class
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-bold text-gray-800 text-xl mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>My Profile</h2>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                  {(user.name ?? "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{user.name ?? "Student"}</h3>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1"><Mail size={14} /> {user.email ?? "No email"}</p>
                  <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 capitalize">{user.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Total Bookings", value: myBookings?.length ?? 0 },
                  { label: "Pending",        value: pendingCount },
                  { label: "Completed",      value: completedCount },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>{value}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <a className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                    <Mail size={16} /> Contact EduNest Support
                  </a>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
