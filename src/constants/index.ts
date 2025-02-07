const constants = {
  google: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  },
  stripe: {
    lookupKey: process.env.NEXT_PUBLIC_STRIPE_LOOKUP_KEY,
  },
} as const;

export default constants;
