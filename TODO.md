# TODO

- [ ] Identify root cause of 500 for project image / service image uploads by adding server-side logging around Supabase storage upload failures.
- [ ] Fix Supabase bucket/path configuration mismatch (ensure correct public URL + correct bucket name).
- [ ] Ensure services icon + project images use same normalization/upload helper.
- [ ] Add better error propagation (throw structured error with status/code) so UI shows real cause.
- [ ] Test: upload team/project/service images and verify DB update succeeds.

