-- supabase/seed.sql
insert into brands (id, name, site_url, wp_api_base, niche, tone, use_featured_image_beat, active)
values (
  'topdealsus',
  'Top Deals US',
  'https://topdealsus.com',
  'https://topdealsus.com/wp-json/wp/v2',
  'Amazon deals and product listicles',
  'High-energy, punchy deal-hunter. Short sentences. Creates urgency and curiosity. Speaks to US online shoppers hunting the best value.',
  true,
  true
)
on conflict (id) do nothing;
