import api from "./middleware";

export const registerUser = async (body: {
  name: string;
  email: string;
  password: string;
  role: "employer" | "candidate";
  phone?: string;
}) => {
  try {
    const { data } = await api.post("/auth/register", body, {
      withCredentials: true,
    });
    return { success: true as const, response: data };
  } catch (error: any) {
    return {
      success: false as const,
      response: error?.response?.data?.message || "Something went wrong",
    };
  }
};

export const loginUser = async (body: { email: string; password: string }) => {
  try {
    const { data } = await api.post("/auth/login", body, {
      withCredentials: true,
    });
    return { success: true as const, response: data.data };
  } catch (error: any) {
    return {
      success: false as const,
      response: error?.response?.data?.message || "Something went wrong",
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/auth/me", { withCredentials: true });
    return { success: true as const, response: data.data };
  } catch (error: any) {
    return {
      success: false as const,
      response: error?.response?.data?.message || "Something went wrong",
    };
  }
};

export const logoutUser = async () => {
  try {
    const { data } = await api.post("/auth/logout", {}, { withCredentials: true });
    return { success: true as const, response: data };
  } catch (error: any) {
    return {
      success: false as const,
      response: error?.response?.data?.message || "Something went wrong",
    };
  }
};
