# Security Guide for OptiBody

## 🔐 Environment Variables Security

### Required for Production

#### 1. SESSION_SECRET
- **Status**: ❌ MUST be set for production
- **Purpose**: Signs session cookies and prevents forgery
- **Requirements**: 
  - Minimum 32 characters
  - Cryptographically secure random string
  - NEVER use the default value in production

**Generate secure SESSION_SECRET:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### GitHub Secrets Configuration

The following secrets must be configured in GitHub repository settings:

1. **CLOUDFLARE_API_TOKEN**
   - Go to Cloudflare Dashboard > My Profile > API Tokens
   - Create token with "Cloudflare Pages:Edit" permissions
   - Add to GitHub: Settings > Secrets and variables > Actions

2. **CLOUDFLARE_ACCOUNT_ID**
   - Found in Cloudflare Dashboard > Right sidebar
   - Add to GitHub Secrets

### Cloudflare Pages Environment Variables

Configure in Cloudflare Pages Dashboard > Settings > Environment Variables:

#### Production Environment:
```
SESSION_SECRET=your-secure-32-char-session-secret
NODE_ENV=production
```

#### Preview Environment:
```
SESSION_SECRET=your-secure-32-char-session-secret-preview
NODE_ENV=production
```

## 🚫 What's Protected

### ✅ Properly Secured:
- `.env` files (gitignored)
- GitHub Secrets for CI/CD
- Database credentials (D1 bindings)
- Session secrets (server-side only)

### 🔒 Security Measures:
- Environment validation in production
- No client-side exposure of secrets
- Secure session cookie configuration
- Database bindings (not exposed to client)

## ⚠️ Security Checklist

Before deploying to production:

- [ ] Generate secure SESSION_SECRET (32+ chars)
- [ ] Set SESSION_SECRET in Cloudflare Pages environment variables
- [ ] Configure CLOUDFLARE_API_TOKEN in GitHub Secrets
- [ ] Configure CLOUDFLARE_ACCOUNT_ID in GitHub Secrets
- [ ] Verify .env files are gitignored
- [ ] Test authentication flow in production
- [ ] Verify no secrets appear in browser dev tools
- [ ] Check build logs don't expose secrets

## 🛡️ Additional Security Notes

1. **Session Security**: Sessions expire after 30 days automatically
2. **Password Security**: Uses Argon2 for password hashing
3. **Database Security**: D1 bindings provide secure database access
4. **HTTPS**: Enforced in production via Cloudflare Pages
5. **Cookie Security**: Secure flag enabled in production

## 🚨 Security Issues

If you discover a security vulnerability:
1. Do NOT create a public issue
2. Contact the maintainers privately
3. Wait for confirmation before disclosure