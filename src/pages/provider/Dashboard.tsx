import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  booking_date: string;
  time_slot: string;
  status: string;
  notes: string;
  customer_name: string;
  category_name: string;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if provider has completed onboarding (has a profile + at least 1 service)
  useEffect(() => {
    if (!user) return;
    const checkOnboarding = async () => {
      const [profileRes, servicesRes] = await Promise.all([
        supabase.from("provider_profiles").select("id, location").eq("user_id", user.id).maybeSingle(),
        supabase.from("provider_services").select("id").eq("provider_id", user.id).limit(1),
      ]);
      const hasProfile = !!profileRes.data?.location;
      const hasServices = (servicesRes.data?.length ?? 0) > 0;
      if (!hasProfile || !hasServices) {
        navigate("/provider/onboarding", { replace: true });
      }
    };
    checkOnboarding();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, service_categories(name)")
      .eq("provider_id", user.id)
      .order("booking_date", { ascending: false });

    if (!data) { setLoading(false); return; }

    const customerIds = [...new Set(data.map((b) => b.customer_id))];
    const { data: names } = await supabase.from("profiles").select("user_id, full_name").in("user_id", customerIds);
    const nameMap = new Map((names ?? []).map((n) => [n.user_id, n.full_name]));

    setBookings(data.map((b: any) => ({
      ...b,
      customer_name: nameMap.get(b.customer_id) ?? "Customer",
      category_name: b.service_categories?.name ?? "General",
    })));
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Booking ${status}` });
      fetchBookings();
    }
  };

  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) => b.status === "accepted");
  const past = bookings.filter((b) => ["completed", "cancelled", "rejected"].includes(b.status));

  if (!user) return null;

  const BookingCard = ({ b, showActions }: { b: Booking; showActions?: boolean }) => (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{b.customer_name}</span>
            <Badge variant="outline" className="text-xs">{b.category_name}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {b.booking_date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.time_slot}</span>
          </div>
          {b.notes && <p className="mt-1 text-sm text-muted-foreground">{b.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showActions && b.status === "pending" && (
            <>
              <Button size="sm" onClick={() => updateStatus(b.id, "accepted")}>Accept</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "rejected")}>Reject</Button>
            </>
          )}
          {b.status === "accepted" && (
            <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Mark Complete</Button>
          )}
          <Badge variant="secondary">{b.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Provider Dashboard</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/provider/profile"><Settings className="mr-1 h-4 w-4" /> Edit Profile</Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <Tabs defaultValue="pending" className="mt-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="flex flex-col gap-3 mt-4">
            {pending.length === 0 ? <p className="text-muted-foreground">No pending bookings.</p> : pending.map((b) => <BookingCard key={b.id} b={b} showActions />)}
          </TabsContent>
          <TabsContent value="active" className="flex flex-col gap-3 mt-4">
            {active.length === 0 ? <p className="text-muted-foreground">No active bookings.</p> : active.map((b) => <BookingCard key={b.id} b={b} />)}
          </TabsContent>
          <TabsContent value="past" className="flex flex-col gap-3 mt-4">
            {past.length === 0 ? <p className="text-muted-foreground">No past bookings.</p> : past.map((b) => <BookingCard key={b.id} b={b} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
