CREATE VIEW active_listings_grouped AS
SELECT
    ls.item_id,
    ls.price,
    SUM(ls.quantity - ls.sold) AS total_quantity,
    COUNT(*) AS listings_count,
    ARRAY_AGG(ls.pseudo) AS pseudos
FROM listings_snapshot ls
WHERE ls.fetched_at = (
    SELECT MAX(fetched_at) FROM listings_snapshot WHERE item_id = ls.item_id
)
AND (ls.sold < ls.quantity AND now() < ls.superexpiry)
GROUP BY ls.item_id, ls.price;
