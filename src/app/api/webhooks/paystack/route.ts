import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    const supabase = createAdminClient();
    
    // Fetch secret from site_content
    const { data: settingsData } = await supabase
        .from('site_content')
        .select('content')
        .eq('page', 'settings')
        .eq('section', 'payment')
        .single();
        
    const secret = settingsData?.content?.paystackSecret || process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    // Verify signature
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle the event
    if (event.event === 'charge.success') {
      const { reference, customer, amount, plan } = event.data;
      
      // Look up user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, role')
        .eq('email', customer.email)
        .single();
        
      if (profile) {
         // Create transaction
         const { error: txError } = await supabase.from('transactions').insert({
            user_id: profile.id,
            amount: amount / 100, // convert kobo to NGN
            currency: 'NGN',
            status: 'confirmed',
            reference: reference,
            method: 'paystack_integration',
            metadata: {
              type: 'subscription',
              description: `Paystack Auto-Debit for ${profile.role}`,
              paystack_plan: plan
            }
         });
         
         if (txError) {
             console.error('Webhook tx insert error:', txError);
         }
         
         // Update profile status
         await supabase.from('profiles').update({
            verification_requested: false,
            status: 'active',
            updated_at: new Date().toISOString()
         }).eq('user_id', profile.user_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
