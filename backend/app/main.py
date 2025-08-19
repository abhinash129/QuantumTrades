import os
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .database import Base, engine, get_db
from .models import User, Order, Trade, OrderType, OrderSide, UserRole
from .schemas import UserCreate, UserOut, LoginRequest, Token, OrderCreate, OrderOut, TradeOut
from .auth import hash_password, verify_password, create_access_token, get_current_user
from .orderbook import InMemoryOrderBook, BookOrder

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

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

# -------- ORDERS ----------
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
    msg = {"type": "snapshot", "orderbook": snapshot, "trades": [TradeOut.model_validate(t).model_dump() for t in trades]}
    import asyncio
    asyncio.create_task(manager.broadcast(msg))

    db.refresh(order)
    return order

@app.delete("/orders/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id, Order.is_active == True).first()
    if not order:
        raise HTTPException(404, "Active order not found")
    order.is_active = False
    db.commit()
    # remove from in-memory book
    book.remove(order.id)
    return {"ok": True}

@app.get("/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return orders

@app.get("/trades", response_model=List[TradeOut])
def list_trades(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    trades = db.query(Trade).filter(Trade.user_id == user.id).order_by(Trade.created_at.desc()).limit(100).all()
    return trades

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
def _match_orders(db: Session):
    # keep matching while best bid >= best ask
    while True:
        best_bid = book.best_bid()
        best_ask = book.best_ask()
        if not best_bid or not best_ask:
            break
        if best_bid.price < best_ask.price:
            break

        trade_qty = min(best_bid.remaining, best_ask.remaining)
        trade_price = best_ask.price  # price-time priority; take maker price

        # Update DB orders
        bid_row = db.query(Order).filter(Order.id == best_bid.id).first()
        ask_row = db.query(Order).filter(Order.id == best_ask.id).first()
        if not bid_row or not ask_row or not bid_row.is_active or not ask_row.is_active:
            # Clean any stale in-memory order
            if not bid_row or not bid_row.is_active: book.remove(best_bid.id)
            if not ask_row or not ask_row.is_active: book.remove(best_ask.id)
            continue

        bid_row.remaining -= trade_qty
        ask_row.remaining -= trade_qty
        if bid_row.remaining <= 1e-9:
            bid_row.is_active = False
        if ask_row.remaining <= 1e-9:
            ask_row.is_active = False

        # Persist trade for both counterparties (for simplicity record once with taker user)
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

        # sync in-memory book
        best_bid.remaining = bid_row.remaining
        best_ask.remaining = ask_row.remaining
        if not bid_row.is_active:
            book.remove(best_bid.id)
        if not ask_row.is_active:
            book.remove(best_ask.id)
