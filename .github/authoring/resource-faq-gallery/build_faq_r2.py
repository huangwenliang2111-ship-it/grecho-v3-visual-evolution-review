
"""Build the scoped FAQ R2 overlay from the exact local R1 candidate HTML."""

import argparse
from hashlib import sha256
from html import escape, unescape
import json
from pathlib import Path
import re
from shutil import copyfile


MOUNT = "/grecho-v3-visual-evolution-review"
HOME = MOUNT + "/leader-gallery-review-20261116/assets/images/"
GROUPS = {
    "faq-product": "Review facer performance, application fit and technical requirements for your board system before technical matching.",
    "faq-samples": "Start with a clear board application. Sample timing and trial-roll availability depend on material direction, specification and project review stage.",
    "faq-documents": "Document access depends on review stage, selected product, sample, application and report scope.",
    "faq-custom": "Special width, coating, process and supply planning are reviewed according to the selected product and project conditions.",
    "faq-grecho": "GRECHO is a fiberglass facer solution provider coordinating material review, documentation, samples and selected supply-chain resources.",
    "faq-followup": "GRECHO coordinates application, sample and documentation follow-up for technical and procurement teams, with next steps based on review needs.",
}
NEXT_ART = {
    "Document access": HOME + "leadership-20261115/resource-full.webp",
    "Application discussion": HOME + "leadership-20261115/co-development-rd-concept.webp",
}


def one(pattern, input_text, item):
    matches = list(re.finditer(pattern, input_text, re.S))
    if len(matches) != 1:
        raise ValueError(f"{item}: expected exactly one original element, found {len(matches)}")
    return matches[0]


def replace(input_text, match, replacement):
    return input_text[:match.start()] + replacement + input_text[match.end():]


def tag(input_text, pattern, label):
    return one(pattern, input_text, label)[0]


def digest(text):
    return sha256(text.encode("utf-8")).hexdigest()


def original_content(text):
    items = [m[0] for m in re.finditer(r'<details data-b1-faq-item(?: open)?>.*?</details>', text, re.S)]
    if len(items) != 26 or sum(s.startswith('<details data-b1-faq-item open>') for s in items) != 6:
        raise ValueError("The R1 detailed question inventory/default state is different")
    quick = tag(text, r'<details class="b1-faq-quick">.*?</details>', "quick answers")
    if quick.count("<article>") != 4:
        raise ValueError("Expected four R1 quick summaries")
    return items, quick


