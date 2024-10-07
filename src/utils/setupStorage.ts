import { supabase } from '../supabase';

export async function setupStoragePolicies() {
  try {
    // Check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    const avatarsBucketExists = buckets.some(bucket => bucket.name === 'avatars');

    if (!avatarsBucketExists) {
      // Create the avatars bucket if it doesn't exist
      const { data, error: createBucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
      });

      if (createBucketError) {
        console.error('Error creating avatars bucket:', createBucketError);
        return;
      }
      console.log('Avatars bucket created successfully');
    } else {
      console.log('Avatars bucket already exists');
    }

    // Create policies for the avatars bucket
    await createAvatarPolicies();

    console.log('Storage setup completed');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

async function createAvatarPolicies() {
  const policies = [
    {
      name: 'avatar_insert_policy',
      definition: "auth.uid() = owner",
      operation: 'INSERT'
    },
    {
      name: 'avatar_update_policy',
      definition: "auth.uid() = owner",
      operation: 'UPDATE'
    },
    {
      name: 'avatar_delete_policy',
      definition: "auth.uid() = owner",
      operation: 'DELETE'
    },
    {
      name: 'avatar_read_policy',
      definition: "bucket_id = 'avatars'",
      operation: 'SELECT'
    }
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('create_storage_policy', {
        policy_name: policy.name,
        table_name: 'objects',
        definition: policy.definition,
        check_expression: policy.operation === 'INSERT' || policy.operation === 'UPDATE' ? policy.definition : null,
        operation: policy.operation
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`${policy.name} already exists`);
        } else {
          throw error;
        }
      } else {
        console.log(`${policy.name} created successfully`);
      }
    } catch (error) {
      console.error(`Error creating ${policy.name}:`, error.message);
    }
  }
}