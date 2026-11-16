import {apiFetch} from "./client.ts";
import type {Profile} from "./types.ts";

export function getProfile(): Promise<Profile> {
    return apiFetch<Profile>('/api/v1/me')
}

export function updatePhone(phone: string): Promise<Profile> {
    return apiFetch<Profile>('/api/v1/me/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
    })
}

export function requestPhoneCode(): Promise<void> {
    return apiFetch<void>('/api/v1/me/phone/verification', { method: 'POST' })
}

export function confirmPhoneCode(code: string): Promise<Profile> {
    return apiFetch<Profile>('/api/v1/me/phone/verification/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    })
}
