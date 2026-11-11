import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const adminClient = createAdminClient();
    
    // 1. List buckets to verify connection
    const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
    if (listError) {
      return NextResponse.json({ success: false, phase: 'listBuckets', error: listError.message }, { status: 500 });
    }

    // 2. Check/Create 'payment-receipts' bucket
    const bucketId = 'payment-receipts';
    const exists = buckets?.some(b => b.id === bucketId);
    if (!exists) {
      const { error: createError } = await adminClient.storage.createBucket(bucketId, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) {
        return NextResponse.json({ success: false, phase: 'createBucket', error: createError.message }, { status: 500 });
      }
    }

    // 3. Perform a mock upload of a PDF file
    const fileName = `test-receipt-${Date.now()}.pdf`;
    const fileContent = '%PDF-1.4 mock pdf content';
    const blob = new Blob([fileContent], { type: 'application/pdf' });
    
    const { error: uploadError } = await adminClient.storage
      .from(bucketId)
      .upload(fileName, blob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ success: false, phase: 'upload', error: uploadError.message }, { status: 500 });
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from(bucketId)
      .getPublicUrl(fileName);

    // 5. Clean up mock file
    await adminClient.storage
      .from(bucketId)
      .remove([fileName]);

    return NextResponse.json({
      success: true,
      message: 'Supabase Storage test successful!',
      bucketExistsInitially: exists,
      uploadedUrl: publicUrl
    });
  } catch (error: any) {
    console.error('Storage test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
