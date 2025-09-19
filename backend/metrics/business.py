from prometheus_client import Counter, Histogram
orders_created = Counter("am_orders_created_total","Orders created")
voice_intents = Counter("am_voice_intents_total","Voice intents",["label"])
checkout_latency = Histogram("am_checkout_latency_seconds","Checkout p50/p95")

def kpi_on_order(): orders_created.inc()
def kpi_on_intent(label:str): voice_intents.labels(label=label).inc()