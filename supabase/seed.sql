-- Bhuk Foods — Step 1 seed (idempotent)
-- Email templates only. Admin + cook auth users are seeded by scripts/seed-users.ts
-- because they require the Supabase Admin API.

-- ---------------------------------------------------------------
-- Email templates
-- ---------------------------------------------------------------
insert into public.email_templates (key, subject, body_text, merge_tags) values
('magic_link',
 'Your Bhuk Foods login link',
$$Hi {{full_name}},

Tap the link below to open Bhuk Foods. The link works for the next 60 minutes.

{{magic_link_url}}

If you did not request this, you can ignore this email.

— Bhuk Foods
{{site_url}}$$,
 array['full_name','magic_link_url','site_url']),

('form_copy',
 'Bhuk Foods — we received your subscription request',
$$Hi {{full_name}},

Thank you for choosing Bhuk Foods. Here is a copy of what you submitted:

Name: {{full_name}}
Phone: {{phone}}
Email: {{email}}
WhatsApp: {{whatsapp}}

{{student_block}}

How you will get your meals: {{delivery_mode_label}}
{{delivery_block}}

Food preference: {{food_preference}}
Allergies / notes: {{allergies}}
Preferred start date: {{start_date}}

We will contact you within 24 hours with the final quote and payment details.

— Bhuk Foods
{{site_url}}$$,
 array['full_name','phone','email','whatsapp','student_block','delivery_mode_label','delivery_block','food_preference','allergies','start_date','site_url']),

('admin_new_subscriber',
 '[Bhuk Foods] New subscriber: {{full_name}}',
$$A new subscription request was just submitted.

Name: {{full_name}}
Phone: {{phone}} (WhatsApp: {{whatsapp}})
Email: {{email}}

{{student_block}}

Delivery mode: {{delivery_mode_label}}
Address: {{delivery_address}}
Landmark: {{landmark}}
Maps URL: {{maps_url}}

Food preference: {{food_preference}}
Allergies / notes: {{allergies}}
Preferred start date: {{start_date}}

Open the admin console: {{site_url}}/admin/pending/{{pending_id}}
$$,
 array['full_name','phone','whatsapp','email','student_block','delivery_mode_label','delivery_address','landmark','maps_url','food_preference','allergies','start_date','site_url','pending_id']),

('quote',
 'Your Bhuk Foods quote',
$$Hi {{full_name}},

Here is your quote for one month of Bhuk Foods (26 service days, Monday to Saturday):

  Meals:    26 × ₹100   = ₹{{quote_meal_total}}
  Delivery: 26 × ₹{{delivery_fee_per_day}}     = ₹{{quote_delivery_total}}
  Security deposit (refundable): ₹{{quote_sd}}
  ----------------------------------------------
  Total now:                     ₹{{quote_total}}

Please pay using UPI to: {{upi_id}}
Or open the UPI link: {{upi_link}}

Once payment is received we will activate your account and email you a login link.

— Bhuk Foods
{{site_url}}$$,
 array['full_name','quote_meal_total','delivery_fee_per_day','quote_delivery_total','quote_sd','quote_total','upi_id','upi_link','site_url']),

('tomorrow_customer',
 'Bhuk Foods — your meals tomorrow ({{tomorrow_date}})',
$$Hi {{full_name}},

Tomorrow ({{tomorrow_date}} / {{tomorrow_date_bn}}): {{tomorrow_status}}
{{tomorrow_reason}}

Meal balance: ₹{{meal_balance}}
Days remaining: {{days_remaining}}

Need to make a change? You have until 4:00 PM today.

— Bhuk Foods$$,
 array['full_name','tomorrow_date','tomorrow_date_bn','tomorrow_status','tomorrow_reason','meal_balance','days_remaining']),

('tomorrow_admin',
 '[Bhuk Foods] Tomorrow headcount: {{headcount}}',
$$Tomorrow ({{tomorrow_date}}) — headcount: {{headcount}}

Eating ({{eating_count}}):
{{eating_list}}

Off ({{off_count}}):
{{off_list}}

Cook sheet locks at 16:30 IST.$$,
 array['tomorrow_date','headcount','eating_count','eating_list','off_count','off_list']),

('low_balance',
 'Bhuk Foods — your balance is running low',
$$Hi {{full_name}},

Your meal balance is ₹{{meal_balance}}, which is about {{days_remaining}} days of meals.

To keep meals running without interruption, please recharge soon. Pay via UPI to {{upi_id}}, then we will update your balance.

— Bhuk Foods
{{site_url}}$$,
 array['full_name','meal_balance','days_remaining','upi_id','site_url']),

('cook_sheet_admin',
 '[Bhuk Foods] Cook sheet for {{tomorrow_date}} — {{headcount}} meals',
$$Cook sheet for {{tomorrow_date}} is attached. Total headcount: {{headcount}}.

This email is sent to the kitchen printer for auto-print.$$,
 array['tomorrow_date','headcount']),

('exit_statement',
 'Bhuk Foods — your exit statement',
$$Hi {{full_name}},

This confirms that your Bhuk Foods subscription has been closed on {{date}}.

Final balances refunded:
  Meal balance refunded: ₹{{refund_meal}}
  Security deposit returned: ₹{{refund_sd}}
  Total refunded: ₹{{refund_total}}

{{ledger_summary}}

Thank you for being with us. We hope to serve you again.

— Bhuk Foods$$,
 array['full_name','date','refund_meal','refund_sd','refund_total','ledger_summary']),

('damage_notice',
 'Bhuk Foods — security deposit adjustment',
$$Hi {{full_name}},

A damage charge of ₹{{damage_amount}} has been deducted from your security deposit:
  Item: {{damage_item}}
  Quantity: {{damage_qty}}

Remaining security deposit: ₹{{sd_balance}}

If anything looks wrong, please reply to this email.

— Bhuk Foods$$,
 array['full_name','damage_amount','damage_item','damage_qty','sd_balance'])
on conflict (key) do nothing;
