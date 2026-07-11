# README

## Prepare

Rename `wrangler.toml.sample` to `wrangler.toml`.

### Token encryption key

GitHub tokens submitted from the Settings page are encrypted server-side before being stored in the browser. Generate a base64-encoded 32-byte key:

```shell
openssl rand -base64 32
```

For local development, add it to `.dev.vars`:

```
TOKEN_ENCRYPTION_KEY=<generated key>
```

For production, register it as a Cloudflare Workers secret:

```shell
wrangler secret put TOKEN_ENCRYPTION_KEY
```

## GitHub Token

Use a [fine-grained token](https://github.com/settings/tokens?type=beta) with the following repository permissions:

| Permission      | Access              |
| --------------- | ------------------- |
| Metadata        | Read (auto-granted) |
| Contents        | Read                |
| Pull requests   | Read                |
| Commit statuses | Read                |

> [!NOTE]
> Organization repositories are excluded by default. You can include them by enabling
> **"Include organization repositories"** in the Settings page.

## Development

```shell
pnpm install
pnpm run dev
```

## Deploy

```shell
pnpm run deploy
```
