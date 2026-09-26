export interface UserSession {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: "SECRETARY" | "ACCOUNTANT" | "USER";
  status: string;
  fatherHusbandName?: string;
  address?: string;
}

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gg_token");
};

export const getStoredUser = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("gg_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setSession = (token: string, user: UserSession) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("gg_token", token);
  localStorage.setItem("gg_user", JSON.stringify(user));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("gg_token");
  localStorage.removeItem("gg_user");
};
