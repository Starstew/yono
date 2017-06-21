yono.canvas = (function(){
	var p = {},
		pieces_path = "./pieceImgs/2X/",
		id_canvas_element = "yono_canvas",
		id_canvas_buffer1 = "yono_canvas_buffer1",
		nodesize = 128,
		images_hash = {},
		cvs, // canvas
		ctx, // context
		cvs_buffer1, // for self-referencing
		ctx_buffer1, // context of copy
		images_loaded = {},
		yonograph_details = {};

	var init = function(iobj) {
		id_canvas_element = (iobj && iobj['id_canvas_element']) ? iobj.id_canvas_element : id_canvas_element;

		// init canvas
		cvs = document.getElementById(id_canvas_element);
		ctx = cvs.getContext("2d");

		cvs_buffer1 = document.getElementById(id_canvas_buffer1);
		ctx_buffer1 = cvs_buffer1.getContext("2d");
	};

	var loadImages = function(id_array) {
		for (var i=0;i<id_array.length;i++){
			var url = pieces_path + id_array[i] + ".png";
			var img = $("<img data-yid='"+id_array[i]+"' src='" + url + "' data-index='" + i + "'/>");
			img.load(function(){
				images_loaded[$(this).data("yid")] = this;
			});
		}
	};

	var getImageFromId = function(id) {
		return images_loaded[id];
	};

	var drawYonograph = function(yset,x,y,tgt_cvs) {
		var nshalf = nodesize/2,
			w = nshalf,
			h = nshalf;

		x = x || 300,
		y = y || 300,

		tgt_cvs = tgt_cvs || cvs; // use default cvs if none passed
		tgt_ctx = tgt_cvs.getContext("2d");
		tgt_ctx.clearRect(0, 0, tgt_cvs.width, tgt_cvs.height);

		yonograph_details = {x:0,y:0,w:0,h:0};

		var cv = 1,
			ch = 1;
		for (var i=0;i<yset.length;i++) {
			var yid = yset[i].id,
				img = getImageFromId(yid),
				spl = yset[i].split;
			cv+=(spl=="v")?1:0;
			ch+=(spl=="h")?1:0;
			if (i==0) {
				drawImageToCanvas(img,x,y,tgt_cvs);
			} else {
				var params = {};
				if (yset[i-1].split == "h") {
					x -= nshalf;
					w += nodesize;
				} else {
					y -= nshalf;
					h += nodesize;
				}
				params = {x:x,y:y,width:w,height:h};
				drawImageSplitToCanvas(img,params,tgt_cvs);
			}
		}
		yonograph_details = {x:x,y:y,w:ch*nodesize,h:cv*nodesize};
		//cacheCanvas();
	};

	var drawImageSplitToCanvas = function(img,params,tgt_cvs) {
		// params = x,y,width,height (extents)
		var x = params.x,
			y = params.y,
			w = params.width,
			h = params.height,
			nshalf = nodesize*0.5;

		tgt_cvs = tgt_cvs || cvs;
		var tgt_ctx = tgt_cvs.getContext("2d");
		// make 4 copies, cropped to corners
		tgt_ctx.drawImage(img,0,0,nshalf,nshalf,x,y,nshalf,nshalf); 				//nw
		tgt_ctx.drawImage(img,nshalf,0,nshalf,nshalf,x+w,y,nshalf,nshalf); 			//ne
		tgt_ctx.drawImage(img,nshalf,nshalf,nshalf,nshalf,x+w,y+h,nshalf,nshalf); 	//se
		tgt_ctx.drawImage(img,0,nshalf,nshalf,nshalf,x,y+h,nshalf,nshalf); 			//sw

	};

	var bufferCanvas = function(f_cvs,t_cvs) {
		f_cvs = f_cvs || cvs;
		t_cvs = t_cvs || cvs_buffer1;

		t_cvs.width = f_cvs.width;
		t_cvs.height = f_cvs.height;

		t_ctx = t_cvs.getContext('2d');
		t_ctx.clearRect(0,0,t_cvs.width,t_cvs.height);
		t_ctx.drawImage(f_cvs,0,0);
	};

	/*
		- assumes the "target" image has already been drawn to hidden canvas 
		- [offset] is factor of nodesize (1=nodesize)
		- [dir] is either "v" of "h"
	*/
	var drawYonographProgression = function(dir,offset,f_cvs) {
		dir = dir || "v";
		offset = offset || 1;

		f_cvs = f_cvs || cvs_buffer1;
		var t_ctx = ctx;

		// we need the x,y,w,h of the last drawn yonograph
		var x = yonograph_details.x,
			y = yonograph_details.y,
			h = yonograph_details.h,
			w = yonograph_details.w,
			hh = h/2,
			hw = w/2,
			cx = (hw)+x,
			cy = (hh)+y,
			pxoffset = offset*nodesize,
			hnode = nodesize/2,
			hoff = pxoffset/2,
			s2x, // source second half (right|bottom), first is always x,y
			s2y,
			t1x, // first half (left|top)
			t1y,
			t2x, // second half (right|bottom)
			t2y,
			tw,
			th;

		if (dir == "h") {
			s2x = cx+hnode-hoff;
			s2y = y;
			tw = (hw - hnode) + hoff;
			th = h;
			t1x = cx - tw;
			t1y = y;
			t2x = cx;
			t2y = y;
		} else {
			s2x = x;
			s2y = cy+hnode-hoff;
			tw = w;
			th = (hh - hnode) + hoff;
			t1x = x;
			t1y = cy - th;
			t2x = x;
			t2y = cy;
		}

		t_ctx.clearRect(0, 0, f_cvs.width, f_cvs.height);
		t_ctx.drawImage(f_cvs, x, y, tw, th, t1x, t1y, tw, th);
		t_ctx.drawImage(f_cvs, s2x, s2y, tw, th, t2x, t2y, tw, th);
	};

	var drawImageToCanvas = function(img,x,y,tgt_cvs) {
		if (img) {
			tgt_cvs = tgt_cvs || cvs;
			var tgt_ctx = tgt_cvs.getContext("2d");
			tgt_ctx.drawImage(img,x,y);
		}
	};

	var animateToYonograph = function(yid) {
		var set = yono.data.getAncestorSet(yid,22);
		set.reverse();

		var len = set.length;
		for (var i=0; i<len; i++) {
			setTimeout(function(nsid){
				var nset = yono.data.getAncestorSet(nsid,22);
				yono.canvas.drawYonograph(nset,250,250,$("#"+id_canvas_buffer1)[0]);
				var dir = nset[0].split;
				var easing = [0.4, 0.7, 1.0, 0.9, 1.0];
				var len = easing.length;
				for (var i=0;i<len;i++) {
					var interval = i * 100;
					var amt = easing[i];
					setTimeout(function(i){
						yono.canvas.drawYonographProgression(dir,i);
					},interval,amt);
				}
			},3000*i,set[i].id);
		}
/*
var dir = "v";
		//var set = yono.data.getAncestorSet("073_OED",22); dir = "h";
		var set = yono.data.getAncestorSet("170_AJP",22); dir = "v";
		yono.canvas.drawYonograph(set,250,250,$("#yono_canvas_buffer1")[0]);//yset,x,y,tgt_cvs
		setTimeout(function (){
			//yono.canvas.bufferCanvas();
			var easing = [0.4, 0.7, 1.0, 0.9, 1.0];
			var len = easing.length;
			for (var i=0;i<len;i++) {
				var interval = i * 100;
				var amt = easing[i];
				setTimeout(function(i){
					yono.canvas.drawYonographProgression(dir,i);
					$("#yono_canvas").show();
				},interval,amt);
			}
		},3000);
*/
	};

	p = {
		init:init,
		loadImages:loadImages,
		drawYonograph:drawYonograph,
		bufferCanvas:bufferCanvas,
		drawYonographProgression:drawYonographProgression,
		animateToYonograph:animateToYonograph
	};
	return p;
}());
