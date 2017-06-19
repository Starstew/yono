yono.canvas = (function(){
	var p = {},
		pieces_path = "./pieceImgs/2X/",
		id_canvas_element = "yono_canvas",
		nodesize = 128,
		images_hash = {},
		cvs, // canvas
		ctx, // context
		images_loaded = {},
		config_stats = {};
		

	var init = function(iobj) {
		id_canvas_element = (iobj && iobj['id_canvas_element']) ? iobj.id_canvas_element : id_canvas_element;

		// init canvas
		cvs = document.getElementById(id_canvas_element);
		ctx = cvs.getContext("2d");
	};

	var loadImages = function(id_array) {
		for (var i=0;i<id_array.length;i++){
			var url = pieces_path + id_array[i] + ".png";
			var img = $("<img data-yid='"+id_array[i]+"' src='" + url + "' data-index='" + i + "'/>");
			img.load(function(){
				/*
				var i = parseInt($(this).data("index")),
					cols = 14,
					x = (i%cols)*70,
					y = Math.floor(i/cols)*70;
				drawImageToCanvas(this,x,y);
				*/
				images_loaded[$(this).data("yid")] = this;
			});
		}
	};

	var getImageFromId = function(id) {
		return images_loaded[id];
	};

	var drawConfiguration = function(yset) {
		var x = 200,
			y = 200,
			nshalf = nodesize*0.5,
			w = nshalf,
			h = nshalf;

		config_stats = {cx:x+nshalf,cy:y+nshalf};

		ctx.clearRect(0, 0, cvs.width, cvs.height);
		for (var i=0;i<yset.length;i++) {
			var yid = yset[i].id;
			var img = getImageFromId(yid);
			
			if (i==0) {
				drawImageToCanvas(img,x,y);
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
				drawImageSplitToCanvas(img,params);
			}
		}

		drawSpreadConfiguration();
	};

	var drawImageSplitToCanvas = function(img,params) {
		// params = x,y,width,height (extents)
		var x = params.x,
			y = params.y,
			w = params.width,
			h = params.height,
			nshalf = nodesize*0.5;

		// make 4 copies, cropped to corners
		ctx.drawImage(img,0,0,nshalf,nshalf,x,y,nshalf,nshalf); 				//nw
		ctx.drawImage(img,nshalf,0,nshalf,nshalf,x+w,y,nshalf,nshalf); 			//ne
		ctx.drawImage(img,nshalf,nshalf,nshalf,nshalf,x+w,y+h,nshalf,nshalf); 	//se
		ctx.drawImage(img,0,nshalf,nshalf,nshalf,x,y+h,nshalf,nshalf); 			//sw

	};

	var drawSpreadConfiguration = function(dir,amt) {
		// copy canvas
		var backCvs = document.createElement('canvas');
		backCvs.width = cvs.width;
		backCvs.height = cvs.height;
		var backCtx = backCvs.getContext('2d');
		backCtx.drawImage(cvs, 0,0);

		// calculate coordinates
		var axtents = {},
			bxtents = {};

		dir = dir || "v";
		amt = amt || 32;
		if (dir == "h") {
			axtents = {x:0, y:0, w:config_stats.cx, h:backCvs.height, tx:(-1*amt), ty:0};
			bxtents = {x:axtents.x+axtents.w, y:axtents.y, w:axtents.w, h:axtents.h, tx:axtents.x+axtents.w+amt, ty:axtents.ty};
		} else if (dir == "v") {
			axtents = {x:0, y:0, w:backCvs.width, h:config_stats.cy, tx:0, ty:(-1*amt)};
			bxtents = {x:axtents.x, y:axtents.y+axtents.h, w:axtents.w, h:axtents.h, tx:axtents.x, ty:axtents.y+axtents.h+amt};
		}

		console.log([axtents,bxtents]);
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		ctx.drawImage(backCvs, axtents.x, axtents.y, axtents.w, axtents.h, axtents.tx, axtents.ty, axtents.w, axtents.h);
		ctx.drawImage(backCvs, bxtents.x, bxtents.y, bxtents.w, bxtents.h, bxtents.tx, bxtents.ty, bxtents.w, bxtents.h);
	};

	var drawImageToCanvas = function(img,x,y) {
		if (img) {
			ctx.drawImage(img,x,y);
		}
	};

	p = {
		init:init,
		loadImages:loadImages,
		drawConfiguration:drawConfiguration
	};
	return p;
}());
