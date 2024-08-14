"use server";

import {
  createClient,
  type ConnectTokenCreateOpts,
  type ConnectTokenResponse,
} from "../../../src";

const {
  PIPEDREAM_API_HOST,
  PIPEDREAM_PROJECT_PUBLIC_KEY,
  PIPEDREAM_PROJECT_SECRET_KEY,
  NEXT_PUBLIC_PIPEDREAM_APP_SLUG,
} = process.env;

if (!NEXT_PUBLIC_PIPEDREAM_APP_SLUG)
  throw new Error("NEXT_PUBLIC_PIPEDREAM_APP_SLUG not set in environment");
if (!PIPEDREAM_PROJECT_PUBLIC_KEY)
  throw new Error("PIPEDREAM_PROJECT_PUBLIC_KEY not set in environment");
if (!PIPEDREAM_PROJECT_SECRET_KEY)
  throw new Error("PIPEDREAM_PROJECT_SECRET_KEY not set in environment");

const pd = createClient({
  publicKey: PIPEDREAM_PROJECT_PUBLIC_KEY,
  secretKey: PIPEDREAM_PROJECT_SECRET_KEY,
  apiHost: PIPEDREAM_API_HOST,
});

export async function serverConnectTokenCreate(opts: ConnectTokenCreateOpts): Promise<ConnectTokenResponse> {
  return pd.connectTokenCreate(opts);
}

export async function getAppsData(externalId: string) {
  const [
    github,
  ] = await Promise.all([
    getGithubData(externalId),
  ]);
  return {
    github,
  };
}

export async function getGithubData(externalId: string) {
  if (!NEXT_PUBLIC_PIPEDREAM_APP_SLUG)
    throw new Error("NEXT_PUBLIC_PIPEDREAM_APP_ID not set in environment");

  const data = await pd.getAccount({
    appId: NEXT_PUBLIC_PIPEDREAM_APP_SLUG ?? "",
    externalId,
  }, {
    includeCredentials: true,
  });
  if (!data?.accounts.length) {
    return null;
  }
  const account = data.accounts[data.accounts.length - 1];
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${account.credentials.oauth_access_token}`,
    },
  });
  const res = await resp.json();

  return res;
}