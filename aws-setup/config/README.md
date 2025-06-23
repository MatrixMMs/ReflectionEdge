# AWS Configuration Files

This directory contains AWS configuration files for the trading application backend.

## Files

- `iam-policy.json` - IAM policy for the trading-app-backend user
- `credentials.json` - AWS credentials (DO NOT COMMIT - add to .gitignore)
- `config.json` - AWS configuration settings

## Security Notes

- Never commit credentials or sensitive configuration files
- All files in this directory are gitignored
- Use environment variables for production deployments
- Rotate access keys regularly
- Enable MFA on all IAM users

## Usage

These files are used for local development and deployment scripts.
For production, use AWS Secrets Manager or environment variables. 