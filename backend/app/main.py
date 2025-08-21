import os
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .database import Base, engine, get_db
from .models import User, Order, Trade, OrderType, OrderSide, UserRole
from .schemas import UserCreate, UserOut, LoginRequest, Token, OrderCreate, OrderOut, TradeOutExtended
from .auth import hash_password, verify_password, create_access_token, get_current_user
from .orderbook import InMemoryOrderBook, BookOrder

from fastapi import FastAPI, Depends, HTTPException, WebSocket
from typing import Optional, Literal
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .deps import get_current_user  # you already have this
from pydantic import BaseModel


tags_metadata = [
    {
        "name": "auth",
        "description": "User authentication with JWT (register, login, profile)."
    },
    {
        "name": "orders",
        "description": "Trading endpoints: place, cancel, list orders."
    },
    {
        "name": "trades",
        "description": "Trade history and recent executions."
    },
    {
        "name": "admin",
        "description": "Admin-only controls: list users, ban, role updates."
    },
]

# ---- FastAPI app instance ----
app = FastAPI(
    title="QuantumTrades API",
    description="""
QuantumTrades Backend API 🚀

This API powers a real-time trading simulation platform with:

* **User Management & Security** (JWT auth, roles, admin controls)
* **Order Matching Engine** (limit/market orders, real-time trades)
* **WebSocket Streaming** (live order book, trades, updates)
* **Admin Endpoints** (user list, ban, role update)
    """,
    version="1.0.0",
    contact={
        "name": "QuantumTrades Dev Team",
        "email": "support@quantumtrades.local"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=tags_metadata
)



class RoleUpdate(BaseModel):
    role: Literal["admin", "user"]

class UserPublic(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        orm_mode = True  # so it can read from SQLAlchemy models


# Create tables on startup (assignment-friendly)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuantumTrades", version="1.0.0")

origins = (os.getenv("BACKEND_CORS_ORIGINS") or "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Simple WS manager ---
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
    async def broadcast(self, message: Dict[str, Any]):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except WebSocketDisconnect:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()
book = InMemoryOrderBook()

# -------- AUTH ----------
@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == payload.username)|(User.email == payload.email)).first():
        raise HTTPException(400, "Username or email already exists")
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole(payload.role)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# @app.post("/auth/login", response_model=Token)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.password_hash):
#         raise HTTPException(401, "Invalid username or password")
#     token = create_access_token({"sub": user.username})
#     return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token, tags=["auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Corrected line: Include the user's role in the JWT payload
    payload = {"sub": user.username, "role": user.role}
    token = create_access_token(payload)

    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

# -------- ORDERS ----------
# @app.post("/orders", response_model=OrderOut)
# def place_order(payload: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
#     if payload.type == OrderType.limit.value and (payload.price is None or payload.price <= 0):
#         raise HTTPException(400, "Limit orders need positive price")
#     if payload.quantity <= 0:
#         raise HTTPException(400, "Quantity must be > 0")

#     order = Order(
#         user_id=user.id,
#         side=OrderSide(payload.side),
#         type=OrderType(payload.type),
#         price=payload.price,
#         quantity=payload.quantity,
#         remaining=payload.quantity,
#         is_active=True
#     )
#     db.add(order)
#     db.commit()
#     db.refresh(order)

#     # Put into in-memory book and match
#     book_order = BookOrder(
#         id=order.id, user_id=user.id, side=order.side.value, type=order.type.value,
#         price=order.price, remaining=order.remaining
#     )
#     book.add(book_order)

#     _match_orders(db)  # run matching
#     snapshot = book.snapshot()
#     # Broadcast latest book + last 50 trades
#     trades = db.query(Trade).order_by(Trade.id.desc()).limit(50).all()
#     from .schemas import TradeOut
#     msg = {"type": "snapshot", "orderbook": snapshot, "trades": [TradeOut.model_validate(t).model_dump() for t in trades]}
#     import asyncio
#     asyncio.create_task(manager.broadcast(msg))

#     db.refresh(order)
#     return order

@app.post("/orders", response_model=OrderOut)
def place_order(payload: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.type == OrderType.limit.value and (payload.price is None or payload.price <= 0):
        raise HTTPException(400, "Limit orders need positive price")
    if payload.quantity <= 0:
        raise HTTPException(400, "Quantity must be > 0")

    order = Order(
        user_id=user.id,
        side=OrderSide(payload.side),
        type=OrderType(payload.type),
        price=payload.price,
        quantity=payload.quantity,
        remaining=payload.quantity,
        is_active=True
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Put into in-memory book and match
    book_order = BookOrder(
        id=order.id, user_id=user.id, side=order.side.value, type=order.type.value,
        price=order.price, remaining=order.remaining
    )
    book.add(book_order)

    _match_orders(db)  # run matching
    snapshot = book.snapshot()

    # Broadcast latest book + last 50 trades
    trades = db.query(Trade).order_by(Trade.id.desc()).limit(50).all()
    from .schemas import TradeOut
    msg = {
        "type": "snapshot",
        "orderbook": snapshot,
        "trades": [TradeOut.model_validate(t).model_dump() for t in trades]
    }
    import asyncio
    asyncio.create_task(manager.broadcast(msg))

    # 🔔 NEW: broadcast order_update for real-time toast
    asyncio.create_task(
        manager.broadcast({
            "type": "order_update",
            "event": "placed",
            "order_id": order.id,
            "user_id": user.id,
        })
    )

    db.refresh(order)
    return order

# @app.delete("/orders/{order_id}")
# def cancel_order(
#     order_id: int,
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user)
# ):
#     # Find the active order belonging to the user
#     order = (
#         db.query(Order)
#         .filter(Order.id == order_id, Order.user_id == user.id, Order.is_active == True)
#         .first()
#     )
#     if not order:
#         raise HTTPException(404, "Active order not found")

#     # Mark as cancelled
#     order.is_active = False
#     db.commit()

#     # Remove from in-memory book
#     book.remove(order.id)

#     # Broadcast a WebSocket event so frontend shows real-time toast
#     import asyncio
#     asyncio.create_task(
#         manager.broadcast({
#             "type": "order_update",
#             "event": "cancelled",
#             "order_id": order.id,
#             "user_id": user.id,
#         })
#     )

#     return {"ok": True}
@app.delete("/orders/{order_id}")
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id,
        Order.is_active == True
    ).first()
    if not order:
        raise HTTPException(404, "Active order not found")

    # mark order inactive
    order.is_active = False
    db.commit()

    # remove from in-memory book
    book.remove(order.id)

    # 📢 Broadcast updated snapshot (so all clients update instantly)
    snapshot = book.snapshot()
    trades = db.query(Trade).order_by(Trade.id.desc()).limit(50).all()
    from .schemas import TradeOut
    msg = {
        "type": "snapshot",
        "orderbook": snapshot,
        "trades": [TradeOut.model_validate(t).model_dump() for t in trades]
    }
    import asyncio
    asyncio.create_task(manager.broadcast(msg))

    return {"ok": True}


@app.get("/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return orders

# @app.get("/trades", response_model=List[TradeOut])
# def list_trades(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
#     trades = db.query(Trade).filter(Trade.user_id == user.id).order_by(Trade.created_at.desc()).limit(100).all()
#     return trades

@app.get("/trades", response_model=List[TradeOutExtended])
def list_trades(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # get latest 100 trades involving this user (buyer or seller)
    trades = (
        db.query(Trade)
        .order_by(Trade.created_at.desc())
        .limit(100)
        .all()
    )

    results = []
    for t in trades:
        buy_order = db.query(Order).filter(Order.id == t.buy_order_id).first()
        sell_order = db.query(Order).filter(Order.id == t.sell_order_id).first()

        buyer = db.query(User).filter(User.id == buy_order.user_id).first() if buy_order else None
        seller = db.query(User).filter(User.id == sell_order.user_id).first() if sell_order else None

        results.append(
            TradeOutExtended(
                id=t.id,
                price=t.price,
                quantity=t.quantity,
                created_at=t.created_at,
                buy_order_id=t.buy_order_id,
                sell_order_id=t.sell_order_id,
                buyer_username=buyer.username if buyer else None,
                seller_username=seller.username if seller else None,
            )
        )
    return results

# -------- WEBSOCKET ----------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        await ws.send_json({"type":"hello","msg":"connected"})
        while True:
            await ws.receive_text()  # keep the socket active; frontend doesn't need to send anything
    except Exception:
        manager.disconnect(ws)

# -------- MATCHING ENGINE ----------
# def _match_orders(db: Session):
#     # keep matching while best bid >= best ask
#     while True:
#         best_bid = book.best_bid()
#         best_ask = book.best_ask()
#         if not best_bid or not best_ask:
#             break
#         if best_bid.price < best_ask.price:
#             break

#         trade_qty = min(best_bid.remaining, best_ask.remaining)
#         trade_price = best_ask.price  # price-time priority; take maker price

#         # Update DB orders
#         bid_row = db.query(Order).filter(Order.id == best_bid.id).first()
#         ask_row = db.query(Order).filter(Order.id == best_ask.id).first()
#         if not bid_row or not ask_row or not bid_row.is_active or not ask_row.is_active:
#             # Clean any stale in-memory order
#             if not bid_row or not bid_row.is_active: book.remove(best_bid.id)
#             if not ask_row or not ask_row.is_active: book.remove(best_ask.id)
#             continue

#         bid_row.remaining -= trade_qty
#         ask_row.remaining -= trade_qty
#         if bid_row.remaining <= 1e-9:
#             bid_row.is_active = False
#         if ask_row.remaining <= 1e-9:
#             ask_row.is_active = False

#         # Persist trade for both counterparties (for simplicity record once with taker user)
#         taker_user_id = ask_row.user_id if ask_row.created_at > bid_row.created_at else bid_row.user_id
#         trade = Trade(
#             buy_order_id=best_bid.id,
#             sell_order_id=best_ask.id,
#             user_id=taker_user_id,
#             price=trade_price,
#             quantity=trade_qty,
#         )
#         db.add(trade)
#         db.commit()

#         # sync in-memory book
#         best_bid.remaining = bid_row.remaining
#         best_ask.remaining = ask_row.remaining
#         if not bid_row.is_active:
#             book.remove(best_bid.id)
#         if not ask_row.is_active:
#             book.remove(best_ask.id)



# def _match_orders(db: Session):
#     import asyncio

#     # keep matching while best bid >= best ask
#     while True:
#         best_bid = book.best_bid()
#         best_ask = book.best_ask()
#         if not best_bid or not best_ask:
#             break
#         if best_bid.price < best_ask.price:
#             break

#         trade_qty = min(best_bid.remaining, best_ask.remaining)
#         trade_price = best_ask.price  # price-time priority; take maker price

#         # Update DB orders
#         bid_row = db.query(Order).filter(Order.id == best_bid.id).first()
#         ask_row = db.query(Order).filter(Order.id == best_ask.id).first()
#         if not bid_row or not ask_row or not bid_row.is_active or not ask_row.is_active:
#             # Clean any stale in-memory order
#             if not bid_row or not bid_row.is_active:
#                 book.remove(best_bid.id)
#             if not ask_row or not ask_row.is_active:
#                 book.remove(best_ask.id)
#             continue

#         bid_row.remaining -= trade_qty
#         ask_row.remaining -= trade_qty
#         if bid_row.remaining <= 1e-9:
#             bid_row.is_active = False
#         if ask_row.remaining <= 1e-9:
#             ask_row.is_active = False

#         # Persist trade for both counterparties (record once with taker user)
#         taker_user_id = ask_row.user_id if ask_row.created_at > bid_row.created_at else bid_row.user_id
#         trade = Trade(
#             buy_order_id=best_bid.id,
#             sell_order_id=best_ask.id,
#             user_id=taker_user_id,
#             price=trade_price,
#             quantity=trade_qty,
#         )
#         db.add(trade)
#         db.commit()

#         # sync in-memory book
#         best_bid.remaining = bid_row.remaining
#         best_ask.remaining = ask_row.remaining
#         if not bid_row.is_active:
#             book.remove(best_bid.id)
#         if not ask_row.is_active:
#             book.remove(best_ask.id)

#         # 🔔 NEW: broadcast order_update for filled orders
#         asyncio.create_task(
#             manager.broadcast({
#                 "type": "order_update",
#                 "event": "filled",
#                 "buy_order_id": bid_row.id,
#                 "sell_order_id": ask_row.id,
#                 "price": trade_price,
#                 "quantity": trade_qty,
#             })
#         )

def _match_orders(db: Session):
    import asyncio

    while True:
        best_bid = book.best_bid()
        best_ask = book.best_ask()
        if not best_bid or not best_ask or best_bid.price < best_ask.price:
            break

        trade_qty = min(best_bid.remaining, best_ask.remaining)
        trade_price = best_ask.price

        bid_row = db.query(Order).filter(Order.id == best_bid.id).first()
        ask_row = db.query(Order).filter(Order.id == best_ask.id).first()

        if not bid_row or not ask_row or not bid_row.is_active or not ask_row.is_active:
            # Cancel stale orders
            if not bid_row or not bid_row.is_active:
                book.remove(best_bid.id)
                asyncio.create_task(manager.broadcast({
                    "type": "order_update",
                    "status": "cancelled",
                    "order_id": best_bid.id
                }))
            if not ask_row or not ask_row.is_active:
                book.remove(best_ask.id)
                asyncio.create_task(manager.broadcast({
                    "type": "order_update",
                    "status": "cancelled",
                    "order_id": best_ask.id
                }))
            continue

        # Update remaining quantities
        bid_row.remaining -= trade_qty
        ask_row.remaining -= trade_qty
        if bid_row.remaining <= 1e-9:
            bid_row.is_active = False
        if ask_row.remaining <= 1e-9:
            ask_row.is_active = False

        # Insert trade
        taker_user_id = ask_row.user_id if ask_row.created_at > bid_row.created_at else bid_row.user_id
        trade = Trade(
            buy_order_id=best_bid.id,
            sell_order_id=best_ask.id,
            user_id=taker_user_id,
            price=trade_price,
            quantity=trade_qty,
        )
        db.add(trade)
        db.commit()

        # Broadcast trade
        asyncio.create_task(manager.broadcast({
            "type": "trade",
            "price": trade_price,
            "quantity": trade_qty,
            "buy_order_id": best_bid.id,
            "sell_order_id": best_ask.id
        }))

        # Broadcast bid updates
        if not bid_row.is_active:
            book.remove(best_bid.id)
            asyncio.create_task(manager.broadcast({
                "type": "order_update",
                "status": "filled",
                "order_id": bid_row.id
            }))
        elif bid_row.remaining < trade_qty:
            asyncio.create_task(manager.broadcast({
                "type": "order_update",
                "status": "filled_partial",
                "order_id": bid_row.id,
                "remaining": bid_row.remaining
            }))

        # Broadcast ask updates
        if not ask_row.is_active:
            book.remove(best_ask.id)
            asyncio.create_task(manager.broadcast({
                "type": "order_update",
                "status": "filled",
                "order_id": ask_row.id
            }))
        elif ask_row.remaining < trade_qty:
            asyncio.create_task(manager.broadcast({
                "type": "order_update",
                "status": "filled_partial",
                "order_id": ask_row.id,
                "remaining": ask_row.remaining
            }))

        # Update in-memory quantities
        best_bid.remaining = bid_row.remaining
        best_ask.remaining = ask_row.remaining


def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if getattr(current_user, "role", "user") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return current_user




@app.get("/users", response_model=list[UserPublic], tags=["admin"], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    """List all users (admin only)."""
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    return users


@app.delete("/users/{user_id}", tags=["admin"], dependencies=[Depends(require_admin)])
def delete_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """
    Soft delete/ban a user by setting is_active=False (safer than hard delete if there are FKs).
    Frontend removes the row locally; user can no longer log in if your auth checks is_active.
    """
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete yourself")
    if not getattr(user, "is_active", True):
        return {"status": "ok", "banned": True}

    setattr(user, "is_active", False)
    db.add(user)
    db.commit()
    return {"status": "ok", "banned": True}


@app.put("/users/{user_id}/role", tags=["admin"], dependencies=[Depends(require_admin)])
def update_user_role(user_id: int, payload: RoleUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Promote/Demote a user between 'admin' and 'user' (admin only)."""
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optional safety: prevent self-demote to avoid locking out the last admin
    if user.id == admin.id and payload.role != "admin":
        raise HTTPException(status_code=400, detail="Admins cannot demote themselves")

    # If you want to prevent demoting the last remaining admin, add a check here:
    # if user.role == "admin" and payload.role == "user":
    #     remaining_admins = db.query(models.User).filter(models.User.role == "admin", models.User.is_active == True, models.User.id != user.id).count()
    #     if remaining_admins == 0:
    #         raise HTTPException(status_code=400, detail="Cannot demote the last active admin")

    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "role": user.role}



from .deps import admin_dep

@app.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin = Depends(admin_dep)   # only admins allowed
):
    return db.query(User).order_by(User.created_at.desc()).all()
