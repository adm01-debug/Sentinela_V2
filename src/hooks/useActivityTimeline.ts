import { useQuery } from "@tanstack/react-query";

export function useActivityTimeline(employeeId: string, date: string) {
  return useQuery({
    queryKey: ["activity-timeline", employeeId, date],
    queryFn: async () => {
      // Return empty array - table may not exist
      return [];
    },
    enabled: !!employeeId,
  });
}
