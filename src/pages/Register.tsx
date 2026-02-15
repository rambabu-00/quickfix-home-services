import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Wrench, User, Briefcase } from "lucide-react";

type AppRole = "customer" | "service_provider";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("customer");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl">Create an account</CardTitle>
          <CardDescription>Join QuickFix as a customer or service provider</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">I want to:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    role === "customer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <User className={`h-6 w-6 ${role === "customer" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">Book Services</span>
                  <span className="text-xs text-muted-foreground">As a Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("service_provider")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    role === "service_provider" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <Briefcase className={`h-6 w-6 ${role === "service_provider" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">Offer Services</span>
                  <span className="text-xs text-muted-foreground">As a Provider</span>
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
