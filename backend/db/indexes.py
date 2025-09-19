async def ensure_indexes(db):
    await db.products.create_index([("collection",1),("rating",-1)])
    await db.products.create_index([("title","text"),("brand","text")])
    await db.orders.create_index([("user_id",1),("created_at",-1)])
    await db.wishlist.create_index([("user_id",1)], unique=True)