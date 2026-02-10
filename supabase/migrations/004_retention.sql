-- Purge snapshots plus vieux que 3 mois
DELETE FROM listings_snapshot
WHERE fetched_at < NOW() - INTERVAL '3 months';
