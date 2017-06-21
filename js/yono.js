var yono = (function(){
	// private vars
	var p = {},
		pHash,
		artists,
		myYonoData,
		artistCount = 0,
		piecesCount = 0,
		// nav params
		quadSize = 64,
		basePieceSize = 64,
		piecesImagesPath = "pieceImgs/",
		isAnimationEnabled = true,
		aniCollapseEasing = "linear",
		aniExpandEasing = "linear",
		isGridSizeLocked = false,
		isShowingPixelEdgeEffects,
		randomCrawlLength = 256,
		isSizeRandomized = false,
		maxDepth = 12,
		maxDepthH,
		maxDepthV,
		// navigation housekeeping
		lastSeen = 0,
		fieldBgColor = "white",
		currentCenterId,

		yonographDefaultHeight = "600px",
		crawlSequence = [],
		crawlIndex = -1,
		crawlInterval,
		crawlDelay,
		crawlDelayMin = 1050,

		expandimationDuration = 1000,
		collapsimationDuration = 1000,
		centeringInterval,
		
		rows = 0,
		cols = 0,

		lastKeyCode,
		isArrowExpanding = true,

		isQuadClicked = false;

	/**
	Pass object with values to apply for this particular navigation.
	Including:
	- data
	- parameters
	*/
	p.init = function(iobj) {
		if (iobj) {
			if (iobj.hasOwnProperty("basePieceSize")) {
				basePieceSize = parseInt(iobj.basePieceSize);
				quadSize = basePieceSize;
			}
			
			if (iobj.hasOwnProperty("maxDepth")) {
				maxDepth = parseInt(iobj.maxDepth);
			}
			
			if (iobj.hasOwnProperty("quadSize")) {
				quadSize = parseInt(iobj.quadSize);
			}

			if (iobj.hasOwnProperty("isGridSizeLocked")) {
				isGridSizeLocked = iobj.isGridSizeLocked;
				this.updateMaxDepths();
			}

			if (iobj.hasOwnProperty("uchuData")) {
				myYonoData = iobj.uchuData;
				pHash = myYonoData.pHash;
				artists = myYonoData.artists;
				artistCount = myYonoData.artistCount;
				piecesCount = myYonoData.piecesCount;
				
				// set parameters
				isShowingPixelEdgeEffects = (this.getURLParam("pixfx") == "1");
				
				// good to go?
				this.showYonograph(this.getURLParam("centerId"));
				this.setCrawlPattern(this.getURLParam("crawl"), this.getURLParam("delay"));
			
				this.setKeyEventHandlers();
			}
		}
	};

	p.setKeyEventHandlers = function() {
		var self = this;
		$('body').keyup(function(e) {
			var kcode = e.keyCode;

			if (kcode == "72") { // 'h'
				self.navSplit("h",currentCenterId); // hspread
				this.toggleRandomCrawl(false);
			} else if (kcode == "86") { //  'v'
				self.navSplit("v",currentCenterId); 
				this.toggleRandomCrawl(false);
			} else if (kcode == "40" || kcode == "83") { // down / 'a'
				if (lastKeyCode == "38" || lastKeyCode == "87") { // opposite (u/'w')
					isArrowExpanding = !isArrowExpanding;
				} else if (lastKeyCode != "40" && lastKeyCode != "83" ) {
					isArrowExpanding = true;
				}
				if (isArrowExpanding) {
					self.navSplit("v",currentCenterId);
				} else {
					self.navCollapse("v");
				}
				this.toggleRandomCrawl(false);
			} else if (kcode == "38" || kcode == "87") { // up / 'w'
				if (lastKeyCode == "40" || lastKeyCode == "83") { // opposite (d/'s')
					isArrowExpanding = !isArrowExpanding;
				} else if (lastKeyCode != "38" && lastKeyCode != "87") {
					isArrowExpanding = true;
				}
				if (isArrowExpanding) {
					self.navSplit("v",currentCenterId);
				} else {
					self.navCollapse("v");
				}
				this.toggleRandomCrawl(false);
			} else if (kcode == "37" || kcode == "68") { // left / 'd'
				if (lastKeyCode == "39" || lastKeyCode == "65") { // opposite ('a')
					isArrowExpanding = !isArrowExpanding;
				} else if (lastKeyCode != "37" && lastKeyCode !="68") {
					isArrowExpanding = true;
				}
				if (isArrowExpanding) {
					self.navSplit("h",currentCenterId);
				} else {
					self.navCollapse("h");
				}
				this.toggleRandomCrawl(false);
			} else if (kcode == "39" || kcode == "65") { // right
				if (lastKeyCode == "37" || lastKeyCode == "68") { // opposite
					isArrowExpanding = !isArrowExpanding;
				} else if (lastKeyCode != "39" && lastKeyCode != "65") {
					isArrowExpanding = true;
				}
				if (isArrowExpanding) {
					self.navSplit("h",currentCenterId);
				} else {
					self.navCollapse("h");
				}
				this.toggleRandomCrawl(false);
	  		} else if (kcode == "67") { // 'c'
				self.navCollapse();
				this.toggleRandomCrawl(false);
			} else if (kcode == "13") { // 'enter'
				self.navSplit();
				this.toggleRandomCrawl(false);
			} else if (kcode == "73") { // 'i'nfinite(ish)
				crawlIndex=-1;
				isSizeRandomized = true;
				randomCrawlLength = 256;
				self.setCrawlPattern('random',3000,true);
			} else if (kcode == "32") { // 'spacebar'
				this.toggleRandomCrawl(false);
				crawlIndex=-1;
				self.setCrawlPattern('random',3000,true);
			} else if (kcode == "49") { // 1
				quadSize = basePieceSize * 0.50;
				self.showYonograph();
			} else if (kcode == "50") { // 2
				quadSize = basePieceSize;
				self.showYonograph();
			} else if (kcode == "51") { // 3
				quadSize = basePieceSize * 2.00;
				self.showYonograph();
			} else if (kcode == "82") { // r
				crawlIndex=-1;
				this.toggleRandomCrawl(false);
				self.setCrawlPattern("ccccccccccccc");
			} else {
				return;
			}
			lastKeyCode = kcode;
		});
	};

	p.showYonograph = function(centerId, navType, collapseDir) {
		centerId = this.getValidCenterId(centerId);
		if (isGridSizeLocked === false) {
			$("#yonograph").css("height",yonographDefaultHeight); // reset height of holder
		}
		currentCenterId = centerId;
		
		this.makeTheGrid(centerId,navType,collapseDir);
	};

	p.makeTheGrid = function(centerId, navType, collapseDir) {
		// make the grid
		var grid = new Array();
		var hd = 0; // horizontal depth
		var vd = 0; // vertical depth
		var cdepth = 0; // current total depth
		
		// handle environmentals
		var cDur = collapsimationDuration;
		var eDur = expandimationDuration;
		
		var cPc = pHash[centerId];
		
		if (cPc == null) {
			return;
		}
		
		// don't do fancy gridmaking if animation is off
		if (navType != undefined && isAnimationEnabled == false) {
			this.showYonograph();
			return;
		}
		
		// if collapsing, get the piece being collapsed
		var collapsePiece;
		var collapsePieceId;
		if (collapseDir && collapseDir.length > 0) {
			cdepth = -1;
			if (collapseDir == "v") {
				collapsePieceId = cPc['vert'];
			} else {
				collapsePieceId = cPc['horz'];
			}
			collapsePiece = pHash[collapsePieceId];
			if (collapsePiece == null) {
				return;
			}
		}
		
		// set the global "current center"
		currentCenterId = centerId;
		
		// mark as seen
		cPc['seen'] = (1 == 1);
		this.updateStats();
		
		// go until we have no parent or reach max depth
		
		var isLastParent = false;
		if (collapsePiece) { cPc = collapsePiece; }
		var imgs_dir = piecesImagesPath;
		if (quadSize > (basePieceSize * 0.5) && quadSize <= basePieceSize) {
			imgs_dir = piecesImagesPath + "2x/";
		} else if (quadSize > basePieceSize) {
			imgs_dir = piecesImagesPath + "4x/";
		}
		
		while (isLastParent == false && cdepth < maxDepth) {
			// set the image
			var pimg = imgs_dir + cPc["id"] + ".png";
			if (cPc["ip"]) {
				pimg = imgs_dir+"_inprogress.png";
			}
			
			// add the grid points
			grid.push(this.setGridPoint(hd+1, -vd, "ur", pimg, cPc["id"])); // UR
			grid.push(this.setGridPoint(hd+1, vd+1, "lr", pimg, cPc["id"])); // LR
			grid.push(this.setGridPoint(-hd, vd+1, "ll", pimg, cPc["id"])); // LL
			grid.push(this.setGridPoint(-hd, -vd, "ul", pimg, cPc["id"])); // UL
			
			// tally the correct depth
			if (cPc["split"] == "h") {
				hd += 1;
			} else {
				vd += 1;
			}
			
			// increase displayed depth count
			cdepth += 1;
			
			// move to parent unless this is last
			if (cPc["parent"].length > 0) {
				cPc = pHash[cPc["parent"]]; // move on to parent
				
				// check if we'd be over the h or v max depth by continuing
				if (maxDepthH && cPc["split"] == "h" && (hd > maxDepthH)) {
					isLastParent = true;
					continue;
				} else if (maxDepthV && cPc["split"] == "v" && (vd > maxDepthV)) {
					isLastParent = true;
					continue;
				}
				
			} else {
				isLastParent = true;
			}
		}

		var cols = (hd + 1) * 2;
		var rows = (vd + 1) * 2;
		
		this.generateBlankGrid(rows, cols);
		
		// determine scale of bg effect
		var scale = (quadSize*2)/basePieceSize;
		var bgfx;
		if (scale == 2) {
			bgfx = "../imgs/tile_2x2shadow.png";
		} else if (scale == 4) {
			bgfx = "../imgs/tile_4x4shadow.png";
		}
		if (isShowingPixelEdgeEffects) {

			if (bgfx) {
				bgfx = "<img src='"+bgfx+"' style='opacity:0.1;'/>"
			}
		}
		
		// fill the grid with content
		var mr = (rows/2)-1;
		var mc = (cols/2)-1;
		for (var i = 0; i < grid.length; i++) {
			var gridobj = grid[i];
			var y = gridobj["y"];
			var x = gridobj["x"];
			var r = y + mr;
			var c = x + mc;
			var coord = (r + "_" + c);
			
			var bp = "top left";
			var qoffset = "-" + quadSize + "px";
			if (gridobj['q'] == "ur") {
				bp = "top right"
			} else if (gridobj['q'] == "lr") {
				bp = "bottom right"
			} else if (gridobj['q'] == "ll") {
				bp = "bottom left";
			}
			
			var cdiv = $("#"+coord);
			
			// set the image position
			cdiv.css("background","url("+gridobj['i']+")");
			cdiv.css("background-repeat","no-repeat");
			cdiv.css("background-position",bp);
			cdiv.css("background-size", quadSize*2 + "px " + quadSize*2 + "px");
			cdiv.css("position","relative");
			cdiv.data("pcid",gridobj["id"]);
			cdiv.data("quad",gridobj["q"]);
			
			if (isShowingPixelEdgeEffects) {
				cdiv.append(bgfx);
			}
			
			var half = quadSize * 0.5;
			
			if (cdiv == null || cdiv == undefined || cdiv.data() == null || cdiv.data() == undefined || !cdiv.data().hasOwnProperty("pcid")) {
				setTimeout(function(){showYonograph();},1500);
				return;
			}

			// collapsing piece handler
			if (cdiv.data().pcid == collapsePieceId) {
				if (collapsePiece['split'] == 'h') {
					for (var ar = 0; ar < rows; ar++) { // loop through rows to animate col collapse
						var colDiv = $("#" + ar + "_" + c);
						if (colDiv.width() == quadSize) {
							this.startCenteringInterval();
							var self = this;
							colDiv.animate({width:0}, {duration:cDur, queue:false, easing:aniCollapseEasing, complete:function(){self.endCenteringInterval();}});
						}
					}
				} else if (collapsePiece['split'] == 'v') {
					var rdiv = $("#row_"+r);
					if (rdiv.height() == quadSize) {
						this.startCenteringInterval();
						var self = this;
						rdiv.animate({height:0},{duration:cDur,queue:false, easing:aniCollapseEasing, complete:function(){self.endCenteringInterval();}});
					}	
				} 

			} else if (cdiv.data().pcid == currentCenterId) { // current center handler
				var topH = 0;
				var lftH = 0;
				var topV = 0;
				var lftV = 0;
				
				var q = gridobj['q'];
				if (q == "ur" || q == "ul") {
					topV = 0;
					topH = half;
					if (q == "ur") {
						lftH = half;
						lftV = 0;
					} else {
						lftH = 0;
						lftV = half;
					}
				} 
				if (q == "lr" || q == "ll") {
					topV = half;
					topH = 0;
					if (q=="lr") {
						lftH = half;
						lftV = 0;
					} else {
						lftH = 0;
						lftV = half;
					}
				}
				
				if (this.canSplit("h",cdiv.data().pcid)) {
					var hid = "hsplit_"+cdiv.data().pcid+"_"+q;
					cdiv.append("<img id='" + hid + "' src='imgs/hspread.png' style='opacity:0;position:absolute;top:" + topH + "px;left:" + lftH + "px;'/>");
					$("#"+hid).hover(function(){$(this).css("opacity","1.0");$(this).css("cursor","pointer");}, function(){$(this).css("opacity","0.0");$(this).css("cursor","auto");});
					$("#"+hid).css("height",half);
					$("#"+hid).css("width",half);
					var self = this;
					$("#"+hid).click(function(){self.handleSpreadIconClick(this.id);});
				} 
				if (this.canSplit("v",cdiv.data().pcid)) {
					var vid = "vsplit_"+cdiv.data().pcid+"_"+q;
					cdiv.append("<img id='" + vid + "' src='imgs/vspread.png' style='opacity:0;position:absolute;top:" + topV + "px;left:" + lftV + "px;'/>");
					$("#"+vid).hover(function(){$(this).css("opacity","1.0");$(this).css("cursor","pointer");}, function(){$(this).css("opacity","0.0");$(this).css("cursor","auto");});
					$("#"+vid).css("height",half);
					$("#"+vid).css("width",half);
					var self = this;
					$("#"+vid).click(function(){self.handleSpreadIconClick(this.id);});
				} 
				
				// SPREAD
				var cPc = pHash[currentCenterId];
				if (navType == "v" || navType == "h") { // if navved by spreading, then...
					if (cPc['split'] == 'h') {
						for (var ar = 0; ar < rows; ar++) { // loop through rows to animate col spread
							var colDiv = $("#" + ar + "_" + c);
							if (colDiv.width() == quadSize) {
								colDiv.animate({width:'0px'},0);
								this.startCenteringInterval();
								var self = this;
								colDiv.animate({width:quadSize}, {duration:eDur, queue:false, easing:aniExpandEasing, complete:function(){self.endCenteringInterval();}});
							}
						}
					} else if (cPc['split'] == 'v') {
						var rdiv = $("#row_"+r);
						if (rdiv.height() == quadSize) {
							rdiv.animate({height:'0px'},0);
							this.startCenteringInterval();
							var self = this;
							rdiv.animate({height:quadSize},{duration:eDur,queue:false, easing:aniExpandEasing, complete:function(){self.endCenteringInterval();}});
						}	
					} 
				} 
			} else {
				var self = this;
				cdiv.animate({width:quadSize,height:quadSize},0);
				cdiv.hover(function(){self.highlightAllQuads($(this));}, 
				function(){self.highlightAllQuads($(this),true);});
			}
			
			cdiv.unbind('click');
			var self = this;
			cdiv.click(function(e) {
				isQuadClicked = true;
				self.toggleRandomCrawl(false);
				
				// check if this is the "center", then treat diff
				var pcid = $(this).data().pcid;
				if (pcid == currentCenterId) {
					
				} else {
					// calculate distance from "currentCenterId" to clicked pcid
					var dist = 0;
					// go until we have no parent
					var targetReached = false;
					var crawlPc = pHash[currentCenterId];
					while (targetReached == false) {
						if (crawlPc['id'] == pcid) {
							targetReached = true;
						} else {
							dist += 1;
						}
						crawlPc = pHash[crawlPc['parent']];
					}
					var collapseString = "";
					for (var nc = 0; nc < dist; nc++) {
						collapseString += "c";
					}
					crawlIndex = -1;
					self.setCrawlPattern(collapseString,0,true);
			 	}
			});
		}
		
		this.updatePieceInfo();
		var self = this;
		setTimeout(function() {self.centerTheGrid();},100); // kludge for race condition(?)
	};

	p.startCenteringInterval = function() {
		if (centeringInterval != undefined) { return; }
		var self = this;
		centeringInterval = setInterval(function(){self.centerTheGrid();},5);
	};

	p.endCenteringInterval = function() {
		clearInterval(centeringInterval);
		centeringInterval = undefined;
	};

	p.handleSpreadIconClick = function(clickdata) {
		isQuadClicked = true;
		this.toggleRandomCrawl(false);
		
		// data
		var cdarray = clickdata.split("_");
		var splittype = cdarray[0];
		var pcid = cdarray[1] + "_" + cdarray[2];
		var quad = cdarray[3];
		
		if (splittype == "hsplit") {
			this.navSplit("h",pcid);
		} else {
			this.navSplit("v",pcid);
		}
	};

	/** UI STUFF **/
	p.updatePieceInfo = function() {
		var cPc = pHash[currentCenterId];
		var piDiv = $("#pieceinfo");
		var pimg = piecesImagesPath + cPc["id"] + ".png";
		if (cPc["ip"]) {
			pimg = piecesImagesPath + "_inprogress.png";
		}
		var aobj = artists[cPc["artist"]];
		if (aobj == undefined) {
			window.location = "./";
		}
		
		var di = parseInt(cPc['subtime']);
		var d = new Date(di*1000);
		var dLocale = (d > 0) ? d.toDateString() : "";
		var dLocale = (d > 0) ? (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() : "";
		var apLink = "articipants.html?artistId="+cPc['artist'];
		
		piDiv.find(".pi_artist_name_link").empty().append("<a href='" + apLink + "'>" + aobj.name  + "</a>");
		piDiv.find(".pi_datetime").empty().append(dLocale);
		piDiv.find(".pi_image_link").empty().append("<a href='"+pimg+"' target='new'>I</a>");
		piDiv.find(".pi_viewer_link").empty().append("<a href='?centerId=" + currentCenterId + "'>LINK</a>");

		// now the "crawlInfo" draggable pane
		var ciDiv = $("#crawlInfo");
		ciDiv.empty();
		pimg = "pieceImgs/2x/" + cPc["id"] + ".png";
		var ciImg = "<img src='" + pimg + "'/>";
		ciDiv.append("<div class='img_and_artist_holder'>" + ciImg +  aobj.name + "</div><br/>" + dLocale);
	};

	p.updateStats = function() {
		var seen = 0;
		for (var o in pHash) {
			if (pHash[o].hasOwnProperty("seen") && pHash[o].seen) {
				seen++;
			}
		}
		
		var sdiv = $("#yonostats");
		sdiv.empty();
		sdiv.append("You've seen <b>" + seen + "</b> of <b>" + piecesCount + "</b> Yono pieces by <i>"+artistCount+"</i> artists.");
		
		if (seen > lastSeen) {
			lastSeen = seen;
			sdiv.css('background','#000000');
			sdiv.animate({backgroundColor:'#ffffff'},500);
		}
	};

	p.highlightAllQuads = function(qdiv, doOff) {
		var jqDiv = $(qdiv)
		var pcid = jqDiv.data().pcid;
		
		$('div').each(
			function() {
				if ($(this).data('pcid') === pcid) {
					var cell = $(this);
					if (doOff == true) {
						cell.css("cursor","auto");
						cell.css("opacity","1");
					} else {
						cell.css("cursor","pointer");
						cell.css("opacity","0.8");
					}
				}
			}
		);
	};

	/** MOVING AROUND **/
	p.navSplit = function(dir, pcid, isAutoplay) {
		// stop automatic play unless flagged
		if (isAutoplay != true) {
			this.toggleRandomCrawl(false);
		}
		
		if (pcid == null) {
			pcid = currentCenterId;
		}
		var p = pHash[pcid];
		
		// pick a direction if none supplied
		if (dir == null) {
			var opts = [];
			if (p['horz'] && p['horz'].length > 0) {
				opts.push("h");
			}
			if (p['vert'] && p['vert'].length > 0) {
				opts.push("v");
			}
			if (p['parent'] && p['parent'].length > 0) {
				opts.push("c");
			}

			dir = opts[Math.floor(Math.random()*opts.length)];
			if (opts.length == 0 || dir == 'c') {
				navCollapse();
				return;
			}
		}
		
		if (this.canSplit(dir,pcid)) {
			if (dir == "h") {
				this.showYonograph(p.horz,dir);
			} else {
				this.showYonograph(p.vert,dir);
			}
		}
	};

	p.navCollapse = function(isAutoplay) {
		// stop automatic play unless flagged
		if (isAutoplay != true) {
			this.toggleRandomCrawl(false);
		}
		
		var pcid = currentCenterId;
		var cPc = pHash[pcid];
		
		var parId = pHash[pcid].parent;
		if (parId.length > 0) {
			this.showYonograph(parId,"c",cPc['split']);
		}
	};

	/** GRID SETUP **/
	p.setGridPoint = function(xoffset, yoffset, quad, img, id) {
		var gpobj = new Object();
		gpobj["x"] = xoffset;
		gpobj["y"] = yoffset;
		gpobj["q"] = quad;
		gpobj["i"] = img;
		gpobj["id"] = id;
		return gpobj;
	};

	p.generateBlankGrid = function(r, c) {
		rows = r;
		cols = c;
		$("#grid").empty();
		var rw = cols * quadSize;
		for (var r = 0; r < rows; r++) {
			$("#grid").append("<div id='row_" + r + "' style='width:" + rw + ";'></div>");
			var rowdiv = $("#row_"+r);
			for (var c = 0; c < cols; c++) {
				rowdiv.append("<div id='" + r + "_" + c + "' class='gridcell' style='width:"+quadSize+"px; height:"+quadSize+"px;'> </div>");
			}
		}
		$("#grid").width(rw);
	};

	/** CRAWL FUNCTIONS **/
	p.setCrawlPattern = function(cp, del, doFirstStepImmediately) {
		if (cp == null) { return; }
		crawlDelay = Math.max(crawlDelayMin,del);
		
		currentCenterId = this.getValidCenterId(currentCenterId);
		if (cp == "random") {
			crawlDelay = Math.max(2170,del);
			cp = this.generateRandomCrawl();
		}
		crawlSequence = cp.split("");
		if (doFirstStepImmediately) {
			this.doNextCrawl();
		}
		var self = this;
		crawlInterval = setInterval(function(){self.doNextCrawl();},crawlDelay);
	};

	p.toggleRandomCrawl = function(forced_val) {
		if (crawlInterval || forced_val == false) {
			clearInterval(crawlInterval);
			crawlInterval = null;
		} else {
			p.setCrawlPattern("random", 2170, true);
		}
		return(crawlInterval != null);
	};

	p.generateRandomCrawl = function(crawlSize) {
		var cp = "";
		var cPc = pHash[currentCenterId];
		
		var seenTracker = new Object();
		seenTracker[cPc["id"]] = 1;
		
		crawlSize = (crawlSize) ? parseInt(crawlSize) : randomCrawlLength;
		
		// reset lastSeen for all yonodes
		for (var i in pHash) {
			pHash[i]["lastSeen"] = -1;
		}
		
		cPc["lastSeen"] = 0;
		for (var i = 0; i < crawlSize; i++) {
			var opts = [];
			var par = cPc['parent'];
			var hor = cPc['horz'];
			var ver = cPc['vert'];
			
			// set up choices
			if (par != null && par.length > 0) {
				opts.push({"dir":"c", "yid":par});
			} 
			if (hor != null && hor.length > 0) {
				if (pHash[hor] && pHash[hor].ip == false) {
					opts.push({"dir":"h", "yid":hor});
				}	
			}
			if (ver != null && ver.length > 0) {
				if (pHash[ver] && pHash[ver].ip == false) {
					opts.push({"dir":"v", "yid":ver});
				}
			}
			
			// choose one we've seen least recently
			opts.sort(function() { return 0.5 - Math.random() }); //shuffle options
			opts.sort(function(a,b) { // sort by reverse recentness
				var ya = pHash[a.yid];
				var yb = pHash[b.yid];
				return(ya.lastSeen - yb.lastSeen);
			});
			action = opts[0].dir;

			// assign current piece for loop
			if (action == "h") { cPc = pHash[hor]; } 
			else if (action == "v") { cPc = pHash[ver]; }
			else if (action == "c") { cPc = pHash[par]; }
		
			cPc['lastSeen'] = i;
			cp += action;
		}
		return cp;
	};

	p.doNextCrawl = function() {
		if (isSizeRandomized) {
			if (Math.random() < 0.25) {
				if (quadSize == (basePieceSize * 0.5)) {
					quadSize = basePieceSize;
				} else if (quadSize == basePieceSize) {
					quadSize = (Math.random() > 0.5) ? basePieceSize * 0.5 : basePieceSize * 2;
				} else {
					quadSize = basePieceSize;
				}
			}
		}

		crawlIndex += 1;
		if (crawlIndex > crawlSequence.length - 1) {
			this.toggleRandomCrawl(false);
			return;
		}
		
		// interpret next crawl
		var c = crawlSequence[crawlIndex];
		
		if (c == "h") {
			this.navSplit("h",currentCenterId,true);
		} else if (c == "v") {
			this.navSplit("v",currentCenterId,true);
		} else if (c == "c") {
			this.navCollapse(true);
		}
	};

	/** HELPER STUFF **/
	p.updateMaxDepths = function() {
		if (isGridSizeLocked) {
			maxDepthH = 7; // TODO really calculate this
			maxDepthV = 7; // TODO really calculate this
		}
	};

	p.getValidCenterId = function(centerId) {
		if (pHash.hasOwnProperty(centerId) == false || centerId == null) {
			if (pHash.hasOwnProperty(currentCenterId)) {
				centerId = currentCenterId;
			} else {
				// choose one at random
				var pcsTemp = Object.keys(pHash);
				centerId = pcsTemp[Math.floor(Math.random()*pcsTemp.length)];
				if (centerId.length < 1) {
					centerId = "000_AJP"; // default
				} 
			}
		}
		return centerId;
	};

	p.canSplit = function(dir, pcid) {
		var p = pHash[pcid];
		if (dir == "h" && p.horz.length > 0) {
			return true;
		} else if (dir == "v" && p.vert.length > 0) {
			return true;
		}
		return false;
	};

	p.centerTheGrid = function() {
		// survey actual width of cells
		var r = 0;
		var actualWidth = 0;	
		for (var c = 0; c < cols; c++) {
			var cdiv = $("#" + r + "_" + c);
			actualWidth += parseFloat(cdiv.css("width").split("p")[0]);
		}

		// center the grid
		var gph = $("#grid").parent().height();
		var gpw = $("#grid").parent().width();
		
		var gridh = $("#grid").height();
		var gridw = actualWidth;
		
		// vertical
		if (gridh > gph && isGridSizeLocked == false) {
			gph = gridh;
			$("#grid").parent().height(gph);
		}	
		var topmargin = (gph - gridh) * 0.5;
		$("#grid").css("margin-top",topmargin);
		
		// horizontal
		if (gridw > gpw && isGridSizeLocked == false) {
			gpw = gridw;
			$("#grid").parent().width(gpw);
		}
		
		var leftmargin = (gpw - gridw) * 0.5;
		$("#grid").css("margin-left",leftmargin);
	};

	p.getURLParam = function(name) {
		// get query string part of url into its own variable
		var url = window.location.href;
		var query_string = url.split("?");
		
		if (query_string.length < 2) {
		return;
		}
		
		// make array of all name/value pairs in query string
		var params = query_string[1].split("&");
		
		// loop through the parameters
		var i = 0;
		while (i < params.length) {
			// compare param name against arg passed in
			var param_item = params[i].split("=");
			if (param_item[0] == name) {
				// if they match, return the value
				return param_item[1];
			}
			i++;
		}
		return "";
	};

	p.AllowScroll = function(flag) {
		if (flag == false) {
			document.ontouchmove = function(e){ e.preventDefault(); } 
		} else {
			document.ontouchmove = function(e){};
		}
	};

	p.AllowZoom = function(flag) {
		if (flag == true) {
			$('head meta[name=viewport]').remove();
			$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10.0, minimum-scale=1, user-scalable=1" />');
		} else {
			$('head meta[name=viewport]').remove();
			$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0" />');              
		}
	};

	/** DISPLAY HELPERS **/
	p.displayChangeSize = function(s) {
		quadSize = s;
		this.showYonograph();
	}

	p.toggleAnimationEnabled = function(is_enabled) {
		isAnimationEnabled = is_enabled || !isAnimationEnabled;
		return isAnimationEnabled;
	};

	p.toggleShowingPixelEdgeEffects = function(is_enabled) {
		isShowingPixelEdgeEffects = is_enabled || !isShowingPixelEdgeEffects;
		return isShowingPixelEdgeEffects;
	};

	return p;
}());
