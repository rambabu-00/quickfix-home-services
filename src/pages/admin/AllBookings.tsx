import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  time_slot: string;
  status: string;
  customer_name: string;
  provider_name: string;
  category_name: string;
}

export default function AllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, service_categories(name)")
        .order("booking_date", { ascending: false });

      if (!data) { setLoading(false); return; }

      const userIds = [...new Set(data.flatMap((b) => [b.customer_id, b.provider_id]))];
      const { data: names } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap = new Map((names ?? []).map((n) => [n.user_id, n.full_name]));

      setBookings(data.map((b: any) => ({
        ...b,
        customer_name: nameMap.get(b.customer_id) ?? "Customer",
        provider_name: nameMap.get(b.provider_id) ?? "Provider",
        category_name: b.service_categories?.name ?? "General",
      })));
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">All Bookings</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{b.customer_name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{b.provider_name}</span>
                    <Badge variant="outline" className="text-xs">{b.category_name}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.time_slot}</span>
                  </div>
                </div>
                <Badge variant="secondary">{b.status}</Badge>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No bookings found.</p>}
        </div>
      )}
    </div>
  );
}
