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
                      hero.m4v   the film behind the hero headline
                      *.mp4      compatibility fallbacks
  images/             logos, renders and video posters
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
The four WebM scenes are controlled by scrolling through the sticky Journey
section. Each scene scrubs from its first frame to its last frame before the
crossfade to the next scene begins. After Gardens, scrolling raises a full-screen
Masterplan graphic before the section content appears. Scrolling back reverses
the sequence.
