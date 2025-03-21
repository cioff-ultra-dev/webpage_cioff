import { flag } from "@vercel/flags/next";

export const showHomePage = flag({
  key: "homepage",
  decide: () => true,
});

