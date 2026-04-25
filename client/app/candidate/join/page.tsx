"use client";
import { joinSession } from "@/API/sessions.api";
import { PageTitle } from "@/components/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CandidateJoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");

  const mut = useMutation({
    mutationFn: () => joinSession({ inviteCode: inviteCode.trim() }),
    onSuccess: (data) => {
      toast.success("Joined interview");
      router.push(`/interview/${data.session._id}/live`);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid code";
      toast.error(msg);
    },
  });

  return (
    <section>
      <PageTitle
        title="Join with invite code"
        desc="Enter the 8-character code your employer shared."
      />
      <div className="mt-8 flex max-w-md flex-col gap-4">
        <Input
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          className="font-mono uppercase"
        />
        <Button
          type="button"
          className="w-fit bg-primaryCol text-darkText"
          disabled={mut.isPending || inviteCode.trim().length < 8}
          onClick={() => mut.mutate()}
        >
          {mut.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Start interview"
          )}
        </Button>
      </div>
    </section>
  );
}
