"""
Asharchives Qbank builder  (works in Google Colab or on your own computer)

WHAT IT DOES
  Takes question JSON files (same format as your anatomy.json) + your current
  qbank-data.js, merges the questions in, and gives you a new qbank-data.js
  to upload to your website.  Running it twice with the same file is safe:
  duplicates are skipped.

HOW TO USE IN COLAB
  1. Paste this whole script into ONE Colab cell and run it.
  2. When asked, upload:  (a) your current qbank-data.js   (b) one or more JSON files.
     Then answer Y to download the images (they get shrunk and saved in an 'images' folder).
     Name each JSON after its subject, e.g.  physiology.json, pathology.json
     (if a name doesn't match, the script will ask which subject it is).
  3. A file downloads automatically (qbank-site-files.zip when images are on). Unzip it and upload
     qbank-data.js AND the images folder to your site, replacing the old qbank-data.js.
"""
import json, re, os, sys, glob

SUBJECTS = ["anatomy","physiology","biochemistry","pathology","pharmacology","microbiology",
            "forensic-medicine","community-medicine","ent","ophthalmology","general-medicine",
            "general-surgery","obgyn","paediatrics","orthopaedics","dermatology","psychiatry",
            "anaesthesia","radiology"]

# ---------- 1. HTML -> plain text (lists, tables, <br>, <p>) ----------
from html.parser import HTMLParser
class _T(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.out=[]; s.ol=[]
    def handle_starttag(s,t,a):
        if t=='br' or t in('p','div','tr'): s.out.append('\n')
        elif t=='ol': s.ol.append(0)
        elif t=='ul': s.ol.append(None)
        elif t=='li':
            s.out.append('\n')
            if s.ol and s.ol[-1] is not None:
                s.ol[-1]+=1; s.out.append(f'{s.ol[-1]}. ')
            else: s.out.append('• ')
    def handle_endtag(s,t):
        if t in('ol','ul') and s.ol: s.ol.pop()
        if t in('p','div'): s.out.append('\n')
        if t in('td','th'): s.out.append('  |  ')
    def handle_data(s,d): s.out.append(d)

def clean(x):
    if not x: return ''
    x = str(x)
    if '<' in x:
        p=_T(); p.feed(x); x=''.join(p.out)
        x=re.sub(r'  \|  (?=\n|$)','',x)
    x=x.replace('\xa0',' ')
    x=re.sub(r'[ \t]+\n','\n',x); x=re.sub(r'\n{3,}','\n\n',x)
    if '|' not in x: x=re.sub(r' {2,}',' ',x)
    return x.strip()

# ---------- 2. convert one question from your JSON format ----------
def convert(r):
    opts = r.get('options') or []
    if len(opts) != 4: raise ValueError(f"needs exactly 4 options, found {len(opts)}")
    ans = [i for i,o in enumerate(opts) if o.get('correct')]
    if len(ans) != 1: raise ValueError(f"needs exactly 1 correct option, found {len(ans)}")
    e = clean(r.get('explanation',''))
    e = re.sub(r'^Correct answer:[^\n]*\n?','',e).strip()      # quiz already highlights the answer
    item = {'q': clean(r.get('question','')), 'o':[clean(o.get('text','')) for o in opts],
            'a': ans[0], 'e': e}
    if not item['q']: raise ValueError("empty question")
    if r.get('exam','').strip(): item['x'] = r['exam'].strip()
    imgs = [u for u in (r.get('images') or []) if str(u).startswith('http')]
    eimgs = [u for u in (r.get('explanation_images') or []) if str(u).startswith('http')]
    if imgs: item['i'] = imgs
    if eimgs: item['ei'] = eimgs
    return item

# ---------- 3. read existing qbank-data.js (old unquoted-key style OR new JSON style) ----------
def js_to_json(src):
    """Tiny tokenizer: removes comments, quotes bare keys, leaves strings untouched."""
    out=[]; i=0; n=len(src)
    while i<n:
        c=src[i]
        if c in '"\'':                                   # string
            q=c; j=i+1
            while j<n and src[j]!=q:
                j += 2 if src[j]=='\\' else 1
            s=src[i+1:j]
            out.append(json.dumps(s.replace("\\'", "'") if q=="'" else json.loads('"'+s+'"')))
            i=j+1
        elif src.startswith('/*',i): i=src.index('*/',i)+2
        elif src.startswith('//',i):
            k=src.find('\n',i); i = n if k<0 else k
        elif c.isalpha() or c=='_':                       # bare word
            j=i
            while j<n and (src[j].isalnum() or src[j] in '_-'): j+=1
            w=src[i:j]; k=j
            while k<n and src[k].isspace(): k+=1
            out.append(json.dumps(w) if k<n and src[k]==':' else w); i=j
        else: out.append(c); i+=1
    txt=''.join(out)
    txt=re.sub(r',\s*([\]}])',r'\1',txt)                  # trailing commas
    return txt

def load_qbank(path):
    if not path or not os.path.exists(path): return {}
    src=open(path,encoding='utf-8').read()
    m=re.search(r'window\.ASH_QBANK\s*=\s*',src)
    if not m: raise SystemExit("Could not find 'window.ASH_QBANK =' in "+path)
    body=src[m.end():].strip().rstrip(';').strip()
    return json.loads(js_to_json(body))

def save_qbank(bank,path):
    lines=[]
    for sid,qs in bank.items():
        rows=',\n'.join('  '+json.dumps(q,ensure_ascii=False,separators=(',',':')) for q in qs)
        lines.append(f' {json.dumps(sid)}:[\n{rows}\n ]')
    js=("/* Asharchives Qbank data. Generated by make_qbank.py - re-run the script to add more questions.\n"
        "   Fields: q=question, o=options, a=correct index (0=A), e=explanation, x=exam/PYQ tag, i=images, ei=explanation images */\n"
        "window.ASH_QBANK = {\n"+',\n'.join(lines)+"\n};\n")
    open(path,'w',encoding='utf-8').write(js)

# ---------- 4. merge ----------
def merge(bank, subject, json_path):
    data=json.load(open(json_path,encoding='utf-8'))
    if isinstance(data,dict):                              # tolerate {"questions":[...]}
        data=data.get('questions') or next(v for v in data.values() if isinstance(v,list))
    have={(q['q'], tuple(q['o']), q.get('x','')) for q in bank.get(subject,[])}
    added=dup=bad=0
    for k,r in enumerate(data,1):
        try: item=convert(r)
        except Exception as ex:
            bad+=1; print(f"   skipped #{k} (id {r.get('id','?')}): {ex}"); continue
        key=(item['q'], tuple(item['o']), item.get('x',''))
        if key in have: dup+=1; continue
        have.add(key); bank.setdefault(subject,[]).append(item); added+=1
    print(f"   {os.path.basename(json_path)} -> {subject}: {added} added, {dup} duplicates skipped, {bad} invalid skipped")
    return added

ALIASES={"anesthesia":"anaesthesia","anesthesiology":"anaesthesia","medicine":"general-medicine","surgery":"general-surgery",
 "obstetrics-and-gynecology":"obgyn","obstetrics-and-gynaecology":"obgyn","gynecology":"obgyn","ob-gyn":"obgyn",
 "orthopedics":"orthopaedics","pediatrics":"paediatrics","forensic":"forensic-medicine","community":"community-medicine","psm":"community-medicine",
 "ophthal":"ophthalmology","derma":"dermatology"}
def pick_subject(fname):
    stem=os.path.splitext(os.path.basename(fname))[0].lower().replace('_','-').replace(' ','-')
    stem=re.sub(r'-\d+$','',stem)                    # anatomy_1.json -> anatomy
    stem=ALIASES.get(stem,stem)
    if stem in SUBJECTS: return stem
    print(f"\nWhich subject is '{fname}'?\n  "+', '.join(SUBJECTS))
    while True:
        s=input("Subject id: ").strip().lower()
        if s in SUBJECTS: return s
        print("  not a valid subject id, try again")

# ---------- 4b. download images and store them on your own site ----------
def localize_images(bank, img_dir='images', max_w=800, quality=72, workers=8):
    """Downloads every http image used by questions/explanations, shrinks it to WebP,
    saves it in img_dir/ and rewrites the question to point at 'images/<name>.webp'.
    Images that fail to download keep their original link (you can re-run to retry)."""
    import hashlib, io, urllib.request
    from concurrent.futures import ThreadPoolExecutor
    from PIL import Image
    os.makedirs(img_dir, exist_ok=True)
    urls = sorted({u for qs in bank.values() for q in qs for k in ('i','ei') for u in q.get(k,[]) if u.startswith('http')})
    print(f"\nImages to download: {len(urls)}")
    mapping, failed = {}, []
    def fetch(u):
        name = hashlib.sha1(u.encode()).hexdigest()[:14] + '.webp'
        path = os.path.join(img_dir, name)
        if not os.path.exists(path):
            req = urllib.request.Request(u, headers={'User-Agent':'Mozilla/5.0'})
            raw = urllib.request.urlopen(req, timeout=30).read()
            im = Image.open(io.BytesIO(raw)); im.seek(0)
            im = im.convert('RGBA' if im.mode in ('RGBA','LA','P') else 'RGB')
            if im.width > max_w: im = im.resize((max_w, round(im.height*max_w/im.width)), Image.LANCZOS)
            im.save(path, 'WEBP', quality=quality, method=6)
        return u, img_dir + '/' + name
    with ThreadPoolExecutor(workers) as ex:
        futs = [ex.submit(fetch, u) for u in urls]
        for n, (u, f) in enumerate(zip(urls, futs), 1):
            try: mapping[u] = f.result()[1]
            except Exception as e: failed.append((u, str(e)[:60]))
            if n % 50 == 0 or n == len(urls): print(f"   {n}/{len(urls)} done")
    for qs in bank.values():
        for q in qs:
            for k in ('i','ei'):
                if k in q: q[k] = [mapping.get(u, u) for u in q[k]]
    size = sum(os.path.getsize(os.path.join(img_dir,f)) for f in os.listdir(img_dir))/1e6
    print(f"Saved {len(mapping)} images ({size:.1f} MB in '{img_dir}/'). Failed: {len(failed)}")
    for u, e in failed[:10]: print("   FAILED", u, e)
    return failed

# ---------- 5. run ----------
def main(qbank_path, json_paths, out_path='qbank-data.js', images=False):
    bank=load_qbank(qbank_path)
    print("Existing:", {k:len(v) for k,v in bank.items()} or "nothing (starting fresh)")
    total=sum(merge(bank,pick_subject(p),p) for p in json_paths)
    if images: localize_images(bank)
    save_qbank(bank,out_path)
    print("\nDone. New totals:", {k:len(v) for k,v in bank.items()})
    return out_path

if __name__=='__main__':
    try:
        from google.colab import files                       # ---- Colab mode
        print("Step 1: upload your CURRENT qbank-data.js (cancel if you have none)")
        up=files.upload(); qb=next((k for k in up if k.endswith('.js')),None)
        print("\nStep 2: upload your question JSON file(s)")
        up=files.upload(); js=[k for k in up if k.endswith('.json')]
        if not js: raise SystemExit("No .json files uploaded")
        ans=input("\nDownload the images and store them on your own site? (recommended) [Y/n]: ").strip().lower()
        use_img = ans != 'n'
        out=main(qb,js,'qbank-data.js',images=use_img)
        if use_img:

            import zipfile
            with zipfile.ZipFile('qbank-site-files.zip','w',zipfile.ZIP_STORED) as z:
                z.write('qbank-data.js')
                for f in os.listdir('images'): z.write(os.path.join('images',f))
            files.download('qbank-site-files.zip')
        else: files.download(out)
    except ImportError:                                      # ---- normal computer mode
        # usage: python make_qbank.py qbank-data.js anatomy.json physiology.json
        args=[a for a in sys.argv[1:] if a!='--images']
        if len(args)<2: raise SystemExit("usage: python make_qbank.py qbank-data.js file1.json [file2.json ...] [--images]")
        main(args[0], args[1:], 'qbank-data.new.js', images='--images' in sys.argv)
