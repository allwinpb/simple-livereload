Simple LiveReload (WIP)
=======================

No-bullshit tool to livereload a page.

WIP Node module to ease HTML/Web-design development by refreshing the browser 
whenever a change is detected in one of the files involved.

Why?
---
It is a lot simpler than alternatives. It needs nothing but node, works in any 
browser that supports AJAX and needs no other browser extensions or extra 
`<script>` tags in the document to work.

How to install
---
This module is WIP so the install/usage workflow is not exactly easy. In order 
to install it,

+ Install `node`
+ Clone this Repo
+ Run `npm install` on the Repo

How to use
---

+ Go to the root of the project you are currently working on
+ Run `node <path/to/repo/index.js>`
+ Go to localhost:8888 (Static server beginning at project root)
+ Open the HTML file you are currently working on and leave it open
+ It will auto-update as you edit the HTML file or any of the linked
  js or css files

How it works
---

The static server injects a script tag into every HTML file it serves that 
keeps in touch with the static server. When the module detects a change in 
the HTML file or any of it's dependencies (currently js and css), it will 
instruct the page to reload itself.