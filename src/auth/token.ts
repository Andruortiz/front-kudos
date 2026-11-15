type TokenProvider = () => Promise<string | null>

let provider: TokenProvider = async () => null

/** Who gives the access token: Microsoft Entra in real use, nobody in local development with X-Dev-User. */
export function setTokenProvider(next: TokenProvider): void {
  provider = next
}

export function getToken(): Promise<string | null> {
  return provider()
}
