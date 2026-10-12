import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * @typedef {Object} Food
 * @property {string} id
 * @property {string} name
 * @property {string} nameLower
 * @property {number} calories per serving
 * @property {string} servingLabel
 * @property {number} createdAt epoch ms
 * @property {number} updatedAt epoch ms
 * @property {number} lastUsedAt epoch ms
 */

const foodsRef = (uid) => collection(db, 'users', uid, 'foods')
const foodRef = (uid, id) => doc(db, 'users', uid, 'foods', id)

/** @returns {Promise<Food[]>} most recently used first */
export async function listFoods(uid) {
  const snapshot = await getDocs(query(foodsRef(uid), orderBy('lastUsedAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

/**
 * Foods of this user whose lowercase name starts with `term`, straight from Firestore.
 * @param {string} uid
 * @param {string} term already lowercased and trimmed
 * @returns {Promise<Food[]>}
 */
export async function searchFoodsByPrefix(uid, term) {
  const snapshot = await getDocs(
    query(
      foodsRef(uid),
      where('nameLower', '>=', term),
      where('nameLower', '<=', `${term}`),
      limit(20),
    ),
  )
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

/**
 * @param {string} uid
 * @param {{ name: string, calories: number, servingLabel: string }} input
 * @returns {Promise<Food>}
 */
export async function addFood(uid, { name, calories, servingLabel }) {
  const now = Date.now()
  const data = {
    name,
    nameLower: name.toLowerCase(),
    calories,
    servingLabel,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  }
  const ref = await addDoc(foodsRef(uid), data)
  return { id: ref.id, ...data }
}

/**
 * @param {string} uid
 * @param {string} id
 * @param {{ name: string, calories: number, servingLabel: string }} input
 * @returns {Promise<Partial<Food>>} the fields that changed
 */
export async function updateFood(uid, id, { name, calories, servingLabel }) {
  const changes = {
    name,
    nameLower: name.toLowerCase(),
    calories,
    servingLabel,
    updatedAt: Date.now(),
  }
  await updateDoc(foodRef(uid, id), changes)
  return changes
}

export function deleteFood(uid, id) {
  return deleteDoc(foodRef(uid, id))
}

/** @returns {Promise<number>} the new lastUsedAt */
export async function touchFood(uid, id) {
  const lastUsedAt = Date.now()
  await updateDoc(foodRef(uid, id), { lastUsedAt })
  return lastUsedAt
}
