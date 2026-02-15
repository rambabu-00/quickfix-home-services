import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

export default function ProviderProfileEdit() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [available, setAvailable] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, catsRes, selectedRes] = await Promise.all([
        supabase.from("provider_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("service_categories").select("id, name").order("name"),
        supabase.from("provider_services").select("category_id").eq("provider_id", user.id),
      ]);

      if (profileRes.data) {
        setBio(profileRes.data.bio ?? "");
        setExperience(profileRes.data.experience_years ?? 0);
        setLocation(profileRes.data.location ?? "");
        setPhone(profileRes.data.phone ?? "");
        setAvailable(profileRes.data.is_available ?? true);
      }
      setCategories((catsRes.data as Category[]) ?? []);
      setSelectedCategories(new Set((selectedRes.data ?? []).map((s) => s.category_id)));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Upsert provider profile
    const { error: profileError } = await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      bio,
      experience_years: experience,
      location,
      phone,
      is_available: available,
    }, { onConflict: "user_id" });

    if (profileError) {
      toast({ title: "Error saving profile", description: profileError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Sync provider services
    await supabase.from("provider_services").delete().eq("provider_id", user.id);
    if (selectedCategories.size > 0) {
      await supabase.from("provider_services").insert(
        [...selectedCategories].map((cid) => ({ provider_id: user.id, category_id: cid }))
      );
    }

    toast({ title: "Profile saved!" });
    setSaving(false);
  };

  if (!user) return null;
  if (loading) return <div className="container py-10"><Skeleton className="mx-auto h-64 max-w-lg rounded-lg" /></div>;

  return (
    <div className="container flex justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Edit Provider Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label className="mb-1 text-sm font-medium">Bio</label>
            <Textarea placeholder="Tell customers about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 text-sm font-medium">Years of Experience</label>
            <Input type="number" min={0} value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 text-sm font-medium">Location</label>
            <Input placeholder="City, Area" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 text-sm font-medium">Phone</label>
            <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={available} onCheckedChange={setAvailable} />
            <span className="text-sm font-medium">{available ? "Available for bookings" : "Unavailable"}</span>
          </div>

          <div>
            <label className="mb-2 text-sm font-medium">Services Offered</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50">
                  <Checkbox checked={selectedCategories.has(c.id)} onCheckedChange={() => toggleCategory(c.id)} />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
