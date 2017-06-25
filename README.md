# Yono
Folding and branching collaborative art framework developed for SITO.org

Explore the nested pixel-arts at http://sitoorg.github.io/yono/uchu_proto/index.html

## What it is
Yono is a collaborative art project to which artists contribute 64x64 pixel art squares (we call them *yonodes*) that build 
upon previously-placed yonodes. The way in which they build upon each other is from the inside out. That is, a *parent* yonode is 
split in half (left/right or top/bottom) and the new yonode is created to fill gap created.

Navigating Yono is done by collapsing and expanding yonodes to reveal (or hide) *child* yonodes.

It's kind of like those <a href="http://en.wikipedia.org/wiki/Mad_Fold-in">Mad Magazine *fold-in* puzzles</a>.

## This code
The code in this repository is designed for loading and presenting Yono data in a web browser. This consists primarily of
the navigator, which allows users to crawl around inside the Yonoverse. Also included are summary pages for viewing all (p)articipants 
and quickly perusing open slots.

The goal here is to create a modular and easy-to-use library so anyone who is interested can run their own Yono instance
(I call them *uchus*). The first commits are definitely not modular, but they work. 



