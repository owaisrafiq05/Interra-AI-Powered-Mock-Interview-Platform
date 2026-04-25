import api from "./middleware";
import type { IInterview } from "@/types/types";

export const createInterview = async (body: {
  title: string;
  jobDescription: string;
}) => {
  const { data } = await api.post<{ success: boolean; data: IInterview }>(
    "/interviews",
    body
  );
  return data.data;
};

export const listInterviews = async () => {
  const { data } = await api.get<{ success: boolean; data: IInterview[] }>(
    "/interviews"
  );
  return data.data;
};

export const getInterview = async (id: string) => {
  const { data } = await api.get<{
    success: boolean;
    data: { interview: IInterview; sessions: unknown[] };
  }>(`/interviews/${id}`);
  return data.data;
};

export const updateInterviewStatus = async (
  id: string,
  body: { status: "active" | "closed" }
) => {
  const { data } = await api.patch<{ success: boolean; data: IInterview }>(
    `/interviews/${id}`,
    body
  );
  return data.data;
};
