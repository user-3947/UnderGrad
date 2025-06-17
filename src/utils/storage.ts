import {supabase} from '../lib/supabaseClient'

export async function getStorageItems(bucketName: string, path = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error fetching storage items:', error);
      return [];
    }

    // Filter out empty folders if needed
    return data
      .filter(item => item.name) // Ensure name exists
      .map(item => ({
        name: item.name,
        isFolder: !item.id // Folders don't have IDs in Supabase
      }));
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

export function getFileUrl(bucketName: string, filePath: string) {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  return data.publicUrl;
}