"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { AnswerEvaluation } from "@/types/types";

export function ScoreRadar({ evaluation }: { evaluation: AnswerEvaluation }) {
  const data = [
    { k: "Technical", v: evaluation.technicalAccuracy },
    { k: "Communication", v: evaluation.communication },
    { k: "Confidence", v: evaluation.confidence },
    { k: "Overall", v: evaluation.score },
  ];
  return (
    <div className="h-[280px] w-full max-w-md">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="k" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 10]} tickCount={6} />
          <Radar
            name="Score"
            dataKey="v"
            stroke="#3a6dd0"
            fill="#3a6dd0"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
