# Actual output: SQL Express upgrade

Fixture: `tests/fixtures/sql-express-upgrade.md`
Skill: `$portalup-sql-review`

Database assessment
- SQL Server Express has a 10 GB per-database size limit, so a database close to that limit with accelerated growth is a material production risk.
- Slow reports may be caused by size pressure, missing indexes, poor query plans, blocking, autogrowth, disk pressure, or maintenance gaps. Migrating to Standard can remove edition limits, but it should not replace performance diagnosis.

Main risks
- [High] Capacity: reaching the 10 GB Express limit can stop writes or break business workflows.
- [High] Backup/restore uncertainty: migration without a tested restore creates rollback risk.
- [Medium] Performance: reports may stay slow after migration if queries/indexes are the real issue.
- [Medium] Maintenance: Express often lacks SQL Agent jobs, which can leave backups, index maintenance, and integrity checks informal.
- [Medium] Licensing/commercial: Standard edition requires commercial validation outside this technical review.

Validation queries or checks
- Check edition/version: `SELECT @@VERSION; SELECT SERVERPROPERTY('Edition');`
- Check DB size and files: `sp_spaceused;` and `sys.database_files`.
- Identify largest tables and growth trend from monitoring/backups.
- Review backup history in `msdb.dbo.backupset` if available.
- Confirm latest full backup and perform restore test in staging.
- Review top slow reports with actual execution plans.
- Check index fragmentation/missing indexes using DMVs, with workload evidence.
- Review blocking, CPU, memory, disk latency, autogrowth settings, and free disk.

Recommended actions
- Treat migration to SQL Server Standard as likely needed if growth trend shows the 10 GB limit will be reached soon.
- Before migration, perform health review: backups, restore test, DBCC CHECKDB, compatibility level, application connection strings, users/logins, jobs, and performance baseline.
- Build staging restore on Standard and run smoke tests plus report performance tests.
- Define downtime window, DNS/connection string switch, post-migration validation, and monitoring.

Migration/rollback notes
- Rollback plan: keep original Express instance untouched during cutover, preserve final backup, and define maximum allowed data divergence window.
- Post-migration validation: row counts, application login, report execution, write transactions, jobs, backups, and error logs.

Unknowns
- Current SQL Server version, exact DB size, growth per month, RTO/RPO, backup target, workload, HA requirements, and budget/licensing path.

Evaluation
- Score: 87/100.
- Meets expected output: yes.
- Notes: Strong MVP. Add canonical query snippets in V1.
