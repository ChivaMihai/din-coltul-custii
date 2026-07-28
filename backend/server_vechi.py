from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import requests
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

# ---------------- DB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- Auth helpers ----------------
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Neautentificat")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilizator inexistent")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesiune expirată")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalid")

# ---------------- Object Storage ----------------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "dincoltulcustii"
storage_key = None
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: str
    password: str

class ContentUpdate(BaseModel):
    content: dict

class ArticleInput(BaseModel):
    title: str
    slug: str = ""
    excerpt: str = ""
    body: str = ""
    coverImage: str = ""
    category: str = ""
    published: bool = True

# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email sau parolă incorecte")
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", "Admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", "Admin")}

# ---------------- Content routes ----------------
@api_router.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": "main"})
    if not doc:
        return DEFAULT_CONTENT
    doc.pop("_id", None)
    return doc

@api_router.put("/content")
async def update_content(data: ContentUpdate, user: dict = Depends(get_current_user)):
    payload = data.content
    payload["_id"] = "main"
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_content.replace_one({"_id": "main"}, payload, upsert=True)
    payload.pop("_id", None)
    return payload

# ---------------- Articles ----------------
def slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text or str(uuid.uuid4())[:8]

@api_router.get("/articles")
async def list_articles(all: bool = False):
    query = {} if all else {"published": True}
    items = await db.articles.find(query).sort("created_at", -1).to_list(1000)
    for it in items:
        it["id"] = str(it.pop("_id"))
    return items

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    doc = await db.articles.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Articol inexistent")
    doc["id"] = str(doc.pop("_id"))
    return doc

@api_router.post("/articles")
async def create_article(data: ArticleInput, user: dict = Depends(get_current_user)):
    doc = data.model_dump()
    doc["slug"] = slugify(doc["slug"] or doc["title"])
    if await db.articles.find_one({"slug": doc["slug"]}):
        doc["slug"] = f"{doc['slug']}-{str(uuid.uuid4())[:4]}"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.articles.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, data: ArticleInput, user: dict = Depends(get_current_user)):
    doc = data.model_dump()
    doc["slug"] = slugify(doc["slug"] or doc["title"])
    await db.articles.update_one({"_id": ObjectId(article_id)}, {"$set": doc})
    updated = await db.articles.find_one({"_id": ObjectId(article_id)})
    updated["id"] = str(updated.pop("_id"))
    return updated

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, user: dict = Depends(get_current_user)):
    await db.articles.delete_one({"_id": ObjectId(article_id)})
    return {"ok": True}

