-- items
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_key TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- listings_snapshot
CREATE TABLE listings_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fetched_at TIMESTAMP NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    pseudo TEXT NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    sold INT NOT NULL,
    expiry TIMESTAMP,
    superexpiry TIMESTAMP,
    listing_key TEXT UNIQUE NOT NULL
    -- is_active supprimé : logique déplacée dans la vue
);

CREATE INDEX idx_listings_item_fetched ON listings_snapshot (item_id, fetched_at DESC);
CREATE INDEX idx_listings_item_price ON listings_snapshot (item_id, price);
CREATE INDEX idx_listings_listing_key ON listings_snapshot (listing_key);
CREATE INDEX idx_listings_superexpiry ON listings_snapshot (superexpiry);

-- item_stats
CREATE TABLE item_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    bucket_at TIMESTAMP NOT NULL,
    p10 INT,
    p50 INT,
    p90 INT,
    mean FLOAT,
    active_listings INT,
    active_quantity INT,
    sold_delta INT,
    trend_24h FLOAT,
    volatility_7d FLOAT,
    deal_score INT,
    risk_level TEXT CHECK (risk_level IN ('low','medium','high')),
    recommended_buy INT,
    recommended_sell INT,
    UNIQUE (item_id, bucket_at)
);

-- watchlist
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rules JSONB
);

-- alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    score INT,
    payload JSONB,
    sent_discord BOOLEAN DEFAULT FALSE,
    read BOOLEAN DEFAULT FALSE
);

-- app_settings (singleton)
CREATE TABLE app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    min_deal_score_notify INT,
    min_discount_vs_median FLOAT,
    rounding_mode TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
