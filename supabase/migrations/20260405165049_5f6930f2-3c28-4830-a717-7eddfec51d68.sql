SELECT cron.alter_job(1, schedule := '0 * * * *');
SELECT cron.alter_job(2, schedule := '30 * * * *');
SELECT cron.alter_job(5, schedule := '15 * * * *');
SELECT cron.alter_job(6, schedule := '45 * * * *');
SELECT cron.alter_job(10, schedule := '10 * * * *');
SELECT cron.alter_job(11, schedule := '40 * * * *');