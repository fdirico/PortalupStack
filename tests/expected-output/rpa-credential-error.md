# Expected output: RPA credential error

Skill: `$portalup-rpa-review`

Minimum acceptable response:

- Classifies as likely technical exception caused by credential expiration or vault/orchestrator mismatch.
- Validates orchestrator credential asset, password expiration, target app login manually, bot machine identity, queue item states, retry policy, and recent changes.
- Includes immediate containment such as manual processing or credential rotation under change control.
- Recommends definitive fix and hardening: credential rotation process, vault ownership, alerting before expiry, retry limits, and clearer logging.
- Separates business exception from technical exception.

Score target: 80/100.

