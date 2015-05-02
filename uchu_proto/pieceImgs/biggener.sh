#!/bin/sh
# This script goes through the Yono pieces and makes 2x and 4x nearest neighbor enlargements.
# Requires: Netpbm libs

# set the path to these images
# e.g. /var/www/sito/web/yono/uchu_proto/pieceImgs
dir=/path/to/this/yono/uchu_proto/pieceImgs

for i in $dir/*png ; do
	f=`basename $i`
	echo $f
	pngtopnm $i | pnmenlarge 2 | pnmtopng > $dir/2x/$f
	pngtopnm $i | pnmenlarge 4 | pnmtopng > $dir/4x/$f
done
