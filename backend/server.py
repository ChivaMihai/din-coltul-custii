from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import json
import os
import re
import uuid

import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DATA_DIR = ROOT_DIR / "data"
UPLOAD_DIR = ROOT_DIR / "uploads"
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

CONTENT_FILE = DATA_DIR / "content.json"
ARTICLES_FILE = DATA_DIR / "articles.json"

app = FastAPI()
api_router = APIRouter(prefix="/api")

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

def read_json(path: Path, default):
    if not path.exists():
        path.write_text(json.dumps(default, ensure_ascii=False, indent=2), encoding="utf-8")
        return default
    return json.loads(path.read_text(encoding="utf-8"))

def write_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text or str(uuid.uuid4())[:8]

def create_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Neautentificat")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token invalid")
        return {"id": "admin", "email": payload["email"], "name": "Admin"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesiune expirată")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalid")

@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    expected_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    expected_password = os.environ.get("ADMIN_PASSWORD", "")
    if data.email.strip().lower() != expected_email or data.password != expected_password:
        raise HTTPException(status_code=401, detail="Email sau parolă incorecte")
    token = create_token(expected_email)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=43200,
        path="/",
    )
    return {"id": "admin", "email": expected_email, "name": "Admin"}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

@api_router.get("/content")
async def get_content():
    return read_json(CONTENT_FILE, DEFAULT_CONTENT)

@api_router.put("/content")
async def update_content(data: ContentUpdate, user=Depends(get_current_user)):
    payload = data.content
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_json(CONTENT_FILE, payload)
    return payload

@api_router.get("/articles")
async def list_articles(all: bool = False):
    items = read_json(ARTICLES_FILE, SEED_ARTICLES)
    if all:
        return items
    return [item for item in items if item.get("published", True)]

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    for item in read_json(ARTICLES_FILE, SEED_ARTICLES):
        if item.get("slug") == slug:
            return item
    raise HTTPException(status_code=404, detail="Articol inexistent")

@api_router.post("/articles")
async def create_article(data: ArticleInput, user=Depends(get_current_user)):
    items = read_json(ARTICLES_FILE, SEED_ARTICLES)
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = slugify(doc["slug"] or doc["title"])
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    items.insert(0, doc)
    write_json(ARTICLES_FILE, items)
    return doc

@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, data: ArticleInput, user=Depends(get_current_user)):
    items = read_json(ARTICLES_FILE, SEED_ARTICLES)
    for index, item in enumerate(items):
        if str(item.get("id")) == article_id:
            updated = data.model_dump()
            updated["id"] = article_id
            updated["slug"] = slugify(updated["slug"] or updated["title"])
            updated["created_at"] = item.get("created_at", datetime.now(timezone.utc).isoformat())
            items[index] = updated
            write_json(ARTICLES_FILE, items)
            return updated
    raise HTTPException(status_code=404, detail="Articol inexistent")

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, user=Depends(get_current_user)):
    items = read_json(ARTICLES_FILE, SEED_ARTICLES)
    new_items = [item for item in items if str(item.get("id")) != article_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Articol inexistent")
    write_json(ARTICLES_FILE, new_items)
    return {"ok": True}

@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user=Depends(get_current_user)):
    ext = Path(file.filename or "fisier.bin").suffix.lower()
    filename = f"{uuid.uuid4()}{ext}"
    destination = UPLOAD_DIR / filename
    destination.write_bytes(await file.read())
    return {"url": f"/uploads/{filename}", "path": filename}

app.include_router(api_router)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
   allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.100.35:3000",
],
    allow_methods=["*"],
    allow_headers=["*"],
)
