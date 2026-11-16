import { InteractionType } from '@azure/msal-browser'
import { MsalAuthenticationTemplate } from '@azure/msal-react'
import type { ReactNode } from 'react'
import { AUTH_ENABLED, LOGIN_SCOPES } from '../auth/msal'

export default function AuthRequired({ children }: { children: ReactNode }) {
  if (!AUTH_ENABLED) {
    return <>{children}</>
  }
  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={{ scopes: LOGIN_SCOPES }}
      loadingComponent={() => (
        <main>
          <p>Iniciando sesión...</p>
        </main>
      )}
      errorComponent={({ error }) => (
        <main>
          <p role="alert">No se pudo iniciar sesión: {error?.errorMessage}</p>
        </main>
      )}
    >
      {children}
    </MsalAuthenticationTemplate>
  )
}
