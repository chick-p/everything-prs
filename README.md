# README

## Prepare

Rename `wrangler.toml.example` to `wrangler.toml`.

## GitHub Token

Use a [fine-grained token](https://github.com/settings/tokens?type=beta) with the following repository permissions:

| Permission | Access |
|-----------|--------|
| Metadata | Read (auto-granted) |
| Contents | Read |
| Pull requests | Read |
| Commit statuses | Read |

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
