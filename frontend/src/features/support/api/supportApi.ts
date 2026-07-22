import { apiClient } from "../../../api/apiClient";

export interface SendSupportEmailPayload {
  subject: string;
  message: string;
}

export async function sendSupportEmail(payload: SendSupportEmailPayload): Promise<void> {
  await apiClient.post("/support/contact", payload);
}
