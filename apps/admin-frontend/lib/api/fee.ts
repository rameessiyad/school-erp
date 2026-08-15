import { apiClient } from "../axios/client";
import {
  CreatePaymentValues,
  StudentFee,
  StudentFeeQuery,
  FeePayment,
} from "../validations/fee";

export const feeApi = {
  list: async (query?: StudentFeeQuery): Promise<StudentFee[]> => {
    const { data } = await apiClient.get("/student-fees", { params: query });
    return data;
  },

  get: async (id: string): Promise<StudentFee> => {
    const { data } = await apiClient.get(`/student-fees/${id}`);
    return data;
  },

  listByStudent: async (studentId: string): Promise<StudentFee[]> => {
    const { data } = await apiClient.get(`/student-fees/student/${studentId}`);
    return data;
  },

  recordPayment: async (payload: CreatePaymentValues): Promise<FeePayment> => {
    const { data } = await apiClient.post("/fee-payments", payload);
    return data;
  },

  listPayments: async (studentFeeId: string): Promise<FeePayment[]> => {
    const { data } = await apiClient.get(
      `/fee-payments/student-fee/${studentFeeId}`,
    );
    return data;
  },

  getPayment: async (id: string): Promise<FeePayment> => {
    const { data } = await apiClient.get(`/fee-payments/${id}`);
    return data;
  },
};
