/**
 * EduNest Admin Dashboard
 * Protected route — requires Manus login + admin role
 * Shows all contact inquiries and tutor applications with status management
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import {
  Users,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  GraduationCap,
  RefreshCw,
  LogOut,
  ShieldAlert,
} from "lucide-react";

type InquiryStatus = "new" | "contacted" | "resolved";
type ApplicationStatus = "pending" | "approved" | "rejected";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"inquiries" | "applications">("inquiries");

  // Fetch data
  const {
    data: inquiries,
    isLoading: loadingInquiries,
    refetch: refetchInquiries,
  } = trpc.inquiry.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const {
    data: applications,
    isLoading: loadingApps,
    refetch: refetchApps,
  } = trpc.tutorApplication.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  // Mutations
  const updateInquiryStatus = trpc.inquiry.updateStatus.useMutation({
    onSuccess: () => {
      refetchInquiries();
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateAppStatus = trpc.tutorApplication.updateStatus.useMutation({
    onSuccess: () => {
      refetchApps();
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <ShieldAlert size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Admin Access Required
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please log in with your EduNest admin account to access the dashboard.
          </p>
          <button
            onClick={() => startLogin()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Log In with Manus
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your account does not have admin privileges. Please contact the site owner.
          </p>
          <button
            onClick={() => logout()}
            className="w-full py-3 rounded-xl font-bold text-white bg-gray-700 transition-all hover:bg-gray-800"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const newInquiries = inquiries?.filter(i => i.status === "new").length ?? 0;
  const pendingApps = applications?.filter(a => a.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>
                Edu<span style={{ color: "oklch(0.14 0.02 270)" }}>Nest</span>
              </span>
              <span className="ml-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome, <strong>{user.name ?? "Admin"}</strong>
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Inquiries", value: inquiries?.length ?? 0, icon: MessageSquare, color: "oklch(0.68 0.18 50)" },
            { label: "New Inquiries", value: newInquiries, icon: Mail, color: "#3b82f6" },
            { label: "Total Applications", value: applications?.length ?? 0, icon: GraduationCap, color: "oklch(0.14 0.02 270)" },
            { label: "Pending Applications", value: pendingApps, icon: Clock, color: "#f59e0b" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon size={22} style={{ color }} />
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
          {(["inquiries", "applications"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
            >
              {tab === "inquiries" ? (
                <span className="flex items-center gap-2"><MessageSquare size={15} /> Contact Inquiries {newInquiries > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}</span>
              ) : (
                <span className="flex items-center gap-2"><GraduationCap size={15} /> Tutor Applications {pendingApps > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingApps}</span>}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => { refetchInquiries(); refetchApps(); }}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Inquiries Table */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Contact Inquiries ({inquiries?.length ?? 0})
              </h2>
            </div>
            {loadingInquiries ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading inquiries...
              </div>
            ) : !inquiries?.length ? (
              <div className="p-12 text-center text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p>No inquiries yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Role", "Subject / Area", "Message", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inquiries.map(inq => (
                      <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{inq.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{inq.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                              <Mail size={11} /> {inq.email}
                            </a>
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs">
                              <Phone size={11} /> {inq.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{inq.role}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {inq.subject && <div className="flex items-center gap-1"><BookOpen size={11} /> {inq.subject}</div>}
                          {inq.area && <div className="flex items-center gap-1 text-gray-400"><MapPin size={11} /> {inq.area}</div>}
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <p className="text-gray-600 text-xs line-clamp-2">{inq.message}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[inq.status]}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(inq.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={inq.status}
                            onChange={e => updateInquiryStatus.mutate({ id: inq.id, status: e.target.value as InquiryStatus })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateInquiryStatus.isPending}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Applications Table */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Tutor Applications ({applications?.length ?? 0})
              </h2>
            </div>
            {loadingApps ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading applications...
              </div>
            ) : !applications?.length ? (
              <div className="p-12 text-center text-gray-400">
                <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tutor applications yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Qualification", "Subjects", "Experience", "Area / Mode", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{app.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{app.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${app.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                              <Mail size={11} /> {app.email}
                            </a>
                            <a href={`tel:${app.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs">
                              <Phone size={11} /> {app.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]">
                          <p className="line-clamp-2">{app.qualification}</p>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]">
                          <p className="line-clamp-2">{app.subjects}</p>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{app.experience}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1"><MapPin size={11} /> {app.area}</div>
                          <div className="text-gray-400 mt-0.5 capitalize">{app.mode.replace("_", " ")}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={app.status}
                            onChange={e => updateAppStatus.mutate({ id: app.id, status: e.target.value as ApplicationStatus })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateAppStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
