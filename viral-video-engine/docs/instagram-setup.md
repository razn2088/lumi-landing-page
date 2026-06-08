# Instagram publishing setup (per brand)

One-time setup so the engine can post Reels to a brand's Instagram. Works in the Meta app's Development mode for your own accounts (no App Review needed).

1. **Instagram account** -> convert to **Business** or **Creator** (IG app -> Settings -> Account type).
2. **Facebook Page** -> create one (or reuse) and **link** the IG account to it (Page Settings -> Linked accounts -> Instagram).
3. **Meta app** (once for all brands) -> https://developers.facebook.com -> Create App (type: Business) -> add the **Instagram** product (Instagram Graph API).
4. **Permissions / token** -> in the Graph API Explorer (or your app), generate a token with `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`. Exchange it for a **long-lived token** (~60 days).
5. **IG user id** -> `GET /me/accounts` -> your Page id; then `GET /{page-id}?fields=instagram_business_account` -> the **ig user id**.
6. **Store** the `ig_user_id` + the long-lived token in the brand row, and set `ig_enabled = true`:
   ```sql
   update viral_video.brands
   set ig_user_id = '<ig-user-id>', ig_access_token = '<long-lived-token>', ig_enabled = true
   where id = 'topdealsus';
   ```
7. Token expires in ~60 days; re-run step 4 and update the row to refresh.

Limits in dev mode: ~50 published posts per account per 24h (far above this project's volume).
