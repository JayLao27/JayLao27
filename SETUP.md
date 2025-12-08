# Getting Your Real GitHub Contributions

The contributions SVG is currently showing placeholder data (all white) because the GitHub API rate limit was exceeded. To see your **real contributions** with the beautiful blue color scheme, you need to add a GitHub Personal Access Token.

## Quick Setup (5 minutes)

### Step 1: Create a GitHub Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like: `Contributions SVG Generator`
4. **No permissions needed** - just leave all checkboxes unchecked (public data only)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Set the Token (PowerShell)

```powershell
$env:GITHUB_TOKEN="your_token_here"
```

Replace `your_token_here` with the token you just copied.

### Step 3: Generate Your Real Contributions

```bash
npm run generate-svg
```

That's it! Your SVG will now show your actual GitHub contributions for this year with the beautiful blue gradient colors:
- **High contributions**: Dark blue (#1A2148)
- **Mid contributions**: Medium blue shades
- **Low contributions**: Light blue shades

## Alternative: Wait for Rate Limit Reset

If you don't want to use a token, you can wait about 1 hour for the rate limit to reset, then run `npm run generate-svg` again. However, using a token is recommended as it gives you 5,000 requests/hour instead of just 60.

## Security Note

The token is only stored in your current PowerShell session. It's not saved anywhere in the code. You'll need to set it again if you open a new terminal window.

