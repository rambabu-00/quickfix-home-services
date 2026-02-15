import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Provider {
  user_id: string;
  bio: string;
  experience_years: number;
  location: string;
  is_available: boolean;
  full_name: string;
  avg_rating: number | null;
  review_count: number;
}

export default function ProvidersByCategory() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      // Get category id
      const { data: cat } = await supabase
        .from("service_categories")
        .select("id")
        .eq("name", categoryName ?? "")
        .maybeSingle();

      if (!cat) { setLoading(false); return; }

      // Get provider user_ids for this category
      const { data: ps } = await supabase
        .from("provider_services")
        .select("provider_id")
        .eq("category_id", cat.id);

      if (!ps || ps.length === 0) { setLoading(false); return; }

      const providerIds = ps.map((p) => p.provider_id);

      // Get provider profiles
      const { data: profiles } = await supabase
        .from("provider_profiles")
        .select("*")
        .in("user_id", providerIds)
        .eq("is_available", true);

      // Get names
      const { data: names } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", providerIds);

      // Get average ratings
      const { data: reviews } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", providerIds);

      const nameMap = new Map((names ?? []).map((n) => [n.user_id, n.full_name]));
      const ratingMap = new Map<string, { sum: number; count: number }>();
      (reviews ?? []).forEach((r) => {
        const existing = ratingMap.get(r.provider_id) ?? { sum: 0, count: 0 };
        ratingMap.set(r.provider_id, { sum: existing.sum + r.rating, count: existing.count + 1 });
      });

      const result: Provider[] = (profiles ?? []).map((p) => {
        const r = ratingMap.get(p.user_id);
        return {
          ...p,
          full_name: nameMap.get(p.user_id) ?? "Provider",
          avg_rating: r ? r.sum / r.count : null,
          review_count: r?.count ?? 0,
        };
      });

      setProviders(result);
      setLoading(false);
    };

    fetchProviders();
  }, [categoryName]);

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">{categoryName}</h1>
      <p className="mt-1 text-muted-foreground">Available service providers</p>

      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">No providers available for this service yet.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/categories">Browse other services</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <Link key={p.user_id} to={`/provider/${p.user_id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">{p.full_name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {p.is_available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                  {p.bio && <p className="text-sm text-muted-foreground line-clamp-2">{p.bio}</p>}
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {p.experience_years}y exp
                    </span>
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {p.avg_rating ? p.avg_rating.toFixed(1) : "New"} ({p.review_count})
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
