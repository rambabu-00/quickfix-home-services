import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

interface Props {
  booking: { id: string; provider_id: string; provider_name: string };
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReviewDialog({ booking, onClose, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      customer_id: user.id,
      provider_id: booking.provider_id,
      rating,
      comment,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      onSubmitted();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Review {booking.provider_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)}>
                <Star className={`h-7 w-7 cursor-pointer transition-colors ${i < rating ? "fill-warning text-warning" : "text-border"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
