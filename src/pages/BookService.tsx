import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

export default function BookService() {
  const { providerId } = useParams<{ providerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [providerName, setProviderName] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!providerId || !user) return;
    const fetch = async () => {
      const [nameRes, servicesRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", providerId).maybeSingle(),
        supabase.from("provider_services").select("category_id, service_categories(id, name)").eq("provider_id", providerId),
      ]);
      setProviderName(nameRes.data?.full_name ?? "Provider");
      setCategories((servicesRes.data ?? []).map((s: any) => ({ id: s.service_categories?.id, name: s.service_categories?.name })).filter((c: any) => c.id));
      setLoading(false);
    };
    fetch();
  }, [providerId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !providerId) return;
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      customer_id: user.id,
      provider_id: providerId,
      category_id: categoryId || null,
      booking_date: date,
      time_slot: timeSlot,
      notes,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking submitted!", description: "The provider will confirm shortly." });
      navigate("/my-bookings");
    }
  };

  if (!user) return <div className="container py-10 text-center">Please log in to book a service.</div>;
  if (loading) return <div className="container py-10"><Skeleton className="mx-auto h-64 max-w-lg rounded-lg" /></div>;

  return (
    <div className="container flex justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Book {providerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {categories.length > 0 && (
              <div>
                <label className="mb-1 text-sm font-medium">Service</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="mb-1 text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="mb-1 text-sm font-medium">Time Slot</label>
              <Select value={timeSlot} onValueChange={setTimeSlot} required>
                <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 text-sm font-medium">Notes (optional)</label>
              <Textarea placeholder="Describe the issue..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting || !date || !timeSlot}>
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
