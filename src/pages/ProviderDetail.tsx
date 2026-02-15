import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface ProviderData {
  user_id: string;
  bio: string;
  experience_years: number;
  location: string;
  phone: string;
  is_available: boolean;
  full_name: string;
  services: string[];
  reviews: { rating: number; comment: string; customer_name: string; created_at: string }[];
  avg_rating: number | null;
}

export default function ProviderDetail() {
  const { providerId } = useParams<{ providerId: string }>();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      if (!providerId) return;

      const [profileRes, providerRes, servicesRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", providerId).maybeSingle(),
        supabase.from("provider_profiles").select("*").eq("user_id", providerId).maybeSingle(),
        supabase.from("provider_services").select("category_id, service_categories(name)").eq("provider_id", providerId),
        supabase.from("reviews").select("rating, comment, created_at, customer_id").eq("provider_id", providerId).order("created_at", { ascending: false }),
      ]);

      if (!providerRes.data) { setLoading(false); return; }

      // Get customer names for reviews
      const customerIds = (reviewsRes.data ?? []).map((r) => r.customer_id);
      const { data: customerNames } = customerIds.length > 0
        ? await supabase.from("profiles").select("user_id, full_name").in("user_id", customerIds)
        : { data: [] };
      const nameMap = new Map((customerNames ?? []).map((n) => [n.user_id, n.full_name]));

      const reviews = (reviewsRes.data ?? []).map((r) => ({
        rating: r.rating,
        comment: r.comment ?? "",
        customer_name: nameMap.get(r.customer_id) ?? "Customer",
        created_at: r.created_at,
      }));

      const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

      setProvider({
        ...providerRes.data,
        full_name: profileRes.data?.full_name ?? "Provider",
        services: (servicesRes.data ?? []).map((s: any) => s.service_categories?.name ?? ""),
        reviews,
        avg_rating: avg,
      });
      setLoading(false);
    };
    fetch();
  }, [providerId]);

  if (loading) return <div className="container py-10"><Skeleton className="h-64 w-full rounded-lg" /></div>;
  if (!provider) return <div className="container py-10 text-center text-muted-foreground">Provider not found.</div>;

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-display text-2xl">{provider.full_name}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {provider.experience_years} years experience</span>
                {provider.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {provider.location}</span>}
                {provider.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {provider.phone}</span>}
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {provider.avg_rating ? provider.avg_rating.toFixed(1) : "No ratings"} ({provider.reviews.length} reviews)
                </span>
              </div>
            </div>
            <Badge variant={provider.is_available ? "default" : "secondary"}>
              {provider.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {provider.bio && <p className="text-muted-foreground">{provider.bio}</p>}

          {provider.services.length > 0 && (
            <div>
              <h3 className="font-display font-semibold">Services Offered</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {provider.services.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            </div>
          )}

          {user && role === "customer" && provider.is_available && (
            <Button size="lg" onClick={() => navigate(`/book/${provider.user_id}`)}>
              Book Now
            </Button>
          )}

          {/* Reviews */}
          <div>
            <h3 className="font-display font-semibold">Reviews</h3>
            {provider.reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {provider.reviews.map((r, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.customer_name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? "fill-warning text-warning" : "text-border"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
