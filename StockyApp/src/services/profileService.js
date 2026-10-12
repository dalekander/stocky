import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * @typedef {Object} Profile
 * @property {'male'|'female'} gender
 * @property {number} age
 * @property {number} heightIn
 * @property {number} weightLb
 * @property {'sedentary'|'light'|'moderate'|'active'} activityLevel
 * @property {number} goalRateLb weekly change, negative = lose
 * @property {number} calorieTarget daily kcal
 * @property {number} onboardedAt epoch ms
 * @property {number} updatedAt epoch ms
 */

const profileRef = (uid) => doc(db, 'users', uid)

/** @returns {Promise<Profile|null>} null when the user has not onboarded yet */
export async function getProfile(uid) {
  const snapshot = await getDoc(profileRef(uid))
  return snapshot.exists() ? snapshot.data() : null
}

/** @param {string} uid @param {Profile} profile */
export async function saveProfile(uid, profile) {
  await setDoc(profileRef(uid), profile)
  return profile
}
