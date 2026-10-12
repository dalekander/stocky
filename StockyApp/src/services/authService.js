import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '@/services/firebase'

/**
 * @typedef {Object} AppUser
 * @property {string} uid
 * @property {string|null} email
 * @property {string|null} displayName
 */

/** @returns {AppUser} */
const toAppUser = ({ uid, email, displayName }) => ({ uid, email, displayName })

export async function signUpWithEmail(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
  return toAppUser(user)
}

export async function signInWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
  return toAppUser(user)
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
  return toAppUser(user)
}

export function signOut() {
  return firebaseSignOut(auth)
}

/**
 * @param {(user: AppUser|null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function observeAuth(callback) {
  return onAuthStateChanged(auth, (user) => callback(user ? toAppUser(user) : null))
}
