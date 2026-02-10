CREATE VIEW latest_item_stats AS
SELECT DISTINCT ON (item_id)
    *
FROM item_stats
ORDER BY item_id, bucket_at DESC;
