ALPHA INTERNATIONAL CITY — static website bundle
Jujhar Group · Amritsar

HOW TO PUT IT ONLINE
1. Unzip this folder.
2. Upload EVERYTHING inside it (index.html, assets/, videos/, images/,
   favicon.ico, og-image.png) to your web host or to the folder you want
   the page to live in.
3. Link to index.html.

All paths are relative, so it works in any of these:
  https://yourdomain.com/                -> index.html at the root
  https://yourdomain.com/alpha-city/     -> inside a sub-folder
  Netlify / Vercel / Cloudflare Pages    -> drag the whole folder in
  cPanel / FTP                           -> upload into public_html

Opening index.html by double-clicking it (file://) shows the page, but some
browsers block local video playback — use a host or a local server instead:
  python3 -m http.server 8000     then open http://localhost:8000

WHAT'S INSIDE
  index.html          the page — this is the file you link to
  assets/             compiled CSS + JavaScript
  videos/             *.webm  supplied 1920x1080 walkthrough films used in
                      the Journey section, in arrival / commercial /
                      clubhouse / garden order
                      *.m4v  original full HD walkthrough films
                      *-720.m4v  original 720p versions
                      hero.m4v   previous opening film (retained as a source)
                      *.mp4      compatibility fallbacks
  images/             logos, renders and video posters
                      sequence-01/ has 210 high-quality 1920x1080 WebP
                      frames converted from the supplied 01/ JPG sequence
                      masterplan-takeover.svg draws the full-screen contour
                      transition after the final garden frame
                      masterplan-bridge.svg continues the motif in Masterplan
  favicon.ico         browser tab icon
  og-image.png        link-preview image for WhatsApp / social shares

SERVER NOTE
Nothing needs Node, PHP or a database — it is plain static files. Just make
sure your host serves .m4v files (MIME type video/mp4). Almost all do; on
Apache, add this to .htaccess if the videos don't play:
  AddType video/mp4 .m4v

STILL TO REPLACE (marked TODO on the page)
  - footer address, phone, email
  - RERA and CIN registration numbers
  - the four footer gallery images
Send the real ones and they can be swapped in.

JOURNEY PLAYBACK
The opening now contains all four scroll-controlled WebP sequences in a single
sticky stage: 01 (210 frames), 02 (216), 03 (288), and 04 (288). The hero text
fades out with an 8px lift midway through sequence 01. The dark hero gradients
fade away at the same time, leaving a light 4% wash over the imagery.

Sequence 02 dissolves directly into sequence 03, followed by sequence 04.
There is no content interlude or pause between the sequences. All frames, fades and transitions follow the scroll
position and reverse when scrolling back. There is no timed playback.

The old, separate four-video Journey block has been removed. The original
Masterplan, Clubhouse & Interiors, Elevations, and enquiry/footer remain.

MEDIA LOADING
WebP frames load in a bounded window around the scroll position, with the next
scene's opening prepared before a dissolve. Obsolete queued requests are
discarded after fast scrolling. Clubhouse films still load only when that
existing showcase is visible and a film is selected.

OPENING
On a fresh visit the first sequence frame stays still with the Alpha City logo
centered. The first scroll reveals the original hero content. The original JPG
frames remain in 01/, 02/, 03/, and 04/; the page uses their 1920x1080 WebP
copies in images/sequence-01/ through images/sequence-04/.

The additions live in assets/hero-sequence-player.js and
assets/sequence-journey.css.
To regenerate missing WebP frames for 02–04, run:
  python scripts/convert-sequences.py
This requires Pillow and preserves the original JPGs.
