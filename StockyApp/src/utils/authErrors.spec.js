import { describe, expect, it } from 'vitest'
import { authErrorMessage } from '@/utils/authErrors'

describe('authErrorMessage', () => {
  it.each([
    ['auth/invalid-credential', /incorrect email or password/i],
    ['auth/wrong-password', /incorrect email or password/i],
    ['auth/user-not-found', /incorrect email or password/i],
    ['auth/email-already-in-use', /already exists/i],
    ['auth/weak-password', /6 characters/i],
    ['auth/too-many-requests', /too many/i],
    ['auth/network-request-failed', /network/i],
  ])('maps %s to a friendly message', (code, pattern) => {
    expect(authErrorMessage({ code })).toMatch(pattern)
  })

  it('shows nothing when the user closes the Google popup', () => {
    expect(authErrorMessage({ code: 'auth/popup-closed-by-user' })).toBe('')
    expect(authErrorMessage({ code: 'auth/cancelled-popup-request' })).toBe('')
  })

  it('falls back to a generic message', () => {
    expect(authErrorMessage({ code: 'auth/something-new' })).toMatch(/something went wrong/i)
    expect(authErrorMessage(undefined)).toMatch(/something went wrong/i)
  })
})
