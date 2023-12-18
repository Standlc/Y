import { QueryFunction, useQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { StatusPopupContext } from "./components/Layouts";

export const useMakeRequest = (
  keys: any,
  handler: QueryFunction<unknown, string[], never> | undefined,
) => {
  const { setStatusData } = useContext(StatusPopupContext);

  const query = useQuery({
    queryKey: keys,
    queryFn: handler,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      setStatusData({
        title: "An error occured",
        isSuccess: false,
      });
    }
  }, [query.isError]);

  return query;
};
