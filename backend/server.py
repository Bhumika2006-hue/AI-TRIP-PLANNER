from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import bcrypt
import jwt
import razorpay
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Razorpay Configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID else None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Subscription Plans
class SubscriptionPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

PLAN_LIMITS = {
    SubscriptionPlan.FREE: {"trips_per_month": 2, "ai_chats": 10, "collaborators": 0},
    SubscriptionPlan.PRO: {"trips_per_month": -1, "ai_chats": -1, "collaborators": 5},
    SubscriptionPlan.ENTERPRISE: {"trips_per_month": -1, "ai_chats": -1, "collaborators": -1}
}

PLAN_PRICES = {
    SubscriptionPlan.FREE: 0,
    SubscriptionPlan.PRO: 49900,  # ₹499 in paise
    SubscriptionPlan.ENTERPRISE: 199900  # ₹1999 in paise
}

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    subscription_plan: SubscriptionPlan = SubscriptionPlan.FREE
    subscription_active: bool = True
    subscription_expires: Optional[datetime] = None
    trips_this_month: int = 0
    chats_this_month: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_admin: bool = False

class TripRequest(BaseModel):
    destination: str
    duration: str
    budget: str
    interests: List[str]
    travel_style: str
    language: str = "en"

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    destination: str
    duration: str
    budget: str
    interests: List[str]
    travel_style: str
    itinerary: str
    budget_breakdown: Dict[str, Any] = {}
    language: str = "en"
    shared_with: List[str] = []
    is_public: bool = False
    share_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    response: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionUpdate(BaseModel):
    plan: SubscriptionPlan

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # "info", "success", "warning", "error"
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('subscription_expires'), str):
        user_doc['subscription_expires'] = datetime.fromisoformat(user_doc['subscription_expires'])
    
    return User(**user_doc)

async def check_plan_limits(user: User, action: str) -> bool:
    limits = PLAN_LIMITS[user.subscription_plan]
    
    if action == "trip":
        if limits["trips_per_month"] == -1:
            return True
        return user.trips_this_month < limits["trips_per_month"]
    elif action == "chat":
        if limits["ai_chats"] == -1:
            return True
        return user.chats_this_month < limits["ai_chats"]
    
    return False

