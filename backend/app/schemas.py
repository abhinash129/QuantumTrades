from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Optional[Literal["trader","admin"]] = "trader"

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime
    class Config: from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class OrderCreate(BaseModel):
    side: Literal["buy","sell"]
    type: Literal["limit","market"]
    price: Optional[float] = None
    quantity: float

class OrderOut(BaseModel):
    id: int
    user_id: int
    side: str
    type: str
    price: Optional[float]
    quantity: float
    remaining: float
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

# class TradeOut(BaseModel):
#     id: int
#     buy_order_id: int
#     sell_order_id: int
#     user_id: int
#     price: float
#     quantity: float
#     created_at: datetime
#     class Config: from_attributes = True


class TradeOutExtended(BaseModel):
    id: int
    price: float
    quantity: float
    created_at: datetime

    buy_order_id: int
    sell_order_id: int
    buyer_username: Optional[str]
    seller_username: Optional[str]

    class Config:
        orm_mode = True