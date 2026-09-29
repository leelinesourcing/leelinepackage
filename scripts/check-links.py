import os, re, glob, html, urllib.parse
from collections import defaultdict

root = 'dist/client'
pages = {}
for p in glob.glob(os.path.join(root, '**', 'index.html'), recursive=True):
    rel = os.path.relpath(p, root).replace(os.sep, '/')
    route = '/' + rel[:-len('index.html')]
    if route == '/':
        pages['/'] = p
    else:
        pages[route.rstrip('/') + '/'] = p

known = set(pages)
for p in glob.glob(os.path.join(root, '*.*')):
    known.add('/' + os.path.basename(p))

broken = defaultdict(set)
frag = defaultdict(set)
total = 0
for route, path in sorted(pages.items()):
    s = open(path, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'<a\b[^>]*\shref="([^"]+)"', s):
        h = html.unescape(m.group(1)).strip()
        if h.startswith(('mailto:', 'tel:', 'http://', 'https://', '//')):
            continue
        total += 1
        if h.startswith('#'):
            if h != '#':
                frag[route].add(h)
            continue
        base = h.split('#')[0].split('?')[0]
        if base == '':
            continue
        key = base if base.startswith('/') else '/' + base
        if key not in known and key.rstrip('/') + '/' not in known:
            broken[route].add(h)

print('pages=%d  internal links checked=%d' % (len(pages), total))
print()
print('=== BROKEN TARGETS ===')
if not broken:
    print('  none')
for r in sorted(broken):
    print('  ' + r)
    for h in sorted(broken[r]):
        print('      -> ' + h)
print()
print('=== SAME-PAGE FRAGMENT LINKS ===')
if not frag:
    print('  none')
for r in sorted(frag):
    s = open(pages[r], encoding='utf-8', errors='replace').read()
    for h in sorted(frag[r]):
        # The href is percent-encoded when the id is not ASCII (accents, an emoji variation
        # selector), while the id in the HTML is decoded — compare the decoded form.
        tid = urllib.parse.unquote(h[1:])
        ok = ('id="%s"' % tid) in s
        print('  %s %s %s' % ('OK  ' if ok else 'MISS', r, h))
