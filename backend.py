#!/usr/bin/env python3
import base64
import hashlib
import json
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


FOODS = [
    {"id": 1, "name": "Grilled Chicken", "emoji": "🍗", "cal": 165, "protein": 31, "carbs": 0, "fat": 3.6, "category": "Protein"},
    {"id": 2, "name": "Avocado Toast", "emoji": "🥑", "cal": 295, "protein": 8, "carbs": 35, "fat": 15, "category": "Grains"},
    {"id": 3, "name": "Greek Salad", "emoji": "🥗", "cal": 180, "protein": 6, "carbs": 14, "fat": 12, "category": "Vegetables"},
    {"id": 4, "name": "Brown Rice", "emoji": "🍚", "cal": 215, "protein": 5, "carbs": 45, "fat": 1.8, "category": "Grains"},
    {"id": 5, "name": "Salmon Fillet", "emoji": "🐟", "cal": 208, "protein": 28, "carbs": 0, "fat": 10, "category": "Protein"},
    {"id": 6, "name": "Banana", "emoji": "🍌", "cal": 89, "protein": 1, "carbs": 23, "fat": 0.3, "category": "Fruits"},
    {"id": 7, "name": "Scrambled Eggs", "emoji": "🍳", "cal": 148, "protein": 10, "carbs": 1, "fat": 11, "category": "Protein"},
    {"id": 8, "name": "Oatmeal", "emoji": "🥣", "cal": 158, "protein": 6, "carbs": 27, "fat": 3.2, "category": "Grains"},
    {"id": 9, "name": "Mixed Berries", "emoji": "🫐", "cal": 57, "protein": 0.7, "carbs": 13, "fat": 0.3, "category": "Fruits"},
    {"id": 10, "name": "Quinoa Bowl", "emoji": "🥙", "cal": 222, "protein": 8, "carbs": 39, "fat": 3.5, "category": "Grains"},
    {"id": 11, "name": "Almonds", "emoji": "🥜", "cal": 164, "protein": 6, "carbs": 6, "fat": 14, "category": "Nuts"},
    {"id": 12, "name": "Sweet Potato", "emoji": "🍠", "cal": 103, "protein": 2, "carbs": 24, "fat": 0.1, "category": "Vegetables"},
    {"id": 13, "name": "Paneer Tikka", "emoji": "🧀", "cal": 265, "protein": 18, "carbs": 9, "fat": 18, "category": "Protein"},
    {"id": 14, "name": "Dal Tadka", "emoji": "🍲", "cal": 198, "protein": 12, "carbs": 28, "fat": 5, "category": "Protein"},
    {"id": 15, "name": "Roti", "emoji": "🫓", "cal": 120, "protein": 4, "carbs": 22, "fat": 3, "category": "Grains"},
    {"id": 16, "name": "Curd Bowl", "emoji": "🥛", "cal": 98, "protein": 5, "carbs": 7, "fat": 5, "category": "Dairy"},
    {"id": 17, "name": "Tofu Stir Fry", "emoji": "🥬", "cal": 240, "protein": 20, "carbs": 18, "fat": 11, "category": "Protein"},
    {"id": 18, "name": "Apple", "emoji": "🍎", "cal": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "category": "Fruits"},
    {"id": 19, "name": "Whey Shake", "emoji": "🥤", "cal": 130, "protein": 25, "carbs": 4, "fat": 2, "category": "Protein"},
    {"id": 20, "name": "Vegetable Poha", "emoji": "🍛", "cal": 250, "protein": 7, "carbs": 46, "fat": 6, "category": "Grains"},
]

KEYWORDS = {
    "chicken": "Grilled Chicken",
    "salmon": "Salmon Fillet",
    "fish": "Salmon Fillet",
    "rice": "Brown Rice",
    "banana": "Banana",
    "egg": "Scrambled Eggs",
    "oat": "Oatmeal",
    "berry": "Mixed Berries",
    "quinoa": "Quinoa Bowl",
    "almond": "Almonds",
    "potato": "Sweet Potato",
    "paneer": "Paneer Tikka",
    "dal": "Dal Tadka",
    "roti": "Roti",
    "curd": "Curd Bowl",
    "yogurt": "Curd Bowl",
    "tofu": "Tofu Stir Fry",
    "apple": "Apple",
    "whey": "Whey Shake",
    "poha": "Vegetable Poha",
    "salad": "Greek Salad",
    "avocado": "Avocado Toast",
}


def normalize(text):
    return re.sub(r"[^a-z0-9]+", " ", str(text or "").lower()).strip()