def transform(baseline):
    original_items, original_quick = original_content(baseline)
    output = baseline
    removed = {}
    for mark, pattern in [
        ("previewNotice", r'<aside class="grecho-public-preview-note">.*?</aside>\s*'),
        ("europePromotion", r'<aside aria-label="Europe 2026 initiative" class="grecho-v3-initiative">.*?</aside>\s*'),
        ("heroCaption", r'[ \t]*<figcaption class="b1-hero-disclosure">Concept illustration</figcaption>\s*\n'),
    ]:
        found = one(pattern, output, mark)
        removed[mark] = True
        output = replace(output, found, "")

    label = one(r'<label for="faq-question-search">(.*?)</label>', output, "search label")
    output = replace(output, label, f'<label class="b1-visually-hidden" for="faq-question-search">{label[1]}</label>')

    intros = {}
    for slug, copy in GROUPS.items():
        safe_slug = re.escape(slug)
        existing = one(
            r'<div class="b1-faq-group-intro">\s*<div>\s*'
            fr'(<h3 id="{safe_slug}-heading" tabindex="-1">(.*?)</h3>)\s*'
            r'<p class="b1-faq-group-summary">(.*?)</p>\s*<p>(.*?)</p>\s*'
            r'</div>\s*<img src="([^"]+)"[^>]*>\s*</div>',
            output,
            slug + " group heading",
        )
        photo = existing[5]
        if not photo.startswith(HOME) or not photo.endswith(".webp") or not re.fullmatch(r'[/A-Za-z0-9._-]+', photo):
            raise ValueError(f"Unexpected topic image source for {slug}: {photo}")
        markup = (
            f'<div class="b1-faq-group-intro" style="--faq-group-art: url(\'{photo}\')">\n'
            f'            {existing[1]}\n'
            f'            <p>{escape(copy)}</p>\n'
            '          </div>'
        )
        output = replace(output, existing, markup)
        intros[slug] = {
            "heading": unescape(existing[2]),
            "R1ShortIntro": unescape(existing[3]),
            "R1Explanation": unescape(existing[4]),
            "R2CombinedIntro": copy,
            "reusedBackground": photo,
        }

    next_cards = {}
    for title, photo in NEXT_ART.items():
        existing = one(
            fr'<article><h3>{re.escape(title)}</h3>(.*?)</article>',
            output,
            title + " next step",
        )
        original_body = existing[1]
        link = one(r'<a class="b1-text-action" href="([^"]+)">', original_body, title + " link")[1]
        markup = (
            '<article>\n'
            f'          <img src="{photo}" alt="" width="150" height="100" loading="lazy" decoding="async">\n'
            '          <div>\n'
            f'            <h3>{title}</h3>{original_body.strip()}\n'
            '          </div>\n'
            '        </article>'
        )
        output = replace(output, existing, markup)
        next_cards[title] = {"reusedImage": photo, "unchangedHref": unescape(link)}

    if original_content(output) != (original_items, original_quick):
        raise ValueError("The detailed questions, disclosures or quick answers changed")
    protected = {}
    for item, regex in [
        ("header", r'<header\b[^>]*data-grecho-v3-nav.*?</header>'),
        ("skipLink", r'<a class="grecho-v3-skip" href="#grecho-v3-main">.*?</a>'),
        ("heroPicture", r'<picture>.*?</picture>'),
        ("heroCopy", r'<div class="b1-hero-copy">.*?</div>'),
        ("nativeTopicLinks", r'<details class="b1-faq-topic-jumps">.*?</details>'),
        ("finalCTA", r'<section class="b1-final t02-final".*?</section>'),
        ("footer", r'<footer\b[^>]*id="grecho-v3-footer".*?</footer>'),
        ("contentSecurityPolicy", r'<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>'),
    ]:
        before = tag(baseline, regex, item + " in R1")
        if before != tag(output, regex, item + " in R2"):
            raise ValueError(f"Protected component changed: {item}")
        protected[item] = digest(before)

    ledger = {
        "baselineR1Sha256": digest(baseline),
        "generatedR2Sha256": digest(output),
        "removedLegacyElements": removed,
        "protectedSourceSha256": protected,
        "detailedCount": len(original_items),
        "defaultOpenCount": 6,
        "quickSummaries": 4,
        "questionAndAnswerBlocksSha256": [digest(s) for s in original_items],
        "introMeaningMapping": intros,
        "nextStepCards": next_cards,
        "scopeNote": "The Word note showing the Resource Center document request flow is implemented only on Resource Center.",
    }
    return output, ledger


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", required=True, type=Path)
    parser.add_argument("--preview", required=True, type=Path)
    parser.add_argument("--evidence", type=Path)
    args = parser.parse_args()

    output, ledger = transform(args.baseline.read_bytes().decode("utf-8"))
    page = args.preview / "faq"
    page.mkdir(parents=True, exist_ok=True)
    (page / "index.html").write_bytes(output.encode("utf-8"))
    for name in ("faq-r1.css", "faq-r1.js"):
        copyfile(Path(__file__).with_name(name), page / name)
    if args.evidence:
        args.evidence.parent.mkdir(parents=True, exist_ok=True)
        args.evidence.write_bytes((json.dumps(ledger, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(ledger["generatedR2Sha256"])


if __name__ == "__main__":
    main()
