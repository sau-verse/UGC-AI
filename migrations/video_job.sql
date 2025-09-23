-- ===========================================
-- VIDEO JOBS TABLE (Updated to match Supabase schema)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.video_jobs (
  video_job_id uuid not null default gen_random_uuid (),
  image_job_id uuid not null,
  status text null default 'queued'::text,
  generated_video_url text null,
  error_message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  user_id uuid null,
  constraint video_jobs_pkey1 primary key (video_job_id),
  constraint video_jobs_image_job_id_fkey foreign KEY (image_job_id) references image_jobs (id) on delete CASCADE,
  constraint video_jobs_status_check1 check (
    (
      status = any (
        array[
          'queued'::text,
          'processing'::text,
          'done'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON public.video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created_at ON public.video_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_video_jobs_image_job_id on public.video_jobs using btree (image_job_id) TABLESPACE pg_default;

-- Webhook trigger for n8n workflow
create trigger "Video Jobs (UGC nanobanana)"
after INSERT on video_jobs for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://n8n.reclad.site/webhook/603a258b-f177-432e-b5af-a9200096f029',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '10000'
);

-- Trigger to auto-update updated_at
create trigger update_video_jobs_updated_at BEFORE
update on video_jobs for EACH row
execute FUNCTION update_video_jobs_updated_at_column ();

-- ===========================================
-- VIEW: VIDEO JOBS WITH IMAGE CONTEXT
-- ===========================================

CREATE OR REPLACE VIEW public.video_jobs_with_context AS
SELECT 
  v.video_job_id,
  v.status,
  v.generated_video_url,
  v.error_message,
  v.created_at,
  v.updated_at,
  i.id AS image_job_id,
  i.user_id,
  i.prompt,
  i.image_gen_url,
  i.image_analysis
FROM public.video_jobs v
JOIN public.image_jobs i ON v.image_job_id = i.id;
