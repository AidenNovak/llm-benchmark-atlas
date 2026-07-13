from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173/_site/"
SITE_DIR = Path("_site")


def main() -> None:
    component_files = sorted(path for path in (SITE_DIR / "components").glob("*.html") if path.name != "index.html")
    sitemap = ET.parse(SITE_DIR / "sitemap.xml")
    sitemap_urls = sitemap.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url")
    report: dict[str, object] = {
        "component_pages": len(component_files),
        "sitemap_urls": len(sitemap_urls),
    }
    assert len(component_files) == 83
    assert len(sitemap_urls) == 86
    assert (SITE_DIR / "llms.txt").exists()
    component_index = (SITE_DIR / "components" / "index.html").read_text(encoding="utf-8")
    report["static_index_links"] = sum(f'href="{path.stem}.html"' in component_index for path in component_files)
    assert report["static_index_links"] == 83

    console_errors: list[str] = []
    page_errors: list[str] = []
    target = f"{BASE_URL.rstrip('/')}/components/deepseek-fp8-precision-lifecycle.html"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.goto(target, wait_until="networkidle")
        report["title"] = page.title()
        report["canonical"] = page.locator("link[rel='canonical']").get_attribute("href")
        report["svg_count"] = page.locator(".component-figure svg").count()
        report["structured_data"] = page.locator("script[type='application/ld+json']").count()
        report["x_link"] = page.locator("a[href='https://x.com/logiclogic1223']").count()
        assert "Mixed-precision Training Lifecycle" in report["title"]
        assert report["canonical"].endswith("deepseek-fp8-precision-lifecycle.html")
        assert report["svg_count"] == 1
        assert report["structured_data"] == 1
        assert report["x_link"] >= 1

        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(150)
        widths = page.evaluate("() => ({viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth})")
        report["mobile_widths"] = widths
        assert widths["scroll"] <= widths["viewport"]
        assert widths["body"] <= widths["viewport"]
        assert not console_errors
        assert not page_errors
        report["console_errors"] = console_errors
        report["page_errors"] = page_errors
        browser.close()

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
