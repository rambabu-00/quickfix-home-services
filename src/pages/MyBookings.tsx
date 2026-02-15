import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";
import ReviewDialog from "@/components/ReviewDialog";

interface Booking {
  id: string;
  booking_date: string;
  time_slot: string;
  status: string;
  notes: string;
  provider_id: string;
  category_id: string | null;
  provider_name: string;
  category_name: string;
  has_review: boolean;
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, service_categories(name)")
      .eq("customer_id", user.id)
      .order("booking_date", { ascending: false });

    if (!data) { setLoading(false); return; }

    const providerIds = [...new Set(data.map((b) => b.provider_id))];
    const [namesRes, reviewsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", providerIds),
      supabase.from("reviews").select("booking_id").eq("customer_id", user.id),
    ]);

    const nameMap = new Map((namesRes.data ?? []).map((n) => [n.user_id, n.full_name]));
    const reviewedIds = new Set((reviewsRes.data ?? []).map((r) => r.booking_id));

    setBookings(data.map((b: any) => ({
      ...b,
      provider_name: nameMap.get(b.provider_id) ?? "Provider",
      category_name: b.service_categories?.name ?? "General",
      has_review: reviewedIds.has(b.id),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const cancelBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking cancelled" });
      fetchBookings();
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "accepted": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "";
    }
  };

  if (!user) return <div className="container py-10 text-center">Please log in to view your bookings.</div>;

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">My Bookings</h1>

      {loading ? (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">You haven't made any bookings yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{b.provider_name}</span>
                    <Badge variant="outline" className="text-xs">{b.category_name}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {b.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.time_slot}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(b.status)}>{b.status}</Badge>
                  {b.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                  )}
                  {b.status === "completed" && !b.has_review && (
                    <Button variant="outline" size="sm" onClick={() => setReviewBooking(b)}>Leave Review</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewDialog
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => { setReviewBooking(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}
