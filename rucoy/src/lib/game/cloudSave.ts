import { supabase } from '@/integrations/supabase/client'

export interface CloudSlot {
  id: string
  slot_index: number
  player_name: string
  character_class: string
  skin: number
  level: number
  gold: number
  playtime: number
  save_data: any
  updated_at: string
}

export async function fetchCloudSlots(): Promise<CloudSlot[]> {
  const { data, error } = await supabase
    .from('save_slots')
    .select('*')
    .order('slot_index', { ascending: true })
  if (error) {
    console.error('[cloudSave] fetch error', error)
    return []
  }
  return (data ?? []) as CloudSlot[]
}

export async function upsertCloudSlot(args: {
  userId: string
  slotIndex: number
  playerName: string
  characterClass: string
  skin: number
  level: number
  gold: number
  playtime: number
  saveData: any
}): Promise<CloudSlot | null> {
  const payload = {
    user_id: args.userId,
    slot_index: args.slotIndex,
    player_name: args.playerName,
    character_class: args.characterClass,
    skin: args.skin,
    level: args.level,
    gold: args.gold,
    playtime: args.playtime,
    save_data: args.saveData,
  }
  const { data, error } = await supabase
    .from('save_slots')
    .upsert(payload, { onConflict: 'user_id,slot_index' })
    .select()
    .single()
  if (error) {
    console.error('[cloudSave] upsert error', error)
    return null
  }
  return data as CloudSlot
}

export async function deleteCloudSlot(slotId: string): Promise<boolean> {
  const { error } = await supabase.from('save_slots').delete().eq('id', slotId)
  if (error) {
    console.error('[cloudSave] delete error', error)
    return false
  }
  return true
}

export async function findFreeSlotIndex(): Promise<number> {
  const slots = await fetchCloudSlots()
  for (let i = 0; i < 3; i++) {
    if (!slots.find((s) => s.slot_index === i)) return i
  }
  return slots.length
}