import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

/** @typedef {import('@/utils/calories').Entry} Entry */

const entriesRef = (uid) => collection(db, 'users', uid, 'entries')
const entryRef = (uid, id) => doc(db, 'users', uid, 'entries', id)
const toEntries = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

/** @returns {Promise<Entry[]>} oldest first */
export async function listEntriesByDate(uid, date) {
  const snapshot = await getDocs(query(entriesRef(uid), where('date', '==', date)))
  return toEntries(snapshot).sort((a, b) => a.createdAt - b.createdAt)
}

/**
 * @param {string} uid
 * @param {string} start inclusive "YYYY-MM-DD"
 * @param {string} end inclusive "YYYY-MM-DD"
 * @returns {Promise<Entry[]>}
 */
export async function listEntriesInRange(uid, start, end) {
  const snapshot = await getDocs(
    query(entriesRef(uid), where('date', '>=', start), where('date', '<=', end)),
  )
  return toEntries(snapshot)
}

/**
 * @param {string} uid
 * @param {Omit<Entry, 'id'>} entry
 * @returns {Promise<Entry>}
 */
export async function addEntry(uid, entry) {
  const ref = await addDoc(entriesRef(uid), entry)
  return { id: ref.id, ...entry }
}

/**
 * @param {string} uid
 * @param {string} id
 * @param {Pick<Entry, 'meal'|'servings'|'totalCalories'>} changes
 */
export async function updateEntry(uid, id, changes) {
  await updateDoc(entryRef(uid, id), changes)
  return changes
}

export function deleteEntry(uid, id) {
  return deleteDoc(entryRef(uid, id))
}
