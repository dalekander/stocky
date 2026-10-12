const MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-blocked': 'The sign-in popup was blocked. Allow popups and try again.',
}

/** Error codes that mean the user simply backed out, not a failure. */
const SILENT_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

/**
 * @param {{ code?: string }} error
 * @returns {string} friendly message, or '' when nothing should be shown
 */
export function authErrorMessage(error) {
  const code = error?.code
  if (code && SILENT_CODES.has(code)) return ''
  return (code && MESSAGES[code]) || 'Something went wrong. Please try again.'
}