def json_response(handler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def get_known_foods(payload):
    foods = payload.get("knownFoods")
    if isinstance(foods, list) and foods:
        cleaned = []
        for item in foods:
            if isinstance(item, dict) and item.get("name"):
                cleaned.append({**item, "id": int(item.get("id") or len(cleaned) + 1)})
        return cleaned or FOODS
    return FOODS


def pick_food(payload):
    foods = get_known_foods(payload)
    selected_id = payload.get("selectedFoodId")
    if selected_id is not None:
        for food in foods:
            if int(food.get("id", -1)) == int(selected_id):
                return food, "Matched from the food selected in NutriTrack."

    image_data = payload.get("imageData", "")
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    if image_data:
        try:
            image_bytes = base64.b64decode(image_data, validate=False)
            digest = hashlib.sha256(image_bytes).hexdigest()
            category_hint = int(digest[0:2], 16) % 5
            preferred = ["Protein", "Grains", "Vegetables", "Fruits", "Dairy"][category_hint]
            candidates = [food for food in foods if food.get("category") == preferred] or foods
            return candidates[int(digest[2:8], 16) % len(candidates)], "Estimated from uploaded image signature. Add a selected food for higher confidence."
        except Exception:
            pass

    file_text = normalize(payload.get("fileName"))
    for token, food_name in KEYWORDS.items():
        if token in file_text:
            match = next((food for food in foods if normalize(food.get("name")) == normalize(food_name)), None)
            if match:
                return match, f'Estimated from filename keyword "{token}".'

    return foods[0], "Fallback estimate. Select a food or use a descriptive file name for better matching."


def scale_food(food, grams):
    factor = grams / 100
    return {
        **food,
        "cal": round(float(food.get("cal", 0)) * factor),
        "protein": round(float(food.get("protein", 0)) * factor, 1),
        "carbs": round(float(food.get("carbs", 0)) * factor, 1),
        "fat": round(float(food.get("fat", 0)) * factor, 1),
    }


def parse_multipart(body, content_type):
    boundary_match = re.search(r'boundary=(?:"([^"]+)"|([^;]+))', content_type or "", re.I)
    if not boundary_match:
        return {}, {}

    boundary = boundary_match.group(1) or boundary_match.group(2)
    delimiter = ("--" + boundary).encode("utf-8")
    fields = {}
    files = {}

    for part in body.split(delimiter):
        if not part or part in (b"--\r\n", b"--"):
            continue
        part = part.strip(b"\r\n")
        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue

        headers = part[:header_end].decode("latin1", errors="ignore")
        value = part[header_end + 4:].rstrip(b"\r\n")
        name_match = re.search(r'name="([^"]+)"', headers)
        if not name_match:
            continue

        name = name_match.group(1)
        filename_match = re.search(r'filename="([^"]*)"', headers)
        type_match = re.search(r"Content-Type:\s*([^\r\n]+)", headers, re.I)

        if filename_match:
            files[name] = {
                "filename": filename_match.group(1),
                "content_type": (type_match.group(1).strip() if type_match else "application/octet-stream"),
                "data": value,
            }
        else:
            fields[name] = value.decode("utf-8", errors="ignore").strip()

    return fields, files


def scan_from_image_bytes(image_bytes, grams):
    digest = hashlib.sha256(image_bytes or b"").hexdigest()
    category_hint = int(digest[0:2], 16) % 5
    preferred = ["Protein", "Grains", "Vegetables", "Fruits", "Dairy"][category_hint]
    candidates = [food for food in FOODS if food.get("category") == preferred] or FOODS
    food_per_100g = candidates[int(digest[2:8], 16) % len(candidates)]
    scaled_food = scale_food(food_per_100g, grams)
    return {
        "foodName": scaled_food["name"],
        "emoji": scaled_food.get("emoji", "🍽️"),
        "calories": scaled_food["cal"],
        "protein": scaled_food["protein"],
        "carbs": scaled_food["carbs"],
        "fat": scaled_food["fat"],
        "insight": f"Local development estimate for a {grams}g serving. Production can use Claude Vision when API keys are configured.",
        "healthScore": 82,
        "recognized": True,
    }


class NutriTrackerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.path = "/skeleton.html"
        if self.path == "/api/health":
            return json_response(self, {"ok": True, "service": "NutriTracker backend", "foods": len(FOODS)})
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/log":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                raw_body = self.rfile.read(content_length)
                payload = json.loads(raw_body.decode("utf-8") or "{}")
            except Exception:
                return json_response(self, {"error": "Invalid log payload"}, 400)

            if not payload.get("foodName"):
                return json_response(self, {"error": "A valid scanned food entry is required."}, 400)

            return json_response(self, {"success": True, "entry": payload})

        if self.path == "/api/scan":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                raw_body = self.rfile.read(content_length)
                fields, files = parse_multipart(raw_body, self.headers.get("Content-Type", ""))
                grams = max(10, min(2000, int(float(fields.get("weight") or 100))))
                image = files.get("image")
            except Exception:
                return json_response(self, {"error": "Invalid scan upload", "recognized": False}, 400)

            if not image or not image.get("data"):
                return json_response(self, {"error": "Image file is required", "recognized": False}, 400)

            if image.get("content_type") not in ("image/jpeg", "image/png", "image/webp"):
                return json_response(self, {"error": "Only JPG, PNG, and WEBP images are supported", "recognized": False}, 415)

            return json_response(self, scan_from_image_bytes(image.get("data"), grams))

        if self.path != "/api/scan-food":
            return json_response(self, {"error": "Not found"}, 404)

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length)
            payload = json.loads(raw_body.decode("utf-8"))
        except Exception:
            return json_response(self, {"error": "Invalid JSON body"}, 400)

        grams = max(10, min(2000, int(float(payload.get("quantityGrams") or 100))))
        food_per_100g, note = pick_food(payload)
        scaled_food = scale_food(food_per_100g, grams)

        return json_response(self, {
            "success": True,
            "food": scaled_food,
            "nutritionPer100g": food_per_100g,
            "portion": f"{grams}g serving",
            "confidence": "High" if payload.get("selectedFoodId") else "Estimated",
            "note": note,
        })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), NutriTrackerHandler)
    print(f"NutriTracker backend running on http://127.0.0.1:{port}")
    server.serve_forever()
