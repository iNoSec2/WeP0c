import apiClient from "./client";

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get("/api/profile");
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<any> => {
    const response = await apiClient.put("/api/profile", data);
    return response.data;
  },

  changePassword: async (data: PasswordUpdateData): Promise<any> => {
    const response = await apiClient.post("/api/profile/password", data);
    return response.data;
  },
};
