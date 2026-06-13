# GStack Careful Method Adaptation

Source: GStack `careful/SKILL.md`, MIT license.

## Protected Actions

- Recursive deletes.
- Database drop/truncate/destructive migrations.
- Force push or history rewrite.
- Hard reset or broad restore.
- Kubernetes/container destructive commands.
- Production deploy/restart/delete.
- Secret rotation or credential exposure.

## Safe Exceptions

Allow routine deletion of generated caches/build outputs after target path verification, such as `node_modules`, `.next`, `dist`, `build`, `coverage`, `__pycache__`, `.cache`, `.turbo`.

## PortalUP Additions

- Confirm environment: local, demo, staging, production, client.
- Confirm database target before any SQL destructive command.
- Confirm backup/restore point before production operations.
- Confirm path is inside intended workspace before recursive operations.

