"""Build Gallery Resource Center R2 from the verified published source and frozen Gallery components."""
from argparse import ArgumentParser
from collections import Counter
from hashlib import sha256
from html import escape
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
import base64
import json
import re

from lxml import html


SOURCE = Path(__file__).resolve().parent
PREFIX = '/grecho-v3-visual-evolution-review/'
HOME = 'leader-gallery-review-20261116/index.html'
CONTACT = 'contact/index.html'
CSS = 'resource-gallery-r1.css'
JS = 'resource-gallery-r1.js'
HERO_WIDE = PREFIX + 'assets/media/b1-gallery/resource-hero-wide.webp'
HERO_MOBILE = PREFIX + 'assets/media/b1-gallery/resource-hero-mobile.webp'
CTA_IMAGE = PREFIX + 'assets/media/t02i-solutions/cta-background-1672.webp'
HERO_ALT = 'Concept illustration of blank folders and thin white fiberglass facing samples on a daylit stone surface.'
NEUTRAL_TITLE = 'White Spray Sanded Fiberglass Veil'
NEUTRAL_ALT = 'Blurred public preview of CTDS-004, white spray sanded fiberglass veil.'
CATEGORIES = (
    ('Product Briefs', 'product-brief', 'resource-brief.webp'),
    ('Color TDS / Marketing TDS', 'color-tds', 'resource-color.webp'),
    ('Full TDS by Review', 'full-tds', 'resource-full.webp'),
    ('Fire Test Documents', 'fire-test-document', 'resource-fire.webp'),
    ('Compliance / Sustainability Documents', 'compliance-document', 'resource-compliance.webp'),
    ('SDS / MSDS', 'sds-msds', 'resource-safety.webp'),
)
STEPS = (
    ('Share your application and document need',
     'Identify your board type, facer direction, target market, review stage and the documents you need.'),
    ('Review the material and document scope',
     'GRECHO considers the application, sample status and any relevant standards or review requirements.'),
    ('Confirm available documents or next steps',
     'Where applicable, GRECHO can confirm which documents are available or suggest what to prepare next.'),
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def only(values, description):
    require(len(values) == 1, f'Expected one {description}; found {len(values)}.')
    return values[0]


def class_nodes(element, name, tag='*'):
    return element.xpath(
        f'.//{tag}[contains(concat(" ",normalize-space(@class)," ")," {name} ")]'
    )


def copy_text(node):
    return ' '.join(node.text_content().split())


def render_action(label, href, classes):
    return (f'<a class="{classes}" href="{escape(href)}">{escape(label)} '
            '<span aria-hidden="true">→</span></a>')


def attrs(node):
    return dict(node.attrib)


def create_category_records(main, home):
    old_categories = class_nodes(main, 'grc-v2-category-section', 'section')
    section = only(old_categories, 'legacy category section')
    articles = class_nodes(section, 'grc-v2-card', 'article')
    require(len(articles) == len(CATEGORIES), 'Six authoritative categories are required.')
    images = home.xpath('//*[@id="r61-resource-gallery"]//article//img')
    by_name = {urlsplit(image.get('src')).path.rsplit('/', 1)[-1]: image for image in images}
    require(len(by_name) == 6, 'Six accepted Home Resource images are required.')
    records = []
    for (title, token, image_name), article in zip(CATEGORIES, articles):
        card_title = copy_text(only(article.xpath('./h3'), 'category heading'))
        action = only(article.xpath('./a[@href]'), 'category action')
        href = action.get('href')
        query = parse_qs(urlsplit(href).query)
        require(card_title == title, f'Unexpected category: {card_title}')
        if token == 'color-tds':
            require(href == '#color-tds-library', 'Color TDS library route changed.')
        else:
            require(query.get('request') == ['technical-data'] and query.get('doc') == [token],
                    f'Category request mapping changed: {title}')
        records.append({
            'title': title,
            'token': token,
            'href': href,
            'label': copy_text(action),
            'summary': copy_text(only(article.xpath('./p'), 'category summary')),
            'access': copy_text(only(class_nodes(article, 'grc-v2-tag'), 'category access label')),
            'image': attrs(by_name[image_name]),
        })
    return records


def create_document_records(main):
    library = only(main.xpath('.//*[@id="color-tds-library"]'), 'legacy library')
    links = library.xpath('.//a[contains(@href,"tds_id=")]')
    require(len(links) == 15, 'Exactly 15 CTDS reference links are required.')
    records = []
    for number, link in enumerate(links, 1):
        identity = f'CTDS-{number:03}'
        href = link.get('href')
        request = urlsplit(href)
        params = parse_qs(request.query)
        require(request.path == PREFIX + 'contact/' and request.fragment == 'request-form'
                and params.get('request') == ['technical-data'] and params.get('doc') == ['color-tds']
                and params.get('source') == ['resource-center'] and params.get('tds_id') == [identity],
                f'Unexpected CTDS route: {href}')
        title = copy_text(only(link.xpath('./h3'), 'CTDS title'))
        image = attrs(only(link.xpath('.//img'), 'CTDS preview'))
        require(image.get('width') == '768' and image.get('height') == '1085' and 'blur' in image['src'],
                f'CTDS preview lost original portrait image identity: {identity}')
        records.append({
            'id': identity,
            'sourceTitle': title,
            'displayTitle': NEUTRAL_TITLE if identity == 'CTDS-004' else title,
            'requestHref': href,
            'requestParameters': params,
            'image': image,
            'displayAlt': NEUTRAL_ALT if identity == 'CTDS-004' else image['alt'],
            'access': [copy_text(tag) for tag in class_nodes(link, 'grecho-resource-card__tag')],
            'summary': copy_text(only(link.xpath('./p'), 'CTDS availability')),
        })
    return records


def render_image(source, alt):
    applicable = ('src', 'width', 'height', 'loading', 'decoding', 'sizes', 'srcset')
    attributes = ' '.join(f'{key}="{escape(source[key])}"' for key in applicable if key in source)
    return f'<img {attributes} alt="{escape(alt)}">'



ACCESS = (
    ('Public Resource', 'General product and application information for early review may be available to view directly.'),
    ('Form Submission', 'Selected Color TDS or marketing documents may be provided after a completed request where applicable.'),
    ('Internal Review', 'Full TDS, fire test documents, compliance files and SDS/MSDS may require GRECHO team review before sharing. Full TDS review considers the application, review stage and sharing scope.'),
    ('Review Required', 'Documents are checked before response against the sample, standard, market and project scope. Fire reports are matched to samples, standards and markets; compliance files to scope and validity; safety data to the applicable product and document version.'),
)
CONDITIONS = {
    'Public Resource / Request': ('public', '<path d="M12 6.5C9.5 4.5 6 4 3 5.5v13c3-1.5 6.5-1 9 1 2.5-2 6-2.5 9-1v-13c-3-1.5-6.5-1-9 1Z"/><path d="M12 6.5v13"/>'),
    'Form Submission': ('form', '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7m-7 4h7m-7 4H13"/>'),
    'Internal Review': ('internal', '<path d="M13 20H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v2m-5-7v5h5M8 11h4m-4 4h2"/><circle cx="16.5" cy="15.5" r="3.5"/><path d="m19 18 3 3"/>'),
    'Review Required': ('required', '<path d="M12 20H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5m-5-5v5h5M8 11h3m-3 4h2"/><circle cx="17" cy="16" r="4.5"/><path d="M17 13.5V16l1.5 1"/>'),
}


def render_condition(record):
    label = record['access']
    kind, icon = CONDITIONS[label]
    identity = 'rc-condition-' + record['token']
    return (f'<details class="rc-condition" data-rc-condition="{kind}">'
            f'<summary aria-label="{escape("Document access: " + label)}" aria-describedby="{identity}">'
            f'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{icon}</svg></summary>'
            f'<span class="rc-condition-text" id="{identity}">{escape(label)}</span></details>')


def gallery_model(main, home, contact, categories):
    home_section = only(home.xpath('//*[@id="application-examples"]'), 'accepted Home gallery')
    arrows = [
        html.tostring(only(home_section.xpath(f'.//button[@data-gallery-{direction}]/svg'), 'accepted ' + direction + ' arrow'),
                      encoding='unicode', with_tail=False)
        for direction in ('prev', 'next')
    ]
    process_nodes = class_nodes(contact, 'cg-process-card-head', 'div')
    process_images = [attrs(only(node.xpath('./img'), 'approved process image')) for node in process_nodes]
    require(len(process_images) == 3, 'Accepted Contact has three process assets.')
    availability_images = [categories[i]['image'] for i in (0, 1, 2, 4)]
    availability = [
        {'title': title, 'summary': summary, 'image': image, 'source': HOME}
        for (title, summary), image in zip(ACCESS, availability_images)
    ]
    availability.append({
        'title': 'Prepare Your Technical Request',
        'summary': 'Prepare your board application, material direction and document needs for GRECHO’s review.',
        'image': process_images[1], 'source': 'contact/index.html',
        'href': link(main, 'doc=review-required'),
    })
    process = [
        {'title': title, 'summary': summary, 'image': image, 'stage': i, 'source': 'contact/index.html'}
        for i, ((title, summary), image) in enumerate(zip(STEPS, process_images), start=1)
    ]
    process.append({
        'kicker': 'Document request guide',
        'title': 'How Document Request Works',
        'summary': 'Read the document-request guide to prepare the context and document scope for your review.',
        'actionLabel': 'Read the request guide',
        'source': HOME + '#diagnostic',
        'href': link(main, 'request-tds-sds-test-reports-fiberglass-facers/'),
    })
    return {'arrows': arrows, 'availability': availability, 'process': process}


def render_gallery(kind, model):
    if kind == 'availability':
        identity = 'document-availability-review'
        heading = 'Document availability and review'
        name = 'access condition cards'
        modifier = 'rc-access'
    else:
        identity = 'document-request-process'
        heading = 'How a document request is reviewed'
        name = 'request review cards'
        modifier = 'rc-process'
    track = identity + '-track'
    label = identity + '-title'
    cards = []
    for card in model[kind]:
        title = escape(card['title'])
        if 'kicker' in card:
            action = render_action(card['actionLabel'], card['href'], 'b1-button b1-primary rc-guide-action')
            cards.append(f'<li class="rc-gallery-card rc-process-guide"><div class="rc-guide-copy">'
                         f'<span class="rc-guide-kicker">{escape(card["kicker"])}</span>'
                         f'<h3>{title}</h3><p>{escape(card["summary"])}</p></div>{action}</li>')
            continue
        image = render_image(card['image'], card['image']['alt'])
        stage = card.get('stage')
        header = (f'<h3 class="rc-step-heading"><span class="rc-step" aria-hidden="true">{stage:02d}</span>'
                  f'<span>{title}</span></h3>' if stage else f'<h3>{title}</h3>')
        action = render_action(card['title'], card['href'], 'b1-text-action') if 'href' in card else ''
        focal = ' style="--rc-image-y:60%;"' if kind == 'process' else ''
        cards.append(f'          <li class="rc-gallery-card"><figure{focal}>{image}</figure>{header}'
                     f'<p>{escape(card["summary"])}</p>{action}</li>')
    previous, next_ = model['arrows']
    markup = '\n'.join(cards)
    return f'''    <section class="b1-section rc-gallery {modifier}" id="{identity}" data-rc-gallery aria-labelledby="{label}">
      <div class="b1-container">
        <div class="b1-section-heading">
          <h2 id="{label}">{heading}</h2>
        </div>
        <div class="rc-gallery-controls" data-rc-controls hidden>
          <span data-rc-count aria-live="polite" aria-atomic="true"></span>
          <button type="button" data-rc-prev aria-controls="{track}" aria-label="Previous {name}" disabled>{previous}</button>
          <button type="button" data-rc-next aria-controls="{track}" aria-label="Next {name}">{next_}</button>
        </div>
        <ul id="{track}" data-rc-track tabindex="0" role="list" aria-label="{heading}">
{markup}
        </ul>
      </div>
    </section>'''


def render_categories(records):
    cards = []
    for record in records:
        image = render_image(record['image'], record['image']['alt'])
        action = render_action(record['label'], record['href'], 'b1-text-action')
        cards.append(f'''
          <li class="rc-category" data-rc-category="{record['token']}">
            <figure>{image}</figure>
            <div>
              <div class="rc-category-heading"><h3>{escape(record['title'])}</h3> {render_condition(record)}</div>
              <p>{escape(record['summary'])}</p>
              {action}
            </div>
          </li>''')
    return '\n'.join(cards)


def render_documents(records):
    cards = []
    for record in records:
        image = render_image(record['image'], record['displayAlt'])
        action = render_action('Request Color TDS', record['requestHref'], 'b1-text-action')
        cards.append(f'''
          <li class="rc-record" id="{record['id']}" data-rc-record="{record['id']}">
            <figure class="rc-preview">{image}</figure>
            <div class="rc-record-info">
              <span class="rc-id">{record['id']}</span>
              <h3 data-rc-document-title>{escape(record['displayTitle'])}</h3>
              <p>{escape(record['summary'])}</p>
              {action}
            </div>
          </li>''')
    return '\n'.join(cards)


def link(main, marker):
    return only(main.xpath('.//a[contains(@href,$marker)]/@href', marker=marker), marker)


def build_markup(main, categories, documents, galleries):
    hero_primary = render_action('Browse Color TDS', '#color-tds-library', 'b1-button b1-primary')
    hero_secondary = render_action('Request Technical Data', link(main, 'source=resource-center-v2-hero'),
                                   'b1-button b1-secondary')
    final_primary = render_action('Request Technical Data',
                                  only(main.xpath('.//a[contains(@href,"source=resource-center-v2-final") and '
                                                  'not(contains(@href,"doc="))]/@href'), 'final technical-data route'),
                                  't02-final__action b1-button b1-primary')
    final_secondary = render_action('Not Sure What You Need?', link(main, 'doc=not-sure'),
                                    't02-final__action b1-button b1-secondary')
    return f'''
  <article class="b1-page gb-resource" id="resource-gallery" aria-labelledby="resource-title">
    <section class="b1-hero" aria-labelledby="resource-title">
      <figure class="b1-hero-art">
        <picture>
          <source media="(max-width: 767px)" srcset="{HERO_MOBILE}" width="800" height="600">
          <img src="{HERO_WIDE}" width="2160" height="720" alt="{HERO_ALT}" fetchpriority="high" decoding="async">
        </picture>
      </figure>
      <div class="b1-hero-inner b1-container">
        <div class="b1-hero-copy">
          <h1 id="resource-title">Technical Documents for Fiberglass Facer Review</h1>
          <p>Explore document types and Color TDS references for your facer review. Availability depends on the selected material, application and review scope.</p>
          <div class="b1-actions">{hero_primary}{hero_secondary}</div>
        </div>
      </div>
    </section>

    <section class="b1-section rc-types" aria-labelledby="rc-types-title">
      <div class="b1-container">
        <div class="b1-section-heading">
          <h2 id="rc-types-title">Choose a document request path</h2>
        </div>
        <ul class="rc-type-list" role="list">{render_categories(categories)}
        </ul>
      </div>
    </section>

    <section class="b1-section rc-library" id="color-tds-library" aria-labelledby="rc-library-title">
      <div class="b1-container">
        <div class="b1-section-heading">
          <h2 id="rc-library-title">Selected Color TDS Library</h2>
        </div>
        <div class="rc-search" data-rc-search-controls hidden>
          <div class="rc-search-field">
            <label class="b1-visually-hidden" for="rc-tds-search">Search by reference ID or title</label>
            <input type="search" id="rc-tds-search" aria-controls="rc-tds-records" placeholder="Search CTDS ID or title" autocomplete="off" spellcheck="false">
          </div>
          <button type="button" data-rc-clear>Clear search</button>
          <p class="rc-results" data-rc-results-status role="status" aria-live="polite" aria-atomic="true"></p>
        </div>
        <ul class="rc-library-list" id="rc-tds-records" role="list">{render_documents(documents)}
        </ul>
      </div>
    </section>

{render_gallery('availability', galleries)}

{render_gallery('process', galleries)}

    <section class="b1-final t02-final" aria-labelledby="rc-final-title">
      <div class="t02-final__panel">
        <div class="b1-final-copy">
          <h2 id="rc-final-title">Find the right document for your review</h2>
          <p>Share your board application, selected material and document needs. GRECHO can review the available documents and the next steps for your request.</p>
        </div>
        <div class="t02-final__actions">{final_primary}{final_secondary}</div>
      </div>
    </section>
  </article>
'''


def author_html(original, main, categories, documents, galleries, script):
    markup = build_markup(main, categories, documents, galleries)
    main_pattern = re.compile(r'(<main\b[^>]*\bid="grecho-v3-main"[^>]*>).*?(</main>)', re.S)
    rendered, count = main_pattern.subn(lambda match: match[1] + markup + match[2], original)
    require(count == 1, 'The authoritative main boundary changed.')

    # Delete the obsolete authoring nodes so these bars cannot return after a rebuild.
    for pattern in (
        r'<aside class="grecho-public-preview-note">.*?</aside>',
        r'<aside aria-label="Europe 2026 initiative" class="grecho-v3-initiative">.*?</aside>(?:\r?\n)?',
    ):
        rendered, count = re.subn(pattern, '', rendered, flags=re.S)
        require(count == 1, 'A legacy top notice boundary changed.')

    # The obsolete Hero overlay preview is not a feature of the new Hero.
    old_hero = re.compile(r'<link rel="stylesheet" href="' + re.escape(PREFIX)
                          + r'assets/css/(?:secondary-full-bleed-hero-v1|hero-r7-local|hero-overlay-demo-r11)\.css">')
    rendered, count = old_hero.subn('', rendered)
    require(count == 3, 'Legacy Hero stylesheet identities changed.')
    old_demo = f'<script defer src="{PREFIX}assets/js/hero-overlay-demo-r11.js"></script>'
    require(rendered.count(old_demo) == 1, 'Legacy Hero demo script identity changed.')
    rendered = rendered.replace(old_demo, '', 1)

    stylesheet = (f'<link rel="stylesheet" href="{PREFIX}assets/css/t02-solution-shell.css">\n'
                  f'<link rel="stylesheet" href="{PREFIX}assets/css/b1-gallery.css">\n'
                  f'<link rel="stylesheet" href="{PREFIX}resource-center/{CSS}">\n')
    script_sri = base64.b64encode(sha256(script).digest()).decode('ascii')
    script_tag = f'<script defer src="{PREFIX}resource-center/{JS}" integrity="sha256-{script_sri}"></script>\n'
    require(rendered.count('</head>') == 1, 'Head boundary changed.')
    rendered = rendered.replace('</head>', stylesheet + script_tag + '</head>', 1)

    def authority_footer(match):
        footer = match[0]
        start = '<footer class="grecho-v3-footer" id="grecho-v3-footer">'
        old_logo = 'grecho-logo-white-webp-v1.webp'
        require(footer.count(start) == 1 and footer.count(old_logo) == 1, 'Resource Footer shell changed.')
        return footer.replace(start, start.replace('grecho-v3-footer"', 'grecho-v3-footer t02-gallery-footer"', 1), 1) \
                     .replace(old_logo, 'grecho-logo-blue-webp-v1.webp', 1)

    rendered, count = re.subn(r'<footer\b.*?</footer>', authority_footer, rendered, flags=re.S)
    require(count == 1, 'Resource Footer boundary changed.')
    doc = html.fromstring(rendered)
    new_main = only(doc.xpath('//*[@id="grecho-v3-main"]'), 'new main')
    require(Counter(main.xpath('.//a/@href')) == Counter(new_main.xpath('.//a/@href')),
            'The generated main did not preserve all legacy route occurrences.')
    require(len(new_main.xpath('./article')) == 1 and len(new_main) == 1,
            'Resource Main must end at the new article boundary.')
    old_doc = html.fromstring(original)
    for xpath in ('//header', '//noscript', '//a[@class="grecho-v3-skip"]', '//footer//a'):
        before = [html.tostring(node, with_tail=False) for node in old_doc.xpath(xpath)]
        after = [html.tostring(node, with_tail=False) for node in doc.xpath(xpath)]
        if xpath == '//footer//a':
            before = [item.replace(b'grecho-logo-white-webp-v1.webp', b'grecho-logo-blue-webp-v1.webp')
                      for item in before]
        require(before == after, f'Protected navigation markup changed: {xpath}')
    for obsolete in ('grecho-public-preview-note', 'grecho-v3-initiative', 'b1-hero-disclosure'):
        require(not class_nodes(doc, obsolete), f'Obsolete display markup returned: {obsolete}')
    return rendered.encode('utf-8')


def asset(preview, url, width, height, alt, disclosure):
    path = urlsplit(url).path
    require(path.startswith(PREFIX), f'Unexpected external asset: {url}')
    relative = path.removeprefix(PREFIX)
    local = (preview / relative).resolve()
    require(local.is_relative_to(preview) and local.is_file(), f'Missing asset: {relative}')
    from PIL import Image
    with Image.open(local) as bitmap:
        dimensions = bitmap.size
        require(bitmap.format == 'WEBP' and dimensions == (int(width), int(height)),
                f'Unexpected WebP format or dimensions: {relative} {dimensions}')
    return {
        'path': relative, 'sha256': sha256(local.read_bytes()).hexdigest(),
        'width': dimensions[0], 'height': dimensions[1], 'alt': alt,
        'rightsScope': 'GRECHO-authorized local review use. Broader source license unverified.',
        'disclosure': disclosure,
    }


def evidence(preview, destination, source, output, categories, documents, galleries):
    ctds = []
    for record in documents:
        image = record['image']
        image_evidence = asset(preview, image['src'], image['width'], image['height'],
                               record['displayAlt'], 'Original blurred public preview, byte-for-byte reuse.')
        ctds.append({**record, 'imageEvidence': image_evidence})
    values = {
        'RESOURCE_CTDS_IDENTITY.json': {
            'sourceSHA256': sha256(source).hexdigest(),
            'runtimeSHA256': sha256(output).hexdigest(),
            'count': len(ctds),
            'records': ctds,
            'issueLedger': {
                'CTDS-004': {
                    'status': 'BUSINESS_VERIFICATION_PENDING',
                    'sourceTitleClaim': '380gsm',
                    'sourceAltAndFilenameClaim': '360gsm',
                    'publicDisplayTitle': NEUTRAL_TITLE,
                    'requestIdAndImageBytesPreserved': True,
                },
                'formalCTDSToP01P14Mapping': 'UNCONFIRMED; no mapping rendered or indexed',
            },
        },
        'RESOURCE_ASSETS.json': {
            'sourceSHA256': sha256(source).hexdigest(),
            'runtimeSHA256': sha256(output).hexdigest(),
            'dedicatedConceptHero': [
                asset(preview, HERO_WIDE, 2160, 720, HERO_ALT, 'Generated conceptual art; dedicated Resource Center Hero, no real facility or document implied.'),
                asset(preview, HERO_MOBILE, 800, 600, HERO_ALT, 'Generated conceptual art; mobile Resource Center crop.'),
            ],
            'homepageCategoryConcepts': [
                {'category': record['title'], **asset(preview, image['src'], image['width'], image['height'],
                                                       image['alt'], 'Reuse of existing accepted Homepage concept art.')}
                for record in categories for image in [record['image']]
            ],
            'reviewGalleries': {
                kind: [
                    {'role': card['title'], 'referencePage': card['source'],
                     'frameRatio': '3:2' if kind == 'availability' else '16:9',
                     **asset(preview, image['src'], image['width'], image['height'],
                             image['alt'], 'Reuse of existing Gallery conceptual imagery.')}
                    for card in galleries[kind] if 'image' in card for image in [card['image']]
                ] for kind in ('availability', 'process')
            },
            'processTextGuide': {
                'role': galleries['process'][-1]['title'],
                'referencePage': galleries['process'][-1]['source'],
                'href': galleries['process'][-1]['href'],
                'image': None,
            },
            'galleryPhotographicCTA': asset(preview, CTA_IMAGE, 1672, 941, '',
                                            'Decorative accepted Gallery concept photo reused from Contact R2.2/Solutions CTA.'),
            'originalBlurredReferenceLedger': 'RESOURCE_CTDS_IDENTITY.json',
        },
    }
    destination.mkdir(parents=True, exist_ok=True)
    for name, value in values.items():
        (destination / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n',
                                        encoding='utf-8', newline='\n')


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True, help='Exact legacy Resource Center HTML')
    parser.add_argument('--preview', type=Path, required=True, help='Staged local preview runtime root')
    parser.add_argument('--evidence', type=Path, help='Emit image provenance and identity ledgers after assets exist')
    options = parser.parse_args()
    preview = options.preview.resolve()
    output_dir = (preview / 'resource-center').resolve()
    require(output_dir.is_dir() and output_dir.parent == preview, 'Use the existing Resource directory in a staged preview.')
    require(options.source.resolve() != output_dir / 'index.html', 'The source must be separate from the generated runtime.')
    raw = options.source.read_bytes()
    old_page = html.fromstring(raw.decode('utf-8'))
    main_node = only(old_page.xpath('//*[@id="grecho-v3-main"]'), 'baseline Resource main')
    home = html.fromstring((preview / HOME).read_text(encoding='utf-8'))
    categories = create_category_records(main_node, home)
    documents = create_document_records(main_node)
    contact = html.fromstring((preview / CONTACT).read_text(encoding='utf-8'))
    galleries = gallery_model(main_node, home, contact, categories)
    script = (SOURCE / JS).read_bytes()
    output = author_html(raw.decode('utf-8'), main_node, categories, documents, galleries, script)
    output_items = {'index.html': output, CSS: (SOURCE / CSS).read_bytes(), JS: script}
    if options.evidence:
        evidence(preview, options.evidence.resolve(), raw, output, categories, documents, galleries)
    for name, content in output_items.items():
        path = output_dir / name
        if not path.is_file() or path.read_bytes() != content:
            path.write_bytes(content)
        print(f'{sha256(content).hexdigest()}  resource-center/{name}')


if __name__ == '__main__':
    main()
