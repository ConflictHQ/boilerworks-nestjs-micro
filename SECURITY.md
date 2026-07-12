# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Boilerworks, please report it responsibly.

**Do not open a public issue.**

Instead, email **security@weareconflict.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical issues.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |

## Security Best Practices

When deploying Boilerworks:

- Change the default database credentials (`DATABASE_URL`)
- Set `API_KEY_SEED` to a random value before first boot and rotate the seeded admin key
- Use HTTPS in production
- Set `NODE_ENV=production`
- Scope API keys narrowly — avoid the `*` wildcard outside admin tooling
- Review the security conventions in `bootstrap.md`
