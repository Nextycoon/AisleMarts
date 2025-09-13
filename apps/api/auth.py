from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Secret key for JWT (use a secure method to store in production!)
SECRET_KEY = "change_this_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dummy user database
fake_users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "full_name": "John Doe",
        "hashed_password": "fakehashedpassword"
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    full_name: Optional[str] = None

def fake_hash_password(password: str):
    return "fakehashed" + password

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return None
    if user["hashed_password"] != fake_hash_password(password):
        return None
    return User(username=user["username"], full_name=user["full_name"]) 

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return User(username=user["username"], full_name=user["full_name"])

@app.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "Auth API is running"}