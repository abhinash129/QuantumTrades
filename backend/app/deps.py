from typing import Callable
from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from .auth import get_current_user, require_role
from .models import UserRole

DB = Callable[..., Session]
CurrentUser = Callable[..., object]

def db_dep() -> DB:
    return Depends(get_db)

def current_user_dep():
    return Depends(get_current_user)

def admin_dep():
    return Depends(require_role(UserRole.admin))
