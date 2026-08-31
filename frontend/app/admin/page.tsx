"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Loader2,
  Search,
} from "lucide-react";

type Tab = "analytics" | "users" | "bookings" | "disputes" | "transactions";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Admin privileges required.</p>
      </div>
    );
  }

  const tabs: { label: string; value: Tab; icon: any }[] = [
    { label: "Analytics", value: "analytics", icon: BarChart3 },
    { label: "Users", value: "users", icon: Users },
    { label: "Bookings", value: "bookings", icon: ShoppingBag },
    { label: "Disputes", value: "disputes", icon: AlertTriangle },
    { label: "Transactions", value: "transactions", icon: DollarSign },
  ];

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "analytics" && <AnalyticsSection />}
      {activeTab === "users" && <UsersSection />}
      {activeTab === "bookings" && <BookingsSection />}
      {activeTab === "disputes" && <DisputesSection />}
      {activeTab === "transactions" && <TransactionsSection />}
    </div>
  );
}

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold">{analytics?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Listings</p>
            <p className="text-3xl font-bold">{analytics?.totalListings || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-3xl font-bold">{analytics?.totalBookings || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold">
              {formatPrice(analytics?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {analytics?.bookingsByStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {analytics.bookingsByStatus.map((item: any) => (
                <div
                  key={item.status}
                  className="bg-muted px-4 py-3 rounded-lg text-center min-w-[120px]"
                >
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <p className="text-2xl font-bold mt-1">{item._count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics?.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {analytics.monthlyRevenue.map((item: any) => (
                <div
                  key={`${item.year}-${item.month}`}
                  className="bg-muted p-4 rounded-lg text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.year, item.month - 1).toLocaleString(
                      "default",
                      { month: "short", year: "2-digit" }
                    )}
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {formatPrice(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search: searchTerm });
      setUsers(res.data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(search)}
          />
        </div>
        <Button onClick={() => fetchUsers(search)}>Search</Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">College</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Role</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 hidden md:table-cell">{u.college}</td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function BookingsSection() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.getBookings(params);
      setBookings(res.data.bookings || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"].map(
            (s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{b.listing?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.renter?.name} → {b.lender?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(b.startDate)} – {formatDate(b.endDate)} ·{" "}
                      {formatPrice(b.totalAmount)}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(b.status)}>
                    {b.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No bookings found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DisputesSection() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveDialog, setResolveDialog] = useState<any>(null);
  const [resolution, setResolution] = useState("");
  const [resolveStatus, setResolveStatus] = useState("RESOLVED_RENTER");
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDisputes();
      setDisputes(res.data.disputes || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async () => {
    if (!resolveDialog) return;
    setResolving(true);
    try {
      await adminApi.resolveDispute(resolveDialog.id, {
        status: resolveStatus,
        resolution,
      });
      setResolveDialog(null);
      setResolution("");
      fetchDisputes();
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No disputes found.
        </p>
      ) : (
        disputes.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{d.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    {d.raisedBy?.name} vs {d.against?.name}
                  </p>
                </div>
                <Badge
                  variant={d.status === "OPEN" ? "destructive" : "secondary"}
                >
                  {d.status}
                </Badge>
              </div>
              <p className="text-sm">{d.description}</p>
              {d.booking && (
                <p className="text-sm text-muted-foreground">
                  Booking: {d.booking.listing?.title} ·{" "}
                  {formatPrice(d.booking.totalAmount)}
                </p>
              )}
              {(d.status === "OPEN" || d.status === "UNDER_REVIEW") && (
                <Button
                  size="sm"
                  onClick={() => setResolveDialog(d)}
                >
                  Resolve
                </Button>
              )}
              {d.resolution && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium">Resolution:</p>
                  <p>{d.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Resolve Dialog */}
      <Dialog
        open={!!resolveDialog}
        onOpenChange={(open) => !open && setResolveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={resolveStatus} onValueChange={setResolveStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESOLVED_RENTER">
                    Favor Renter (Full Refund)
                  </SelectItem>
                  <SelectItem value="RESOLVED_LENDER">
                    Favor Lender (Payout + Deposit)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe the resolution..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolving || !resolution}>
              {resolving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionsSection() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getTransactions()
      .then((res) => setTransactions(res.data.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Description</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
            <th className="text-right p-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t hover:bg-muted/50">
              <td className="p-3">{tx.description}</td>
              <td className="p-3">
                <Badge variant="outline">{tx.type}</Badge>
              </td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">
                {formatDate(tx.createdAt)}
              </td>
              <td
                className={`p-3 text-right font-medium ${
                  tx.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatPrice(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          No transactions found.
        </p>
      )}
    </div>
  );
}
