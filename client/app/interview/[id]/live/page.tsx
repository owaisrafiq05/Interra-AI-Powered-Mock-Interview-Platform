import { InterviewLiveExperience } from "@/components/interview/InterviewLiveExperience";

export default function InterviewLivePage({
  params,
}: {
  params: { id: string };
}) {
  return <InterviewLiveExperience sessionId={params.id} />;
}
