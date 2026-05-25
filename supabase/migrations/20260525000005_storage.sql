-- Bhuk Foods — Step 1
-- Storage buckets for damage photos and cook sheet PDFs.
-- Both are private; access is via signed URLs generated server-side.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('damage-photos', 'damage-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('cook-sheets',  'cook-sheets',  false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

------------------------------------------------------------
-- Storage RLS — admin only for both buckets via authenticated client.
-- Server routes use the service role key which bypasses RLS anyway.
------------------------------------------------------------

drop policy if exists "damage_photos_admin_all" on storage.objects;
create policy "damage_photos_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'damage-photos' and public.my_role() = 'admin')
  with check (bucket_id = 'damage-photos' and public.my_role() = 'admin');

drop policy if exists "cook_sheets_admin_cook_read" on storage.objects;
create policy "cook_sheets_admin_cook_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cook-sheets' and public.my_role() in ('admin','cook'));

drop policy if exists "cook_sheets_admin_write" on storage.objects;
create policy "cook_sheets_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'cook-sheets' and public.my_role() = 'admin')
  with check (bucket_id = 'cook-sheets' and public.my_role() = 'admin');
