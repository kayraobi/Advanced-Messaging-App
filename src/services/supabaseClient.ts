import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nkvieftzrxdvqletpnnt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v1Vz_rC41kLiEnD66V0S0A_suXn6QBu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
