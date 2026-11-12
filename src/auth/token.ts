const KEY = 'kudos.token'

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(KEY, token)
    } else {
      sessionStorage.removeItem(KEY)
    }
  } catch {
    return
  }
}
