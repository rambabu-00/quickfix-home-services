import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Wrench, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

const STEPS = ["Profile Details", "Select Services", "Done"];

export default function ProviderOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 fields
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 fields
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("service_categories").select("id, name, icon").order("name").then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleProfileNext = async () => {
    if (!location.trim()) {
      toast({ title: "Location required", description: "Please enter your city or area.", variant: "destructive" });
      return;
    }
    setStep(1);
  };

  const handleFinish = async () => {
    if (!user) return;
    if (selectedCategories.size === 0) {
      toast({ title: "Select at least one service", variant: "destructive" });
      return;
    }
    setSaving(true);

    const { error: profileError } = await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      bio,
      experience_years: experience,
      location,
      phone,
      is_available: true,
    }, { onConflict: "user_id" });

    if (profileError) {
      toast({ title: "Error saving profile", description: profileError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Delete existing and insert selected services
    await supabase.from("provider_services").delete().eq("provider_id", user.id);
    await supabase.from("provider_services").insert(
      [...selectedCategories].map((cid) => ({ provider_id: user.id, category_id: cid }))
    );

    setSaving(false);
    setStep(2);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        {/* Step indicator */}
        <CardHeader className="pb-2">
          <div className="mb-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step ? "bg-primary text-primary-foreground" :
                  i === step ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-2xl text-center">Welcome! Let's set up your profile</CardTitle>
              <CardDescription className="text-center">Tell customers about yourself so they can find and book you.</CardDescription>
            </>
          )}
          {step === 1 && (
            <>
              <CardTitle className="font-display text-2xl">Which services do you offer?</CardTitle>
              <CardDescription>Select all categories that apply. You can change these later.</CardDescription>
            </>
          )}
          {step === 2 && (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-2xl text-center">You're all set!</CardTitle>
              <CardDescription className="text-center">Your profile is live. Start receiving bookings from customers.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Step 0: Profile Details */}
          {step === 0 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Bio <span className="text-muted-foreground">(optional)</span></label>
                <Textarea
                  placeholder="e.g. Experienced electrician with 5+ years in residential wiring..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Years of Experience</label>
                  <Input type="number" min={0} value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone <span className="text-muted-foreground">(optional)</span></label>
                  <Input placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location <span className="text-destructive">*</span></label>
                <Input placeholder="City, Area (e.g. Hyderabad, Banjara Hills)" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <Button onClick={handleProfileNext} className="w-full">Next: Select Services →</Button>
            </>
          )}

          {/* Step 1: Select Services */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                      selectedCategories.has(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox
                      checked={selectedCategories.has(c.id)}
                      onCheckedChange={() => toggleCategory(c.id)}
                    />
                    <span className="text-sm font-medium">{c.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">← Back</Button>
                <Button onClick={handleFinish} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <Button onClick={() => navigate("/provider/dashboard")} className="w-full">
              Go to Dashboard →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
