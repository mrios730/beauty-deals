#!/usr/bin/env python3
"""Find marked-down products in brands' own online stores and write assets/brand-deals.js.

Each store in scripts/brands.json must be a Shopify store: they publish their catalog at
/products.json, where a variant priced below its `compare_at_price` is on sale.

Run from the repository root:  python3 scripts/fetch_brand_deals.py
Standard library only; no installs needed.
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRANDS_FILE = os.path.join(ROOT, "scripts", "brands.json")
OUT_FILE = os.path.join(ROOT, "assets", "brand-deals.js")

USER_AGENT = "PrettyPennyBot/1.0 (static beauty deals site)"
MAX_PAGES = 20          # 250 products per page
MIN_DISCOUNT = 10       # percent; smaller markdowns are skipped
MAX_MARKDOWNS = 12      # per brand, single products whose price was cut
MAX_SETS = 4            # per brand, sets and value sizes (shown after markdowns)
PAUSE_SECONDS = 1       # between page requests, to be polite

# A set's "compare at" price is usually the combined value of its contents, not a price it
# ever sold for (likewise jumbo sizes against the regular size), so these are shown as
# "save $X" in a Sets category rather than as a percentage markdown.
SET_WORDS = re.compile(r"\b(set|kit|duo|trio|bundle|routine|ritual|collection|essentials|vault|value|jumbo)\b|\+", re.I)

# First match wins; checked against the product type, tags and title.
CATEGORY_WORDS = [
    ("Lips", r"\blip|gloss|lipstick"),
    ("Eyes", r"\beye|mascara|liner|brow|shadow|lash"),
    ("Cheeks", r"blush|bronz|highlight|contour"),
    ("Face", r"foundation|concealer|primer|powder|setting|cushion|tint|\bbb\b|\bcc\b"),
    ("Tools", r"brush|sponge|tool|pouch|\bbag\b|mirror"),
    ("Skincare", r"skin|serum|cream|moistur|cleans|mask|spf|sun|toner|oil|body|lotion|scrub|deodorant|balm"),
]


def fetch_products(domain):
    products = []
    for page in range(1, MAX_PAGES + 1):
        url = "https://%s/products.json?limit=250&page=%d" % (domain, page)
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            batch = json.load(resp).get("products", [])
        if not batch:
            break
        products.extend(batch)
        time.sleep(PAUSE_SECONDS)
    return products


def category_for(product):
    text = " ".join([product.get("product_type") or "", " ".join(product.get("tags") or []), product["title"]])
    for name, pattern in CATEGORY_WORDS:
        if re.search(pattern, text, re.I):
            return name
    return "Skincare"


def clean_text(html, limit=110):
    text = re.sub(r"<[^>]+>", " ", html or "")
    text = re.sub(r"&nbsp;|&amp;", lambda m: " " if m.group() == "&nbsp;" else "&", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(",.;:") + "…"


def image_for(product, variant):
    image = None
    if variant.get("featured_image"):
        image = variant["featured_image"].get("src")
    if not image and product.get("images"):
        image = product["images"][0].get("src")
    if image and "cdn.shopify.com" in image:
        image += ("&" if "?" in image else "?") + "width=600"
    return image


def best_sale_variant(product):
    """The available variant with the biggest markdown, or None if nothing is on sale."""
    best = None
    for v in product.get("variants", []):
        try:
            price, was = float(v["price"]), float(v.get("compare_at_price") or 0)
        except (TypeError, ValueError):
            continue
        if not v.get("available") or price <= 0 or was <= price:
            continue
        pct = round((1 - price / was) * 100)
        if best is None or pct > best[0]:
            best = (pct, price, was, v)
    return best


def deals_for(brand):
    deals = []
    for p in fetch_products(brand["domain"]):
        found = best_sale_variant(p)
        if not found:
            continue
        pct, price, was, variant = found
        if pct < MIN_DISCOUNT or re.search(r"\(\$\d+ value\)|free gift|mystery", p["title"], re.I):
            continue
        is_set = bool(SET_WORDS.search(p["title"]))
        shade = variant.get("title") if variant.get("title") not in (None, "Default Title") else None
        desc = clean_text(p.get("body_html"))
        if is_set:
            desc = "%s lists its value at $%s. %s" % (brand["name"], fmt(was), desc)
        elif shade:
            desc = "%s: %s. %s" % (variant_option_name(p), shade, desc)
        deals.append({
            "id": "%s-%s" % (re.sub(r"[^a-z0-9]+", "-", brand["name"].lower()).strip("-"), p["handle"]),
            "brand": brand["name"],
            "name": p["title"],
            "desc": desc.strip(),
            "category": "Sets" if is_set else category_for(p),
            "shape": "pan", "color": "#E3B9A0", "shades": [],
            "price": price,
            "was": None if is_set else was,
            "offer": "Set: save $%s" % fmt(was - price) if is_set else None,
            "code": None, "ends": None, "limited": False,
            "image": image_for(p, variant), "logo": None,
            "retailer": brand["name"],
            "url": "https://%s/products/%s" % (brand["domain"], p["handle"]),
            "source": brand["name"],
            "_rank": pct if not is_set else was - price,
        })
    markdowns = sorted((d for d in deals if d["category"] != "Sets"), key=lambda d: -d["_rank"])[:MAX_MARKDOWNS]
    sets = sorted((d for d in deals if d["category"] == "Sets"), key=lambda d: -d["_rank"])[:MAX_SETS]
    for d in markdowns + sets:
        del d["_rank"]
    return markdowns + sets


def variant_option_name(product):
    options = product.get("options") or []
    return options[0].get("name", "Option") if options else "Option"


def fmt(n):
    return ("%.2f" % n).rstrip("0").rstrip(".")


def main():
    brands = json.load(open(BRANDS_FILE))["brands"]
    all_deals, failed = [], []
    for brand in brands:
        try:
            found = deals_for(brand)
            print("%-20s %d deals" % (brand["name"], len(found)))
            all_deals.extend(found)
        except (urllib.error.URLError, OSError, ValueError, KeyError) as e:
            failed.append(brand["name"])
            print("%-20s FAILED: %s" % (brand["name"], e), file=sys.stderr)

    if failed and not all_deals:
        sys.exit("No store could be read; leaving %s unchanged." % os.path.relpath(OUT_FILE, ROOT))

    today = datetime.date.today().isoformat()
    with open(OUT_FILE, "w") as f:
        f.write("// GENERATED by scripts/fetch_brand_deals.py on %s. Do not edit by hand;\n" % today)
        f.write("// re-run the script instead. Markdowns from brands' own stores (see scripts/brands.json).\n")
        f.write("window.BRAND_DEALS_CHECKED = %s;\n" % json.dumps(today))
        f.write("window.BRAND_DEALS = %s;\n" % json.dumps(all_deals, indent=2, ensure_ascii=False))
    print("Wrote %d deals to %s" % (len(all_deals), os.path.relpath(OUT_FILE, ROOT)))
    if failed:
        print("Skipped (could not be read): %s" % ", ".join(failed), file=sys.stderr)


if __name__ == "__main__":
    main()
