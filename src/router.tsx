import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { recoveryRedirectTarget } from "./lib/password-recovery";

const createAppRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

export const getRouter = (): ReturnType<typeof createAppRouter> | Promise<never> => {
  // Hand a stray password-reset link to the reset page before any route can
  // treat it as a plain sign-in. Hydration awaits this, so the never-settling
  // promise keeps the app from booting while the page is replaced.
  if (typeof window !== "undefined") {
    const target = recoveryRedirectTarget(window.location.pathname, window.location.hash);
    if (target) {
      window.location.replace(target);
      return new Promise<never>(() => {});
    }
  }

  return createAppRouter();
};