async def create_notification(user_id: str, title: str, message: str, notif_type: str = "info"):
    notif = Notification(user_id=user_id, title=title, message=message, type=notif_type)
    doc = notif.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user = User(email=user_data.email, name=user_data.name)
    
    doc = user.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id)
    
    await create_notification(user.id, "Welcome!", f"Welcome to AI Trip Planner, {user.name}!", "success")
    
    return {"user": user.model_dump(), "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('subscription_expires'), str):
        user_doc['subscription_expires'] = datetime.fromisoformat(user_doc['subscription_expires'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    token = create_token(user.id)
    
    return {"user": user.model_dump(), "token": token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Trip Routes
@api_router.post("/trips")
async def create_trip(trip_request: TripRequest, current_user: User = Depends(get_current_user)):
    if not await check_plan_limits(current_user, "trip"):
        raise HTTPException(status_code=403, detail=f"Trip limit reached for {current_user.subscription_plan} plan. Upgrade to create more trips.")
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        session_id = f"trip-{uuid.uuid4()}"
        
        system_message = f"""You are an expert travel planner AI specializing in India and global destinations. 
        Create detailed, personalized trip itineraries. Always use Indian Rupees (₹) for pricing. 
        Include day-by-day plans with specific activities, restaurants, attractions, and practical tips.
        Respond in {trip_request.language} language."""
        
        chat = LlmChat(api_key=api_key, session_id=session_id, system_message=system_message).with_model("openai", "gpt-4o-mini")
        
        interests_str = ", ".join(trip_request.interests)
        prompt = f"""Create a detailed trip itinerary for:
        Destination: {trip_request.destination}
        Duration: {trip_request.duration}
        Budget: {trip_request.budget}
        Interests: {interests_str}
        Travel Style: {trip_request.travel_style}
        
        Provide comprehensive day-by-day itinerary with activities, dining, and tips. Use Indian place names and pricing in ₹."""
        
        user_message = UserMessage(text=prompt)
        itinerary = await chat.send_message(user_message)
        
        # Generate budget breakdown
        budget_prompt = f"""Based on this trip to {trip_request.destination} for {trip_request.duration} with budget {trip_request.budget}, 
        provide a JSON budget breakdown with: accommodation, food, activities, transport, shopping, miscellaneous. 
        Return ONLY valid JSON with amounts in ₹."""
        
        budget_msg = UserMessage(text=budget_prompt)
        budget_response = await chat.send_message(budget_msg)
        
        try:
            import json
            budget_breakdown = json.loads(budget_response.strip().replace('```json', '').replace('```', ''))
        except:
            budget_breakdown = {
                "accommodation": "₹5000",
                "food": "₹3000",
                "activities": "₹2000",
                "transport": "₹2000",
                "shopping": "₹1000",
                "miscellaneous": "₹1000"
            }
        
        trip = Trip(
            user_id=current_user.id,
            **trip_request.model_dump(),
            itinerary=itinerary,
            budget_breakdown=budget_breakdown,
            share_token=str(uuid.uuid4())
        )
        
        doc = trip.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.trips.insert_one(doc)
        
        # Update user trip count
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"trips_this_month": 1}}
        )
        
        await create_notification(
            current_user.id,
            "Trip Created!",
            f"Your trip to {trip_request.destination} is ready!",
            "success"
        )
        
        return trip
    except Exception as e:
        logging.error(f"Error creating trip: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create trip: {str(e)}")

@api_router.get("/trips")
async def get_trips(current_user: User = Depends(get_current_user)):
    trips = await db.trips.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for trip in trips:
        if isinstance(trip.get('created_at'), str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
        if isinstance(trip.get('updated_at'), str):
            trip['updated_at'] = datetime.fromisoformat(trip['updated_at'])
    
    return trips

@api_router.get("/trips/{trip_id}")
async def get_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip['user_id'] != current_user.id and current_user.id not in trip.get('shared_with', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(trip.get('created_at'), str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    if isinstance(trip.get('updated_at'), str):
        trip['updated_at'] = datetime.fromisoformat(trip['updated_at'])
    
    return trip

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip['user_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.trips.delete_one({"id": trip_id})
    return {"message": "Trip deleted successfully"}

@api_router.post("/trips/{trip_id}/share")
async def share_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip['user_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    share_token = trip.get('share_token', str(uuid.uuid4()))
    await db.trips.update_one({"id": trip_id}, {"$set": {"is_public": True, "share_token": share_token}})
    
    return {"share_url": f"/shared/{share_token}"}

@api_router.get("/shared/{share_token}")
async def get_shared_trip(share_token: str):
    trip = await db.trips.find_one({"share_token": share_token, "is_public": True}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
    
    if isinstance(trip.get('created_at'), str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    if isinstance(trip.get('updated_at'), str):
        trip['updated_at'] = datetime.fromisoformat(trip['updated_at'])
    
    return trip

# Chat Routes
@api_router.post("/chat")
async def chat(message: dict, current_user: User = Depends(get_current_user)):
    if not await check_plan_limits(current_user, "chat"):
        raise HTTPException(status_code=403, detail=f"Chat limit reached for {current_user.subscription_plan} plan. Upgrade for unlimited chats.")
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        session_id = f"chat-{current_user.id}"
        
        system_message = """You are a helpful AI travel assistant. Answer questions about destinations, travel tips, 
        visa requirements, best times to visit, local customs, and help plan trips. Use Indian context and ₹ for pricing."""
        
        chat = LlmChat(api_key=api_key, session_id=session_id, system_message=system_message).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=message['message'])
        response = await chat.send_message(user_message)
        
        chat_msg = ChatMessage(
            user_id=current_user.id,
            message=message['message'],
            response=response
        )
        
        doc = chat_msg.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.chats.insert_one(doc)
        
        await db.users.update_one({"id": current_user.id}, {"$inc": {"chats_this_month": 1}})
        
        return chat_msg
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history")
async def get_chat_history(current_user: User = Depends(get_current_user)):
    chats = await db.chats.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    
    for chat in chats:
        if isinstance(chat.get('created_at'), str):
            chat['created_at'] = datetime.fromisoformat(chat['created_at'])
    
    return chats

# Subscription Routes
@api_router.post("/subscription/create-order")
async def create_subscription_order(plan_data: SubscriptionUpdate, current_user: User = Depends(get_current_user)):
    if not razorpay_client:
        # Mock payment for development
        return {
            "order_id": f"order_mock_{uuid.uuid4()}",
            "amount": PLAN_PRICES[plan_data.plan],
            "currency": "INR",
            "mock": True
        }
    
    try:
        order = razorpay_client.order.create({
            "amount": PLAN_PRICES[plan_data.plan],
            "currency": "INR",
            "payment_capture": 1
        })
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/subscription/verify")
async def verify_subscription(payment_data: dict, current_user: User = Depends(get_current_user)):
    # For mock/development (when Razorpay keys not configured)
    if payment_data.get('mock'):
        plan = SubscriptionPlan(payment_data['plan'])
        expires = datetime.now(timezone.utc) + timedelta(days=30)
        
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {
                "subscription_plan": plan,
                "subscription_active": True,
                "subscription_expires": expires.isoformat(),
                "trips_this_month": 0,
                "chats_this_month": 0
            }}
        )
        
        await create_notification(
            current_user.id,
            "Subscription Upgraded!",
            f"Welcome to {plan.upper()} plan! (Demo Mode)",
            "success"
        )
        
        return {"success": True, "plan": plan, "expires": expires}
    
    # Real Razorpay verification
    if razorpay_client and payment_data.get('razorpay_payment_id'):
        try:
            # Verify payment signature
            params = {
                'razorpay_order_id': payment_data['razorpay_order_id'],
                'razorpay_payment_id': payment_data['razorpay_payment_id'],
                'razorpay_signature': payment_data['razorpay_signature']
            }
            
            razorpay_client.utility.verify_payment_signature(params)
            
            # Update subscription
            plan = SubscriptionPlan(payment_data['plan'])
            expires = datetime.now(timezone.utc) + timedelta(days=30)
            
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {
                    "subscription_plan": plan,
                    "subscription_active": True,
                    "subscription_expires": expires.isoformat(),
                    "trips_this_month": 0,
                    "chats_this_month": 0
                }}
            )
            
            await create_notification(
                current_user.id,
                "Payment Successful!",
                f"Your {plan.upper()} subscription is now active!",
                "success"
            )
            
            return {"success": True, "plan": plan, "expires": expires}
        except Exception as e:
            logging.error(f"Razorpay verification error: {str(e)}")
            raise HTTPException(status_code=400, detail="Payment verification failed")
    
    return {"success": False, "message": "Invalid payment data"}

# Notification Routes
@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    
    return notifications

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notif_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"success": True}

# Admin Routes
@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_trips = await db.trips.count_documents({})
    total_chats = await db.chats.count_documents({})
    
    plan_breakdown = {}
    for plan in SubscriptionPlan:
        count = await db.users.count_documents({"subscription_plan": plan})
        plan_breakdown[plan] = count
    
    return {
        "total_users": total_users,
        "total_trips": total_trips,
        "total_chats": total_chats,
        "plan_breakdown": plan_breakdown,
        "revenue_estimate": (
            plan_breakdown.get(SubscriptionPlan.PRO, 0) * 499 +
            plan_breakdown.get(SubscriptionPlan.ENTERPRISE, 0) * 1999
        )
    }

@api_router.get("/admin/users")
async def get_all_users(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('subscription_expires'), str):
            user['subscription_expires'] = datetime.fromisoformat(user['subscription_expires'])
    
    return users

# Health check
@api_router.get("/")
async def root():
    return {"message": "AI Trip Planner SaaS API", "version": "2.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()