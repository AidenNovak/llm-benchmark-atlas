from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173/library/"
IS_LOCAL = BASE_URL.startswith("http://127.0.0.1") or BASE_URL.startswith("http://localhost")
SCREENSHOT = Path("/private/tmp/benchmark-atlas-dialog.png")
SERIES_SCREENSHOT = Path("/private/tmp/benchmark-atlas-series.png")
PAPER_SCREENSHOT = Path("/private/tmp/benchmark-atlas-paper-series.png")
ASIAN_SCREENSHOT = Path("/private/tmp/benchmark-atlas-asian-series.png")
MINIMAX_SCREENSHOT = Path("/private/tmp/benchmark-atlas-minimax-series.png")
GLM_SCREENSHOT = Path("/private/tmp/benchmark-atlas-glm-series.png")
SYSTEMS_SCREENSHOT = Path("/private/tmp/benchmark-atlas-lab-systems-series.png")
FRONTIER_SCREENSHOT = Path("/private/tmp/benchmark-atlas-frontier-systems-series.png")
PREVIEW_SCREENSHOT = Path("assets/atlas-preview.png")


def main() -> None:
    console_errors: list[str] = []
    page_errors: list[str] = []
    report: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_selector(".component-card")

        report["initial_cards"] = page.locator(".component-card").count()
        assert report["initial_cards"] == 83
        if IS_LOCAL:
            page.screenshot(path=str(PREVIEW_SCREENSHOT))

        page.locator("#family-filter").select_option(label="Agent 与过程评测")
        report["agent_family_cards"] = page.locator(".component-card").count()
        assert report["agent_family_cards"] == 6

        page.locator("#family-filter").select_option(label="厂商发布复现系列")
        report["vendor_series_cards"] = page.locator(".component-card").count()
        assert report["vendor_series_cards"] == 15
        page.screenshot(path=str(SERIES_SCREENSHOT), full_page=True)

        page.locator("#family-filter").select_option(label="论文图表复现")
        report["paper_series_cards"] = page.locator(".component-card").count()
        assert report["paper_series_cards"] == 5
        page.screenshot(path=str(PAPER_SCREENSHOT), full_page=True)

        page.locator("#family-filter").select_option(label="亚洲模型实验室")
        report["asian_lab_cards"] = page.locator(".component-card").count()
        assert report["asian_lab_cards"] == 23
        page.screenshot(path=str(ASIAN_SCREENSHOT), full_page=True)

        page.locator("#reset-filters").click()
        page.locator("#search").fill("Hunyuan")
        report["hunyuan_cards"] = page.locator(".component-card").count()
        assert report["hunyuan_cards"] == 1
        page.locator(".preview-button").click()
        assert "Figure 2" in page.locator("#dialog-facts").inner_text()
        page.locator("#close-dialog").click()

        page.locator("#reset-filters").click()
        page.locator("#search").fill("Seed1.5-VL")
        report["seed_cards"] = page.locator(".component-card").count()
        assert report["seed_cards"] == 1
        page.screenshot(path=str(FRONTIER_SCREENSHOT), full_page=True)

        page.locator("#reset-filters").click()
        page.locator("#search").fill("FP8")
        report["fp8_cards"] = page.locator(".component-card").count()
        assert report["fp8_cards"] == 2

        page.locator("#reset-filters").click()
        page.locator("#search").fill("MiniMax")
        report["minimax_cards"] = page.locator(".component-card").count()
        assert report["minimax_cards"] == 5
        page.screenshot(path=str(MINIMAX_SCREENSHOT), full_page=True)

        page.locator("#reset-filters").click()
        page.locator("#search").fill("GLM")
        report["glm_cards"] = page.locator(".component-card").count()
        assert report["glm_cards"] == 2
        page.screenshot(path=str(GLM_SCREENSHOT), full_page=True)

        page.locator("#reset-filters").click()
        page.locator("#search").fill("roofline")
        report["roofline_cards"] = page.locator(".component-card").count()
        assert report["roofline_cards"] == 1

        page.locator("#reset-filters").click()
        page.locator("#search").fill("ERNIE")
        report["ernie_cards"] = page.locator(".component-card").count()
        assert report["ernie_cards"] == 3
        page.screenshot(path=str(SYSTEMS_SCREENSHOT), full_page=True)

        page.locator(".preview-button").first.click()
        assert "Figure" in page.locator("#dialog-facts").inner_text()
        assert page.locator("#dialog-json").text_content().find('"evidence"') >= 0
        page.locator("#close-dialog").click()

        page.locator("#reset-filters").click()
        page.locator("#search").fill("Sankey")
        report["sankey_search_cards"] = page.locator(".component-card").count()
        assert report["sankey_search_cards"] == 1
        assert "Tool-call Outcome Flow" in page.locator(".card-title").inner_text()

        page.locator("#reset-filters").click()
        page.locator("#search").fill("Layer–Token Similarity")
        assert page.locator(".component-card").count() == 1
        page.locator(".preview-button").click()
        assert "Figure 8" in page.locator("#dialog-facts").inner_text()
        assert '"verifiedAt": "2026-07-13"' in page.locator("#dialog-json").text_content()
        page.locator("#close-dialog").click()

        page.locator("#reset-filters").click()
        page.locator(".preview-button").first.click()
        dialog = page.locator("#detail-dialog")
        assert dialog.evaluate("element => element.open")
        assert page.locator("#dialog-preview svg").count() == 1
        assert page.locator("#dialog-json").text_content().strip().startswith("{")
        assert page.locator("#source-link").get_attribute("href").startswith("https://")
        page.screenshot(path=str(SCREENSHOT))

        with page.expect_download() as download_info:
            page.locator("#download-svg").click()
        download = download_info.value
        report["download_name"] = download.suggested_filename
        assert report["download_name"].endswith(".svg")
        page.locator("#close-dialog").click()

        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(120)
        overflow = page.evaluate(
            """
            () => ({
              viewport: document.documentElement.clientWidth,
              scroll: document.documentElement.scrollWidth,
              bodyScroll: document.body.scrollWidth
            })
            """
        )
        report["mobile_widths"] = overflow
        assert overflow["scroll"] <= overflow["viewport"]
        assert overflow["bodyScroll"] <= overflow["viewport"]

        report["console_errors"] = console_errors
        report["page_errors"] = page_errors
        assert not console_errors
        assert not page_errors

        context.close()
        browser.close()

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
