import re, glob, os

def decode(s):
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)

pat = re.compile(r'(\d+)\s*[\-\u2013]\s*(\d+)\s*(?:working\s*)?days', re.I)
rows = {}
files = sorted(glob.glob('src/pages/*.astro') + glob.glob('src/components/*.astro'))
for path in files:
    raw = open(path, encoding='utf-8').read()
    s = decode(raw)
    for m in pat.finditer(s):
        key = re.sub(r'\s+', ' ', m.group(0))
        line = s[:m.start()].count('\n') + 1
        rows.setdefault(key, []).append('%s:%d' % (os.path.basename(path), line))

for k in sorted(rows):
    print('%-18s (%2d)  %s' % (k, len(rows[k]), '  '.join(sorted(rows[k]))))
print()
print('distinct figures:', len(rows))
