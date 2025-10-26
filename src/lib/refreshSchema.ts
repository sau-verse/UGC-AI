import { supabase } from '@/lib/supabaseClient'

export async function refreshSchema() {
  try {
    console.log('Refreshing Supabase schema...');
    
    // Try to get the current user first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Current user:', user?.id, authError);
    
    // Try to list all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.log('Tables in public schema:');
      tables.forEach((table: any) => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Try to query each table we expect to exist
    const expectedTables = ['image_jobs', 'video_jobs', 'profiles'];
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count()')
          .limit(1);
        
        console.log(`${tableName} table check:`, {
          success: !error,
          rowCount: data?.[0]?.count,
          error: error?.message
        });
      } catch (tableError) {
        console.error(`Error checking ${tableName}:`, tableError);
      }
    }
    
    return {
      user: user?.id,
      authError,
      tables,
      tablesError
    };
  } catch (error) {
    console.error('Error refreshing schema:', error);
    return { error };
  }
}