import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
    authority: process.env.NEXT_PUBLIC_MICROSOFT_AUTHORITY!,
    redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
