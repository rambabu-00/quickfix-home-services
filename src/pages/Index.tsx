import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, Calendar, ThumbsUp, Droplets, Zap, Hammer, Paintbrush, Sparkles, Thermometer, Bug, Cog, Leaf, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, React.ReactNode> = {
  Droplets: <Droplets className="h-8 w-8" />,
  Zap: <Zap className="h-8 w-8" />,
  Hammer: <Hammer className="h-8 w-8" />,
  Paintbrush: <Paintbrush className="h-8 w-8" />,
  Sparkles: <Sparkles className="h-8 w-8" />,
  Thermometer: <Thermometer className="h-8 w-8" />,
  Bug: <Bug className="h-8 w-8" />,
  Cog: <Cog className="h-8 w-8" />,
  Leaf: <Leaf className="h-8 w-8" />,
  Truck: <Truck className="h-8 w-8" />,
};

const categories = [
  { name: "Plumber", icon: "Droplets", description: "Fix leaks, pipes, and water systems" },
  { name: "Electrician", icon: "Zap", description: "Electrical repairs and installations" },
  { name: "Carpenter", icon: "Hammer", description: "Woodwork, furniture, and fittings" },
  { name: "Painter", icon: "Paintbrush", description: "Interior and exterior painting" },
  { name: "Cleaner", icon: "Sparkles", description: "Deep cleaning and housekeeping" },
  { name: "AC Repair", icon: "Thermometer", description: "Air conditioning service and repair" },
  { name: "Pest Control", icon: "Bug", description: "Pest removal and prevention" },
  { name: "Appliance Repair", icon: "Cog", description: "Home appliance fixes" },
  { name: "Gardening", icon: "Leaf", description: "Lawn care and landscaping" },
  { name: "Moving", icon: "Truck", description: "Packing and relocation services" },
];

const steps = [
  { icon: <Search className="h-8 w-8 text-primary" />, title: "Browse", description: "Find the service you need from our categories" },
  { icon: <Calendar className="h-8 w-8 text-primary" />, title: "Book", description: "Pick a provider, choose a date & time" },
  { icon: <ThumbsUp className="h-8 w-8 text-primary" />, title: "Done", description: "Get the job done and leave a review" },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary/[0.03] py-20 md:py-32">
        <div className="container flex flex-col items-center text-center">
          <h1 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl animate-fade-in">
            Home services,{" "}
            <span className="text-primary">made simple.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Book trusted professionals for plumbing, electrical, cleaning, and more — in just a few clicks.
          </p>
          <div className="mt-8 flex w-full max-w-md gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for a service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => navigate("/categories")}>Search</Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">Our Services</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
            Choose from a wide range of home services provided by verified professionals.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((cat) => (
              <Link key={cat.name} to={`/categories/${encodeURIComponent(cat.name)}`}>
                <Card className="group cursor-pointer border-transparent transition-all hover:border-primary/20 hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {iconMap[cat.icon]}
                    </div>
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">No services found for "{search}"</p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/50 py-16 md:py-24">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  {step.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">Join thousands of happy customers and service providers.</p>
          <div className="mt-6 flex gap-3">
            <Button size="lg" onClick={() => navigate("/register")}>Sign Up Free</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/categories")}>Browse Services</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 QuickFix Services. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Privacy</Link>
            <Link to="/" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
