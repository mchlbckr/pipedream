"use client"

import CodePanel from "./CodePanel";
import { useEffect, useState } from "react";
import { serverConnectTokenCreate, getAppsData } from "./server"
import { createClient } from "../../../src/browser"

const frontendHost = process.env.NEXT_PUBLIC_PIPEDREAM_FRONTEND_HOST || "pipedream.com"
const appSlug = process.env.NEXT_PUBLIC_PIPEDREAM_APP_SLUG // required
const oauthAppId = process.env.NEXT_PUBLIC_PIPEDREAM_APP_ID // required only for oauth connections

export default function Home() {
  const pd = createClient({ frontendHost })
  const [externalUserId, setExternalUserId] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<{ login: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [oa, setOauthAppId] = useState<string | null>(null)
  const [app, setApp] = useState<string | null>(null)
  const [apn, setAuthProvisionId] = useState<string | null>(null)

    
  const connectApp = (app: string, oauthAppId: string | undefined) => {
    if (!externalUserId) {
      throw new Error("External user ID is required.");
    }
    if (!token) {
      throw new Error("Token is required.");
    }
    setApp(app)
    if (oauthAppId) setOauthAppId(oauthAppId)
    pd.startConnect({
      app,
      token,
      onSuccess: ({ id: authProvisionId }: any) => {
        setAuthProvisionId(authProvisionId as string)
      }
    })
  }

  const connectAccount = async () => {
    if (!appSlug) return
    await connectApp(appSlug, oauthAppId)
  }

  useEffect(() => {
    setExternalUserId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!externalUserId) {
      setToken(null)
      setGithubData(null)
      setOauthAppId(null)
      setAuthProvisionId(null)
    } else {
      if (!appSlug) return
      (async () => {
        try {
          const { token, expires_at } = await serverConnectTokenCreate({
            app_slug: appSlug,
            oauth_client_id: oauthAppId,
            external_id: externalUserId
          })
          setToken(token)
          setExpiresAt(expires_at)
          const appsData = await getAppsData(externalUserId)
          setGithubData(appsData.github)
        } catch (error) {
          console.error("Error fetching data:", error)
          // Handle error appropriately
        }
      })()
    }
  }, [externalUserId])


  return (
    <main className="p-5 flex flex-col gap-2 max-w-5xl">
      {
        (!appSlug) &&
        <div className="flex flex-col gap-2 text-slate-800 pb-4">
          <div>
            <p>
              The <code>NEXT_PUBLIC_PIPEDREAM_APP_ID</code> variable is not set in your environment. Copy the <code>.env.example</code> file in this directory and fill in the appropriate environment variables.
            </p>
            <CodePanel
              language="plaintext"
              code={`# Config for the Next.js app
# Key based apps only require the app_slug value. OAuth apps require both.
NEXT_PUBLIC_PIPEDREAM_APP_SLUG=github
NEXT_PUBLIC_PIPEDREAM_APP_ID=oa_abc123

# Project credentials — used to authenticate with the Pipedream API.
# These are scoped to the server-side only.
PIPEDREAM_PROJECT_PUBLIC_KEY=pub_abc123
PIPEDREAM_PROJECT_SECRET_KEY=sec_abc123`}
            />
          </div>
        </div>
      }
      {
        appSlug && externalUserId &&
        <div>
          <h1 className="text-2xl font-bold mb-8">Pipedream Connect Example App</h1>
          <div className="mb-8">
            <p>Refer to the <a href="https://pipedream.com/docs/connect" target="_blank nofollow" className="hover:underline text-blue-600">Pipedream Connect docs</a> for a full walkthrough of how to configure Connect for your site. This example app implements Connect in a Next.js (React) app.</p>
          </div>
          <div className="mb-8">
            <p>When your customers connect accounts with Pipedream, you'll pass their unique user ID in your system — whatever you use to identify them. In this example, we generate a random external user ID for you.</p>
          </div>
          <div className="mb-8">
            <span className="font-semibold">External User ID:</span>
            <span className="font-mono"> {externalUserId}</span>
          </div>
          <div className="mb-8">
            <p>In <code>server.ts</code>, the app calls <code>serverConnectTokenCreate</code> to create a short-lived token for the user. You'll use that token to initiate app connection requests from your site securely. SEE THE DOCS.</p>
          </div>
          <div className="mb-8">
            <CodePanel
              language="typescript"
              code={`import { connectTokenCreate } from "@pipedream/sdk";

const { token, expires_at } = await serverConnectTokenCreate({
  app_slug: "github",
  oauth_client_id: "oa_abc123",  // Only required for OAuth apps
  external_id: "${externalUserId}",
})`}
            />
          </div>
          <div className="mb-8">
            <span className="font-semibold">Connect Token:</span>
            <span className="font-mono"> {token}</span>
          </div>
          <p className="mb-8">
            When a user wants to connect an app from your frontend, you'll call <code>pd.startConnect</code> with the token and the OAuth App ID of the app you'd like to connect.
          </p>
          <div className="mb-8">
            <CodePanel
              language="typescript"
              code={`import { startConnect } from "@pipedream/sdk";

pd.startConnect({
  app,
  token,
  onSuccess: () => {
    console.log("Connected!")
  }
})`}
            />
          </div>
          {apn ?
            <div>
              <p>
                <span className="font-semibold">Auth Provision ID:</span>
                <span className="font-mono"> {apn}</span>
              </p>
              <p>
                <span className="font-semibold">OAuth App ID:</span>
                <span className="font-mono"> {oa}</span>
              </p>
            </div>
            : <div>
              <p className="mb-8">
              </p>
              <button style={{ all: "revert" }} onClick={connectAccount}>Connect your account</button>
            </div>
          }
          {
            githubData?.login &&
            <p className="pt-2">Your GitHub username:
              <span><b>{githubData.login}</b></span>
            </p>
          }
        </div>
      }
    </main>
  );
}