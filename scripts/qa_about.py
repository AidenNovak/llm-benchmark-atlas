from __future__ import annotations

import json
import sys

from playwright.sync_api import sync_playwright


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173/library/about.html"


def main() -> None:
    report: dict[str, object] = {}
    console_errors: list[str] = []
    page_errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_selector("#hero-chart svg")

        report["title"] = page.title()
        report["component_stat"] = page.locator("[data-stat='components']").inner_text()
        report["live_svgs"] = page.locator(".live-chart svg, .evidence-chart svg").count()
        report["favicon"] = page.locator("link[rel='icon'][type='image/svg+xml']").get_attribute("href")
        assert report["component_stat"] == "83"
        assert report["live_svgs"] == 5
        assert report["favicon"] == "favicon.svg"
        assert page.locator("text=不是收集截图。").count() == 1
        assert page.locator("text=容量满了以后，token 去哪里？").count() == 1

        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(200)
        widths = page.evaluate("""
            () => ({
              viewport: document.documentElement.clientWidth,
              scroll: document.documentElement.scrollWidth,
              bodyScroll: document.body.scrollWidth
            })
        """)
        report["mobile_widths"] = widths
        assert widths["scroll"] <= widths["viewport"]
        assert widths["bodyScroll"] <= widths["viewport"]
        assert not console_errors
        assert not page_errors
        report["console_errors"] = console_errors
        report["page_errors"] = page_errors
        browser.close()

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
