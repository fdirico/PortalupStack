# Actual output: RPA credential error

Fixture: `tests/fixtures/rpa-credential-error.md`
Skill: `$portalup-rpa-review`

Diagnosis
- The most likely cause is a technical exception caused by expired credentials, changed password, locked account, or mismatch between the orchestrator/vault credential asset and the target web application.
- A secondary possibility is that the target application changed its login flow, selector, MFA requirement, or session policy.

Exception classification
- Technical. It should not be treated as a business exception because the bot cannot start the application session and exhausted retries before processing business data.

Validation steps
- Confirm bot platform, bot identity, machine, environment, and affected process.
- Check orchestrator job logs, retry count, exact login error, screenshots, and timestamps.
- Validate credential asset/vault entry: last rotation date, owner, expiration policy, and whether the bot reads the expected key.
- Test target application login manually with the bot account under change control.
- Check whether the account is locked, password expired, MFA was enabled, or IP/device policy changed.
- Review queue item states to know whether work is pending, failed, or partially processed.
- Verify recent target app changes, selector changes, certificate/browser updates, or machine patches.

Operational risks
- Repeated retries can lock the account or create noise in the target application.
- Pending queue items can breach SLA.
- Manual credential changes without vault update can produce recurring incidents.
- If screenshots/logs expose credentials or personal data, they must be handled as sensitive evidence.

Recommended fix
- Rotate or unlock the credential using the approved owner and update the orchestrator/vault asset.
- Run a controlled test job with a small queue sample.
- Resume processing only after confirming login, queue handling, and no duplicate processing.

Hardening recommendations
- Define credential owner and rotation calendar.
- Add alerting before password expiry.
- Store credentials only in orchestrator/vault, never in scripts or config files.
- Add clearer login failure classification and stop condition after a small number of retries.
- Maintain manual contingency for critical pending work.

Evaluation
- Score: 85/100.
- Meets expected output: yes.
- Notes: Good MVP output. Provider-specific variants can improve V1.
