import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Droplets, Zap, Hammer, Paintbrush, Sparkles, Thermometer, Bug, Cog, Leaf, Truck, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ReactNode> = {
  Droplets: <Droplets className="h-10 w-10" />,
  Zap: <Zap className="h-10 w-10" />,
  Hammer: <Hammer className="h-10 w-10" />,
  Paintbrush: <Paintbrush className="h-10 w-10" />,
  Sparkles: <Sparkles className="h-10 w-10" />,
  Thermometer: <Thermometer className="h-10 w-10" />,
  Bug: <Bug className="h-10 w-10" />,
  Cog: <Cog className="h-10 w-10" />,
  Leaf: <Leaf className="h-10 w-10" />,
  Truck: <Truck className="h-10 w-10" />,
  Wrench: <Wrench className="h-10 w-10" />,
};

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("service_categories").select("*").order("name").then(({ data }) => {
      setCategories((data as Category[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">Service Categories</h1>
      <p className="mt-1 text-muted-foreground">Browse all available services</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((cat) => (
            <Link key={cat.id} to={`/categories/${encodeURIComponent(cat.name)}`}>
              <Card className="group h-full cursor-pointer border-transparent transition-all hover:border-primary/20 hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="rounded-xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {iconMap[cat.icon] ?? <Wrench className="h-10 w-10" />}
                  </div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">No services match your search.</p>
      )}
    </div>
  );
}
