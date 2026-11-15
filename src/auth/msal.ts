import { InteractionRequiredAuthError, createStandardPublicClientApplication } from '@azure/msal-browser'
import type { IPublicClientApplication } from '@azure/msal-browser'
import { setTokenProvider } from './token'

const TENANT_ID: string | undefined = import.meta.env.VITE_ENTRA_TENANT_ID
export const CLIENT_ID: string | undefined = import.meta.env.VITE_ENTRA_CLIENT_ID

/** Without a client id the app runs without login, and the backend (profile local) trusts X-Dev-User. */
export const AUTH_ENABLED = Boolean(CLIENT_ID && TENANT_ID)

export const LOGIN_SCOPES = [`api://${CLIENT_ID}/access_as_user`]

export async function createAuth(): Promise<IPublicClientApplication> {
  const msal = await createStandardPublicClientApplication({
    auth: {
      clientId: CLIENT_ID!,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: { cacheLocation: 'sessionStorage' },
  })

  setTokenProvider(async () => {
    const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0]
    if (!account) {
      return null
    }
    try {
      return (await msal.acquireTokenSilent({ scopes: LOGIN_SCOPES, account })).accessToken
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        await msal.acquireTokenRedirect({ scopes: LOGIN_SCOPES, account })
      }
      return null
    }
  })
  return msal
}
