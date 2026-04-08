import os
import json
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
import numpy as np
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use absolute paths or dynamic paths based on script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE_DIR_ORTHO = os.path.join(BASE_DIR, "public", "ortho_tiles")
TILE_DIR_NORMAL = os.path.join(BASE_DIR, "public", "tiles")
CACHE_FILE = os.path.join(os.path.dirname(__file__), "cache.json")

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f)
    except Exception as e:
        print("Save cache error:", e)

tile_cache = load_cache()

def process_tile(z, x, y):
    # Try ortho_tiles first, fallback to regular tiles
    tile_path = os.path.join(TILE_DIR_ORTHO, str(z), str(x), f"{y}.png")
    if not os.path.exists(tile_path):
        tile_path = os.path.join(TILE_DIR_NORMAL, str(z), str(x), f"{y}.png")
        if not os.path.exists(tile_path):
            raise FileNotFoundError(f"Tile {z}/{x}/{y} not found")
            
    img = Image.open(tile_path).convert("RGB")
    data = np.array(img)
    
    # Simple green heuristic focusing on RGB
    R = data[:, :, 0].astype(int)
    G = data[:, :, 1].astype(int)
    B = data[:, :, 2].astype(int)
    
    # A pixel is considered vegetation if Green is dominant and bright enough
    green_mask = (G > R * 1.1) & (G > B) & (G > 40)
    
    # Calculate tree count using cv2 contours
    mask_uint8 = (green_mask * 255).astype(np.uint8)
    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    tree_count = 0
    # Minimum area roughly corresponding to a small tree canopy block in typical tiles
    min_area = 20 
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > min_area:
            tree_count += 1
    
    total_pixels = data.shape[0] * data.shape[1]
    green_pixels = np.count_nonzero(green_mask)
    density = float(green_pixels) / total_pixels
    has_vegetation = density > 0.05
    
    return density, has_vegetation, green_mask, data.shape, tree_count

@app.get("/analyze-tile")
def analyze_tile(z: int, x: int, y: int):
    cache_key = f"{z}_{x}_{y}"
    if cache_key in tile_cache:
        return tile_cache[cache_key]
        
    try:
        density, has_veg, _, _, tree_count = process_tile(z, x, y)
        res = {
            "has_vegetation": has_veg,
            "vegetation_density": round(density, 4),
            "tree_count": tree_count
        }
        tile_cache[cache_key] = res
        save_cache(tile_cache)
        return res
    except FileNotFoundError:
        # If no tile exists natively, it corresponds to 0 vegetation
        return {"has_vegetation": False, "vegetation_density": 0.0, "tree_count": 0}

@app.get("/overlay-tile")
def overlay_tile(z: int, x: int, y: int):
    try:
        _, _, green_mask, shape, _ = process_tile(z, x, y)
        
        # Create an RGBA image from the mask
        overlay_opt = np.zeros((shape[0], shape[1], 4), dtype=np.uint8)
        
        # Where it is green, apply a solid semi-transparent color overlay
        # Color: #22c55e (Hex) -> (34, 197, 94) in RGB
        overlay_opt[green_mask, 0] = 34
        overlay_opt[green_mask, 1] = 197
        overlay_opt[green_mask, 2] = 94
        overlay_opt[green_mask, 3] = 160  # ~62% Opacity
        
        img_out = Image.fromarray(overlay_opt, mode="RGBA")
        buf = BytesIO()
        img_out.save(buf, format="PNG")
        buf.seek(0)
        
        return Response(content=buf.getvalue(), media_type="image/png")
    except FileNotFoundError:
        # Return a blank transparent 256x256 image
        empty = np.zeros((256, 256, 4), dtype=np.uint8)
        img_out = Image.fromarray(empty, mode="RGBA")
        buf = BytesIO()
        img_out.save(buf, format="PNG")
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
