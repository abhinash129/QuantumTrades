from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(order=True)
class BookOrder:
    sort_index: float = field(init=False, repr=False)
    id: int
    user_id: int
    side: str  # "buy" / "sell"
    type: str  # "limit" / "market"
    price: Optional[float]
    remaining: float

    def __post_init__(self):
        # For sorting: buys high->low, sells low->high
        if self.side == "buy":
            self.sort_index = -(self.price if self.price is not None else float("inf"))
        else:
            self.sort_index = self.price if self.price is not None else 0.0

class InMemoryOrderBook:
    def __init__(self):
        self.buys: List[BookOrder] = []
        self.sells: List[BookOrder] = []

    def snapshot(self):
        def fmt(lst):
            return [{"id":o.id,"price":o.price,"qty":o.remaining} for o in lst]
        return {
            "bids": fmt(sorted([o for o in self.buys if o.remaining>0])[:20]),
            "asks": fmt(sorted([o for o in self.sells if o.remaining>0])[:20]),
        }

    def add(self, order: BookOrder):
        (self.buys if order.side == "buy" else self.sells).append(order)

    def remove(self, order_id: int):
        self.buys = [o for o in self.buys if o.id != order_id]
        self.sells = [o for o in self.sells if o.id != order_id]

    def best_bid(self) -> Optional[BookOrder]:
        active = [o for o in self.buys if o.remaining > 0 and o.price is not None]
        return sorted(active)[:1][0] if active else None

    def best_ask(self) -> Optional[BookOrder]:
        active = [o for o in self.sells if o.remaining > 0 and o.price is not None]
        return sorted(active)[:1][0] if active else None
