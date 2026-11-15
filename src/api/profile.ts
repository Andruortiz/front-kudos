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