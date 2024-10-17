import { unstable_flag as flag } from "@vercel/flags/next";

export const showHomePage = flag({
  key: "homepage",
  decide: () => false,
});