# ---------------- Uploads ----------------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    ctype = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    result = put_object(path, data, ctype)
    await db.files.insert_one({
        "storage_path": result["path"], "original_filename": file.filename,
        "content_type": ctype, "size": result.get("size", len(data)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}

@api_router.get("/files/{path:path}")
async def download(path: str):
    record = await db.files.find_one({"storage_path": path})
    data, content_type = get_object(path)
    ctype = record.get("content_type", content_type) if record else content_type
    return Response(content=data, media_type=ctype, headers={"Cache-Control": "public, max-age=31536000"})

# ---------------- Startup ----------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password), "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc)})
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    if not await db.site_content.find_one({"_id": "main"}):
        seed = dict(DEFAULT_CONTENT)
        seed["_id"] = "main"
        await db.site_content.insert_one(seed)
        logger.info("Content seeded")
    if await db.articles.count_documents({}) == 0:
        await db.articles.insert_many(SEED_ARTICLES)
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Default seed content ----------------
DEFAULT_CONTENT = {
    "settings": {
        "siteName": "Din Colțul Cuștii",
        "accentColor": "#E60000",
        "socials": {"instagram": "https://instagram.com", "youtube": "https://youtube.com", "tiktok": "https://tiktok.com", "email": "contact@dincoltulcustii.ro"},
    },
    "home": {
        "heroTitle": "Din Colțul Cuștii",
        "heroText": "MMA-ul din spatele ecranelor. Lecții reale din antrenamente, competiții, victorii și înfrângeri. Drumul unui luptător de la zero spre performanță.",
        "heroImage": "https://images.pexels.com/photos/28550403/pexels-photo-28550403.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "ctaText": "Citește povestea",
        "marqueeText": "Disciplină · Sacrificiu · Sânge · Sudoare · Respect · Evoluție",
        "stats": [
            {"value": "18", "label": "Ani"},
            {"value": "3", "label": "Ani de MMA"},
            {"value": "12", "label": "Lupte"},
            {"value": "∞", "label": "Lecții"},
        ],
        "introTitle": "Nu e un jurnal de sală. E un jurnal de război interior.",
        "introText": "Aici scriu tot ce se întâmplă dincolo de reflectoare: frica de dinaintea luptei, greșelile care m-au costat, victoriile care m-au învățat smerenie și înfrângerile care m-au făcut mai puternic.",
    },
    "about": {
        "overline": "Despre mine",
        "title": "Am început la 15 ani, cu nimic în afară de dorință.",
        "image": "https://images.unsplash.com/photo-1561532325-7d5231a2dede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxNTUElMjB0cmFpbmluZyUyMGRhcmslMjBneW18ZW58MHx8fHwxNzg1MDMwNzc1fDA&ixlib=rb-4.1.0&q=85",
        "paragraphs": [
            "M-am urcat prima dată pe saltea la 15 ani. Nu știam să dau un croșeu, nu știam ce înseamnă un guillotine, dar știam că voiam mai mult decât o viață obișnuită.",
            "Primele luni au fost umilitoare. Eram cel mai slab din sală, respiram greu după două minute și mă întrebam ce caut acolo. Dar tocmai acolo, în disconfort, am descoperit cine sunt.",
            "Astăzi, la 18 ani, drumul abia începe. Această pagină e promisiunea mea de a fi sincer despre fiecare pas: fără filtre, fără scuze.",
        ],
        "quote": "Nu lupt ca să demonstrez altora. Lupt ca să aflu cine sunt când totul doare.",
    },
    "competitions": {
        "overline": "Competiții",
        "title": "Fiecare luptă e un examen. Unele le-am picat.",
        "intro": "Rezultatele nu spun toată povestea. Aici scriu despre pregătire, emoții, greșeli tactice și ce am învățat din fiecare urcare în cușcă.",
        "image": "https://images.pexels.com/photos/29015508/pexels-photo-29015508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "fights": [
            {"date": "Mar 2026", "title": "Cupa Națională de Amatori", "result": "Victorie · Decizie unanimă", "location": "București", "description": "Prima mea finală. Genunchii îmi tremurau la cântar.", "lesson": "Frica nu dispare. Înveți doar să lupți cu ea alături."},
            {"date": "Nov 2025", "title": "Turneu Regional MMA", "result": "Înfrângere · Submisie R2", "location": "Cluj", "description": "Am condus prima rundă, apoi am făcut o greșeală de ego.", "lesson": "Nu subestima niciodată adversarul când conduci."},
            {"date": "Iun 2025", "title": "Debut în cușcă", "result": "Victorie · TKO R1", "location": "Iași", "description": "Prima luptă oficială. Adrenalina m-a copleșit.", "lesson": "Calmul câștigă lupte, nu furia."},
        ],
    },
    "training": {
        "overline": "Antrenamente",
        "title": "Se câștigă în sală, la 6 dimineața, când nu se uită nimeni.",
        "intro": "MMA înseamnă să fii competent peste tot: în picioare, în clinci și la sol. Iată cum îmi construiesc arsenalul.",
        "image": "https://images.unsplash.com/photo-1737381556257-9307b8ae56e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxNTUElMjB0cmFpbmluZyUyMGRhcmslMjBneW18ZW58MHx8fHwxNzg1MDMwNzc1fDA&ixlib=rb-4.1.0&q=85",
        "disciplines": [
            {"name": "BJJ", "description": "Fundația jocului la sol. Poziții, tranziții și submisii. Aici înveți răbdarea."},
            {"name": "Box & Kickbox", "description": "Jocul de picioare, distanța și puterea loviturilor. Precizie peste forță."},
            {"name": "Wrestling", "description": "Cine dictează unde se dă lupta, dictează lupta. Doborâri și control."},
            {"name": "Pregătire fizică", "description": "Forță, explozivitate și rezistență. Motorul care ține totul în mișcare."},
        ],
    },
    "mindset": {
        "overline": "Mentalitate",
        "title": "Lupta cea mai grea e cea din propria minte.",
        "intro": "Corpul cedează doar după ce mintea a renunțat. Aceste principii mă țin în picioare.",
        "chapters": [
            {"title": "Disciplina", "text": "Motivația e un musafir. Disciplina e cea care rămâne când motivația pleacă. Fac ce trebuie, mai ales când nu am chef."},
            {"title": "Frica", "text": "Nu vânez să nu-mi fie frică. Frica e busola. Acolo unde mi-e cel mai teamă, acolo e drumul spre creștere."},
            {"title": "Încrederea", "text": "Încrederea nu se declară, se câștigă în sală. Fiecare repetare e o cărămidă la fundația siguranței."},
            {"title": "Smerenia", "text": "Salteaua te umilește constant. Rămâi elev pe viață, altfel te bate cineva care încă mai învață."},
        ],
    },
    "equipment": {
        "overline": "Echipament",
        "title": "Uneltele contează. Dar mâna care le folosește contează mai mult.",
        "intro": "Recenzii sincere despre echipamentul pe care îl folosesc: ce merită banii și ce nu.",
        "items": [
            {"name": "Mănuși MMA", "rating": "9/10", "image": "https://images.unsplash.com/photo-1561532325-7d5231a2dede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxNTUElMjB0cmFpbmluZyUyMGRhcmslMjBneW18ZW58MHx8fHwxNzg1MDMwNzc1fDA&ixlib=rb-4.1.0&q=85", "review": "Protecție solidă pentru încheieturi, se muleaza perfect. Le folosesc de peste un an."},
            {"name": "Protecție bucală", "rating": "8/10", "image": "", "review": "Confortabilă și nu-mi afectează respirația. Merită investiția pentru siguranță."},
            {"name": "Bandaje mâini", "rating": "10/10", "image": "", "review": "Esențiale. Nu urc niciodată la sac fără ele. Ieftine și salvatoare de încheieturi."},
        ],
    },
    "contact": {
        "overline": "Contact",
        "title": "Hai să vorbim.",
        "text": "Ai o întrebare, o propunere sau vrei doar să împărtășești din drumul tău? Scrie-mi. Răspund la fiecare mesaj sincer.",
        "email": "contact@dincoltulcustii.ro",
    },
}

SEED_ARTICLES = [
    {"title": "Ce am învățat din prima mea înfrângere", "slug": "prima-infrangere", "excerpt": "Am condus lupta. Apoi ego-ul mi-a luat mințile. Iată ce a rămas după.", "body": "A fost runda a doua. Conduceam clar la puncte și, în loc să-mi joc jocul, am vrut să termin spectaculos.\n\nAm forțat o doborâre de care nu aveam nevoie și m-am trezit prins într-un triangle. Trei secunde de aroganță au șters cinci minute de muncă.\n\nLecția? Nu lupți împotriva adversarului. Lupți împotriva propriei nerăbdări.", "coverImage": "https://images.pexels.com/photos/29015508/pexels-photo-29015508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "category": "Lecții", "published": True, "created_at": datetime.now(timezone.utc).isoformat()},
    {"title": "Rutina mea de dimineață înainte de o luptă", "slug": "rutina-dimineata", "excerpt": "Cum îmi pregătesc mintea și corpul în ziua cântarului.", "body": "Ziua cântarului nu începe cu cântarul. Începe cu noaptea dinainte.\n\nDorm cu telefonul în altă cameră. Dimineața: apă caldă cu lămâie, 10 minute de respirație, apoi o plimbare ușoară.\n\nNu ascult muzică agresivă. Vreau calm, nu haos. Haosul vine destul de repede în cușcă.", "coverImage": "https://images.unsplash.com/photo-1737381556257-9307b8ae56e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxNTUElMjB0cmFpbmluZyUyMGRhcmslMjBneW18ZW58MHx8fHwxNzg1MDMwNzc1fDA&ixlib=rb-4.1.0&q=85", "category": "Rutine", "published": True, "created_at": datetime.now(timezone.utc).isoformat()},
]
