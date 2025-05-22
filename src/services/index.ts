
// Re-export all church services
export { searchChurches, joinChurch, getUserChurches, setPrimaryChurch, leaveChurch } from './churchService';
export { getChurchById } from './churchDetailsService';
export { addChurch } from './churchCreationService';
export type { Church } from '@/types/church';
