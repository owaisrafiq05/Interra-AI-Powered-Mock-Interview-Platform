import api from "./middleware";
import type { IInterview, ISession } from "@/types/types";

export const joinSession = async (body: {
  inviteCode?: string;
  title?: string;
  jobDescription?: string;
}) => {
  const { data } = await api.post<{
    success: boolean;
    message?: string;
    data: { session: ISession; interview: IInterview };
  }>("/sessions/join", body);
  return data.data;
};

export const getSession = async (id: string) => {
  const { data } = await api.get<{ success: boolean; data: ISession }>(
    `/sessions/${id}`
  );
  return data.data;
};

export const listMySessions = async () => {
  const { data } = await api.get<{ success: boolean; data: ISession[] }>(
    "/sessions/my"
  );
  return data.data;
};

export const submitAnswer = async (
  sessionId: string,
  formData: FormData
) => {
  const { data } = await api.post<{
    success: boolean;
    data: {
      transcript: string;
      evaluation: {
        score: number;
        technicalAccuracy: number;
        communication: number;
        confidence: number;
        feedback: string;
      };
      followUp: string | null;
    };
  }>(`/sessions/${sessionId}/answer`, formData);
  return data.data;
};

export const completeSession = async (sessionId: string) => {
  const { data } = await api.post<{ success: boolean; data: ISession }>(
    `/sessions/${sessionId}/complete`,
    {}
  );
  return data.data;
};
