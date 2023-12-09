import { QueryFunction, useQuery } from "@tanstack/react-query";

export const useMakeRequest = (
  keys: any,
  handler: QueryFunction<unknown, string[], never> | undefined,
) => {
  const query = useQuery({
    queryKey: keys,
    queryFn: handler,
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
  });
  return query;
};
