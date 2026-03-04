# Troubleshooting: Prisma `app_store_submissions.create` Unknown argument `app_name`

If your build fails with an error similar to:

```text
Invalid `prisma.app_store_submissions.create()` invocation
Unknown argument `app_name`
```

then your Prisma `create()` payload does not match your generated Prisma Client schema.

## Why this happens

`app_name`, `app_version`, and `bundle_identifier` are being sent in `data`, but the current Prisma model for `app_store_submissions` does not define those fields. Prisma rejects unknown keys at runtime.

## Fix options

### Option A (recommended): Align code to the current schema

Update the server-side create payload to only send fields that exist in your Prisma model. For the error shown, `package_name` appears to exist while `app_name` does not.

Example:

```ts
await prisma.app_store_submissions.create({
  data: {
    id,
    project_id,
    user_id,
    platform,
    status: 'pending',
    package_name: bundleIdentifier,
    // remove app_name, app_version, bundle_identifier if not in schema
  },
});
```

### Option B: Add the missing columns to Prisma schema + DB

If your product requires `app_name`, `app_version`, and `bundle_identifier`, add them to `schema.prisma`, run a migration, then regenerate the Prisma Client.

```bash
npx prisma migrate dev --name add_app_store_submission_metadata
npx prisma generate
```

## Important

After any schema change, ensure your deploy/build environment is using the updated Prisma Client. A stale generated client can also produce argument mismatch errors.
