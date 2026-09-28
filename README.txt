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
The opening now contains three scroll-controlled WebP sequences in a single
sticky stage: 01 (288 frames), the replacement 03 (360), and 04 (216). The hero text
fades out with an 8px lift midway through sequence 01. The dark hero gradients
fade away at the same time, leaving a light 4% wash over the imagery.

Sequence 02 has been removed from playback. Sequence 01 now dissolves directly
into the replacement sequence 03, followed by sequence 04. Existing end-of-scene
captions and the clubhouse-to-gardens transition remain. All frames, fades and
transitions follow the scroll position and reverse when scrolling back.
There is no timed playback.

Sequence 03 opens on its first sky frame with a floating clubhouse photo
composition and the heading "Life, beautifully shared." The four photographs
in images/clubhouse-intro/ are optimized WebP copies of the supplied interiors.
The intro uses 2.1 viewport heights of scroll: photos settle into view, then
drift and fade out with the text before the 360-frame sequence starts moving.
Reduced-motion settings keep the fades and remove the drifting movement.

The old, separate four-video Journey block has been removed. The original
Masterplan, Clubhouse & Interiors, Elevations, and enquiry/footer remain.

MEDIA LOADING
WebP frames load in a bounded window around the scroll position, with the next
scene's opening prepared before a dissolve. Obsolete queued requests are
discarded after fast scrolling. Showcase films load only when that
existing showcase is visible and a film is selected.

The Clubhouse & Interiors gallery uses the six supplied images from Clubb_Area.
Elevation A uses the two supplied living-space films and five interior images
from Elevation_A (two images serve as the film posters). The gallery labels and
paths are maintained in assets/showcase-media.js. Elevation B keeps its existing
media. Films load only on selection in the visible section, pause when leaving,
and include playback controls. Web copies are under images/showcase/ and
videos/showcase/; the supplied originals remain in their folders.
To regenerate these copies with Pillow and FFmpeg, run:
  python scripts/prepare-showcase-media.py

OPENING
On a fresh visit the first sequence frame stays still with the Alpha City logo
centered. The first scroll reveals the original hero content. The original JPG
frames remain in 01/, 02/, 03/, and 04/; the page uses their 1920x1080 WebP
copies in images/sequence-01/ through images/sequence-04/.

The additions live in assets/hero-sequence-player.js and
assets/sequence-journey.css.
To replace sequence 03 WebP frames from the supplied 03/ JPG folder, run:
  python scripts/convert-sequences.py
This requires Pillow and preserves the original JPGs.
