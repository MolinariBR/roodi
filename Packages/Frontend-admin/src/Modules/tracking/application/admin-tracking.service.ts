import { getAdminTracking, type TrackingTimelineResponse } from "@core/api-client/admin-api.server";

export const getTrackingTimelineByOrderId = async (orderId: string): Promise<{
  data: TrackingTimelineResponse["data"] | null;
  error: string | null;
}> => {
  const result = await getAdminTracking(orderId);
  return {
    data: result.data?.data ?? null,
    error: result.error,
  };
};
