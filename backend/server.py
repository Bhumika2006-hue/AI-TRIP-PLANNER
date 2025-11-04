from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class TripRequest(BaseModel):
    destination: str
    duration: str
    budget: str
    interests: List[str]
    travel_style: str

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    destination: str
    duration: str
    budget: str
    interests: List[str]
    travel_style: str
    itinerary: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TripResponse(BaseModel):
    id: str
    destination: str
    duration: str
    budget: str
    interests: List[str]
    travel_style: str
    itinerary: str
    created_at: datetime

@api_router.get("/")
async def root():
    return {"message": "AI Trip Planner API"}

@api_router.post("/generate-trip", response_model=TripResponse)
async def generate_trip(trip_request: TripRequest):
    try:
        # Initialize AI chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        session_id = f"trip-{uuid.uuid4()}"
        
        system_message = """You are an expert travel planner AI. Create detailed, personalized trip itineraries based on user preferences. 
        Include day-by-day plans with specific activities, recommended restaurants, must-see attractions, and practical tips. 
        Format your response in a clear, organized manner with sections for each day."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Create prompt
        interests_str = ", ".join(trip_request.interests)
        prompt = f"""Create a detailed trip itinerary for:
        Destination: {trip_request.destination}
        Duration: {trip_request.duration}
        Budget: {trip_request.budget}
        Interests: {interests_str}
        Travel Style: {trip_request.travel_style}
        
        Please provide a comprehensive day-by-day itinerary with activities, dining recommendations, and travel tips."""
        
        user_message = UserMessage(text=prompt)
        itinerary = await chat.send_message(user_message)
        
        # Save to database
        trip_data = trip_request.model_dump()
        trip_obj = Trip(**trip_data, itinerary=itinerary)
        
        doc = trip_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.trips.insert_one(doc)
        
        return trip_obj
    except Exception as e:
        logging.error(f"Error generating trip: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate trip: {str(e)}")

@api_router.get("/trips", response_model=List[TripResponse])
async def get_trips():
    trips = await db.trips.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for trip in trips:
        if isinstance(trip['created_at'], str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return trips

@api_router.get("/trips/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if isinstance(trip['created_at'], str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return trip

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str):
    result = await db.trips.delete_one({"id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()