#!/bin/sh

dir=/var/www/sito/web/yono/uchu_proto/pieceImgs

for i in $dir/*png ; do
	f=`basename $i`
	echo $f
	pngtopnm $i | pnmenlarge 2 | pnmtopng > $dir/2x/$f
	pngtopnm $i | pnmenlarge 4 | pnmtopng > $dir/4x/$f
done
