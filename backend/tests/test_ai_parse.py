import pytest, httpx
@pytest.mark.asyncio
async def test_ai_parse_luxury(base_url):
    async with httpx.AsyncClient(base_url=base_url) as c:
        r = await c.post("/api/ai/parse", json={"q":"show me luxury"})
        assert r.status_code == 200
        assert r.json()["top"]["label"] == "SHOW_COLLECTION"