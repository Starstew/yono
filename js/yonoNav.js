// data elements
var pHash;
var artists;
var myYonoData;
var artistCount = 0;
var piecesCount = 0;

// nav parameters
var quadSize = 64;
var basePieceSize = 64;
var piecesImagesPath = "pieceImgs/";
var isAnimationEnabled = true;
var aniCollapseEasing = "linear";//"easeOutBounce";
var aniExpandEasing = "linear";//"easeOutBounce";
var isGridSizeLocked = false;
var isShowingPixelEdgeEffects = false;
var randomCrawlLength = 256;
var isSizeRandomized = false;

var maxDepth = 12;
var maxDepthH;
var maxDepthV;

// navigation housekeeping
var lastSeen = 0;
var fieldBgColor = "white";
var currentCenterId;

var yonographDefaultHeight = "600px";

var crawlSequence = new Array();
var crawlIndex = -1;
var crawlInterval;
var crawlDelay;
var crawlDelayMin = 1050;

var expandimationDuration = 1000;
var collapsimationDuration = 1000;
var centeringInterval;

var rows = 0;
var cols = 0;

var lastKeyCode;
var isArrowExpanding = true;

var isQuadClicked = false;

/********
INITIALIZATION 
*********/

/**
Pass object with values to apply for this particular navigation.
Including:
- data
- parameters
*/
function init(iobj) {
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
			updateMaxDepths();
		}		
		if (iobj.hasOwnProperty("yonoData")) {
			myYonoData = iobj.yonoData;
			pHash = myYonoData.pHash;
			artists = myYonoData.artists;
			artistCount = myYonoData.artistCount;
			piecesCount = myYonoData.piecesCount;
			
			// set parameters
			isShowingPixelEdgeEffects = (getURLParam("pixfx") == "1");
			
			// good to go?
			showYonograph(getURLParam("centerId"));
			setCrawlPattern(getURLParam("crawl"), getURLParam("delay"));
		
			setKeyEventHandlers();
		}
		
	}
}

function setKeyEventHandlers() {
	$('body').keyup(function(e) {
  		var kcode = e.keyCode;
		
  		
  		if (kcode == "72") { // 'h'
  			navSplit("h",currentCenterId); // hspread
  			clearInterval(crawlInterval);
  		} else if (kcode == "86") { //  'v'
  			navSplit("v",currentCenterId); 
  			clearInterval(crawlInterval);
		} else if (kcode == "40" || kcode == "83") { // down / 'a'
			if (lastKeyCode == "38" || lastKeyCode == "87") { // opposite (u/'w')
				isArrowExpanding = !isArrowExpanding;
			} else if (lastKeyCode != "40" && lastKeyCode != "83" ) {
				isArrowExpanding = true;
			}
			if (isArrowExpanding) {
				navSplit("v",currentCenterId);
			} else {
				navCollapse("v");
			}
			clearInterval(crawlInterval);
		} else if (kcode == "38" || kcode == "87") { // up / 'w'
			if (lastKeyCode == "40" || lastKeyCode == "83") { // opposite (d/'s')
				isArrowExpanding = !isArrowExpanding;
			} else if (lastKeyCode != "38" && lastKeyCode != "87") {
				isArrowExpanding = true;
			}
			if (isArrowExpanding) {
				navSplit("v",currentCenterId);
			} else {
				navCollapse("v");
			}
			clearInterval(crawlInterval);
		} else if (kcode == "37" || kcode == "68") { // left / 'd'
			if (lastKeyCode == "39" || lastKeyCode == "65") { // opposite ('a')
				isArrowExpanding = !isArrowExpanding;
			} else if (lastKeyCode != "37" && lastKeyCode !="68") {
				isArrowExpanding = true;
			}
			if (isArrowExpanding) {
				navSplit("h",currentCenterId);
			} else {
				navCollapse("h");
			}
			clearInterval(crawlInterval);
		} else if (kcode == "39" || kcode == "65") { // right
			if (lastKeyCode == "37" || lastKeyCode == "68") { // opposite
				isArrowExpanding = !isArrowExpanding;
			} else if (lastKeyCode != "39" && lastKeyCode != "65") {
				isArrowExpanding = true;
			}
			if (isArrowExpanding) {
				navSplit("h",currentCenterId);
			} else {
				navCollapse("h");
			}
			clearInterval(crawlInterval);
  		} else if (kcode == "67") { // 'c'
			navCollapse();
			clearInterval(crawlInterval);
		} else if (kcode == "13") { // 'enter'
			navSplit();
			clearInterval(crawlInterval);
		} else if (kcode == "73") { // 'i'nfinite(ish)
			crawlIndex=-1;
			isSizeRandomized = true;
			randomCrawlLength = 256;
			setCrawlPattern('random',3000,true);
		} else if (kcode == "32") { // 'spacebar'
			clearInterval(crawlInterval);
			crawlIndex=-1;
			setCrawlPattern('random',3000,true);
		} else if (kcode == "49") { // 1
			quadSize = basePieceSize * 0.50;
			showYonograph();
		} else if (kcode == "50") { // 2
			quadSize = basePieceSize;
			showYonograph();
		} else if (kcode == "51") { // 3
			quadSize = basePieceSize * 2.00;
			showYonograph();
		} else if (kcode == "82") { // r
			crawlIndex=-1;
			clearInterval(crawlInterval);
			setCrawlPattern("ccccccccccccc");
		} else {
			return;
		}
  		lastKeyCode = kcode;
	});
}

function setTouchEventHandlers() {
/*
	if (isTouchDevice() == true) {
		AllowScroll(false);
	}
	
	$(document).live('swipeLeft', function() {
		navSplit('h');
	});
	
	$(document).live('swipeRight', function() {
		navCollapse();
	});
	*/
}


/********
DISPLAY YONOGRAPHS 
*********/
function showYonograph(centerId, navType, collapseDir) {
	centerId = getValidCenterId(centerId);
	if (isGridSizeLocked == false) {
		$("#yonograph").css("height",yonographDefaultHeight); // reset height of holder
	}
	currentCenterId = centerId;
	
	makeTheGrid(centerId,navType,collapseDir);
}

function makeTheGrid(centerId, navType, collapseDir) {
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
		//console.log("ERROR: null centerId passed to makeTheGrid() " + centerId + " : " + navType);
		return;
	}
	
	// don't do fancy gridmaking if animation is off
	if (navType != undefined && isAnimationEnabled == false) {
		showYonograph();
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
	updateStats();
	
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
		grid.push(setGridPoint(hd+1, -vd, "ur", pimg, cPc["id"])); // UR
		grid.push(setGridPoint(hd+1, vd+1, "lr", pimg, cPc["id"])); // LR
		grid.push(setGridPoint(-hd, vd+1, "ll", pimg, cPc["id"])); // LL
		grid.push(setGridPoint(-hd, -vd, "ul", pimg, cPc["id"])); // UL
		
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
	
	generateBlankGrid(rows, cols);
	
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
		
		/* COMMENTED OUT 20141102 
			Alignments make horizontal animation look better. 
			Still problems with vertical. * /
		var bp = "0px 0px";
		var qoffset = "-" + quadSize + "px";
		if (gridobj['q'] == "ur") {
			bp = qoffset + " 0px";
		} else if (gridobj['q'] == "lr") {
			bp = qoffset + " " + qoffset;
		} else if (gridobj['q'] == "ll") {
			bp = "0px " + qoffset;
		}
		/* */
		/* */
		var bp = "top left";
		var qoffset = "-" + quadSize + "px";
		if (gridobj['q'] == "ur") {
			bp = "top right"
		} else if (gridobj['q'] == "lr") {
			bp = "bottom right"
		} else if (gridobj['q'] == "ll") {
			bp = "bottom left";
		}
		/* */
		
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
						startCenteringInterval();
						colDiv.animate({width:0}, {duration:cDur, queue:false, easing:aniCollapseEasing, complete:function(){endCenteringInterval();}});
					}
				}
			} else if (collapsePiece['split'] == 'v') {
				var rdiv = $("#row_"+r);
				if (rdiv.height() == quadSize) {
					startCenteringInterval();
					rdiv.animate({height:0},{duration:cDur,queue:false, easing:aniCollapseEasing, complete:function(){endCenteringInterval();}});
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
			
			if (canSplit("h",cdiv.data().pcid)) {
				var hid = "hsplit_"+cdiv.data().pcid+"_"+q;
				cdiv.append("<img id='" + hid + "' src='imgs/hspread.png' style='opacity:0;position:absolute;top:" + topH + "px;left:" + lftH + "px;'/>");
				$("#"+hid).hover(function(){$(this).css("opacity","1.0");$(this).css("cursor","pointer");}, function(){$(this).css("opacity","0.0");$(this).css("cursor","auto");});
				$("#"+hid).css("height",half);
				$("#"+hid).css("width",half);
				$("#"+hid).click(function(){handleSpreadIconClick(this.id);});
			} 
			if (canSplit("v",cdiv.data().pcid)) {
				var vid = "vsplit_"+cdiv.data().pcid+"_"+q;
				cdiv.append("<img id='" + vid + "' src='imgs/vspread.png' style='opacity:0;position:absolute;top:" + topV + "px;left:" + lftV + "px;'/>");
				$("#"+vid).hover(function(){$(this).css("opacity","1.0");$(this).css("cursor","pointer");}, function(){$(this).css("opacity","0.0");$(this).css("cursor","auto");});
				$("#"+vid).css("height",half);
				$("#"+vid).css("width",half);
				$("#"+vid).click(function(){handleSpreadIconClick(this.id);});
			} 
			
			// SPREAD
			var cPc = pHash[currentCenterId];
			if (navType == "v" || navType == "h") { // if navved by spreading, then...
				if (cPc['split'] == 'h') {
					for (var ar = 0; ar < rows; ar++) { // loop through rows to animate col spread
						var colDiv = $("#" + ar + "_" + c);
						if (colDiv.width() == quadSize) {
							colDiv.animate({width:'0px'},0);
							startCenteringInterval();
							colDiv.animate({width:quadSize}, {duration:eDur, queue:false, easing:aniExpandEasing, complete:function(){endCenteringInterval();}});
						}
					}
				} else if (cPc['split'] == 'v') {
					var rdiv = $("#row_"+r);
					if (rdiv.height() == quadSize) {
						rdiv.animate({height:'0px'},0);
						startCenteringInterval();
						rdiv.animate({height:quadSize},{duration:eDur,queue:false, easing:aniExpandEasing, complete:function(){endCenteringInterval();}});
					}	
				} 
			} 
		} else {
			cdiv.animate({width:quadSize,height:quadSize},0);
			cdiv.hover(function(){highlightAllQuads($(this));}, 
			function(){highlightAllQuads($(this),true);});
		}
		
		cdiv.unbind('click');
		cdiv.click(function(e) {
			isQuadClicked = true;
			clearInterval(crawlInterval);
			
			// check if this is the "center", then treat diff
			var pcid = $(this).data().pcid;
			if (pcid == currentCenterId) {
				/* DEPRECATED: Moved to click-on-icon functionality
				var x = e.pageX - this.offsetLeft;
				var y = e.pageY - this.offsetTop;
				
				var q = $(this).data().quad;
				var s = "";
				if (q == "ur") {
					if (x > half && y > half) {
						s = "h";
					} else if (x < half & y < half) {
						s = "v";
					} 
				} else if (q == "lr") {
					if (x > half && y < half) {
						s = "h";
					} else if (x < half & y > half) {
						s = "v";
					} 
				} else if (q == "ll") {
					if (x < half && y < half) {
						s = "h";
					} else if (x > half & y > half) {
						s = "v";
					} 
				} else if (q == "ul") {
					if (x < half && y > half) {
						s = "h";
					} else if (x > half & y < half) {
						s = "v";
					} 
				}
				
				if (s.length > 0) {
					navSplit(s,pcid);
				}
				*/
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
				setCrawlPattern(collapseString,0,true);
		 	}
		 });
	}
	
	updatePieceInfo();
	setTimeout(function() {centerTheGrid();},100); // kludge for race condition(?)
}

function startCenteringInterval() {
	if (centeringInterval != undefined) { return; }
	centeringInterval = setInterval(function(){centerTheGrid();},5);
}

function endCenteringInterval() {
	clearInterval(centeringInterval);
	centeringInterval = undefined;
}

function handleSpreadIconClick(clickdata) {
	isQuadClicked = true;
	clearInterval(crawlInterval);
	
	// data
	var cdarray = clickdata.split("_");
	var splittype = cdarray[0];
	var pcid = cdarray[1] + "_" + cdarray[2];
	var quad = cdarray[3];
	
	if (splittype == "hsplit") {
		navSplit("h",pcid);
	} else {
		navSplit("v",pcid);
	}
}

/********
DISPLAY UI ELEMENTS
*********/
// override for particular views
function updateNavButtons() {
/*
	var nav_o = 1;
	var nav_a = "";
	var nav_off_o = 0.3;
	var navDiv = $("#navButtons");
	navDiv.empty();
	
	nav_o = (canSplit("h",currentCenterId) == true) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navSplit(\"h\");' title='Expand Piece Horizontally'><img src='imgs/nav_h.png'></a>" : "<img src='imgs/nav_h.png'>";
	navDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	nav_o = (canSplit("v",currentCenterId) == true) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navSplit(\"v\");' title='Expand Piece Vertically'><img src='imgs/nav_v.png'></a>" : "<img src='imgs/nav_v.png'>";
	navDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	nav_o = (cPc['parent'] != null && cPc['parent'].length > 0) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navCollapse();' title='Collapse this Piece'><img src='imgs/nav_c.png'></a>" : "<img src='imgs/nav_c.png'>";
	navDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	navDiv.append("<div class='fsdiv' style='background:#eeeeee;margin-right:2px;'><a href='javascript:void(0)' onClick='crawlIndex=-1;setCrawlPattern(\"random\",3000,1);' title='Random Automatic Walk through Yono'><img src='imgs/nav_rnd.png'></a></div>");
*/
}

// override for particular views
function updatePieceInfo() {
	var cPc = pHash[currentCenterId];
	var piDiv = $("#pieceInfo");
	piDiv.empty();
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
	
	piDiv.append("<div class='fsdiv' style='background:#f0f0f0;width:400px;margin-right:2px;'>Center Yonode created by <a href='" + apLink + "'><b>" + aobj.name + "</b></a> on " + dLocale + " [<a href='"+pimg+"' target='new'>I</a>] [<a href='javascript:void(0)' onClick='window.location=\"?centerId=" + currentCenterId + "\"'>LINK</a>]</div>  ");	
	
	// now the "crawlInfo" draggable pane
	var ciDiv = $("#crawlInfo");
	ciDiv.empty();
	ciDiv.css("min-height","64px");
	ciDiv.css("font-size","16px");
	ciDiv.css("width","200px");
	ciDiv.css("text-align","right");
	pimg = "pieceImgs/2x/" + cPc["id"] + ".png";
	var ciImg = "<img src='" + pimg + "' style='width:64px;height:64px;position:absolute;left:6;top:6;border:1px solid white;padding:2px;'/>";
	ciDiv.append("<div style='font-weight:bold;display:inline-block;margin-left:70px;'>" + ciImg +  aobj.name + "</div><br/>" + dLocale);
	
	
	//updateNavButtons();
	/*
	var nav_o = 1;
	var nav_a = "";
	var nav_off_o = 0.3;
	
	nav_o = (canSplit("h",currentCenterId) == true) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navSplit(\"h\");' title='Expand Piece Horizontally'><img src='imgs/nav_h.png'></a>" : "<img src='imgs/nav_h.png'>";
	piDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	nav_o = (canSplit("v",currentCenterId) == true) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navSplit(\"v\");' title='Expand Piece Vertically'><img src='imgs/nav_v.png'></a>" : "<img src='imgs/nav_v.png'>";
	piDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	nav_o = (cPc['parent'] != null && cPc['parent'].length > 0) ? 1 : nav_off_o;
	nav_a = (nav_o == 1) ? "<a href='javaScript:void(0)' onClick='navCollapse();' title='Collapse this Piece'><img src='imgs/nav_c.png'></a>" : "<img src='imgs/nav_c.png'>";
	piDiv.append("<div class='fsDiv' style='background:#ffffff;opacity:" + nav_o + ";'>" + nav_a + "</div>");
	
	piDiv.append("<div class='fsdiv' style='background:#eeeeee;margin-right:2px;'><a href='javascript:void(0)' onClick='crawlIndex=-1;setCrawlPattern(\"random\",3000,1);' title='Random Automatic Walk through Yono'><img src='imgs/nav_rnd.png'></a></div>");
	*/
}

// override this for particular views
function updateStats() {
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
}

function highlightAllQuads(qdiv, doOff) {
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
}

/********
MOVING AROUND
*********/
function navSplit(dir, pcid, isAutoplay) {
	// stop automatic play unless flagged
	if (isAutoplay != true) {
		clearInterval(crawlInterval);
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
	
	if (canSplit(dir,pcid)) {
		if (dir == "h") {
			showYonograph(p.horz,dir);
		} else {
			showYonograph(p.vert,dir);
		}
	}
	
	//animateYonographBackground(dir, false);
}

function navCollapse(isAutoplay) {
	// stop automatic play unless flagged
	if (isAutoplay != true) {
		clearInterval(crawlInterval);
	}
	
	var pcid = currentCenterId;
	var cPc = pHash[pcid];
	
	var parId = pHash[pcid].parent;
	if (parId.length > 0) {
		showYonograph(parId,"c",cPc['split']);
	}
	
	// animate bg
	//animateYonographBackground(cPc['split'], true);
}

function animateYonographBackground(dir, isCollapse) {
	var mod = (isCollapse) ? -1 : 1;
	var y = $("#yonograph");
	var y_x = parseInt(y.css("background-position-x").split("p")[0]);
	var y_y = parseInt(y.css("background-position-y").split("p")[0]);
	var newX = y_x + (mod * 20);
	var newY = y_y + (mod * 20);
	
	// animate background based on dir
	var aniDur = expandimationDuration;
	if (dir == "h") {
		newY = y_y;
	} else if (dir == "v") {
		newX = y_x;
	} else {
		aniDur = collapsimationDuration;
	}
	
	y.animate({
		'background-position-x':newX, 
		'background-position-y':newY
		}, aniDur, 'easeOutElastic');
}

/********
GRID SETUP 
*********/
	function setGridPoint(xoffset, yoffset, quad, img, id) {
		var gpobj = new Object();
		gpobj["x"] = xoffset;
		gpobj["y"] = yoffset;
		gpobj["q"] = quad;
		gpobj["i"] = img;
		gpobj["id"] = id;
		return gpobj;
	}

	function generateBlankGrid(r, c) {
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
	}

/********
CRAWL FUNCTIONS
*********/
	function setCrawlPattern(cp, del, doFirstStepImmediately) {
		if (cp == null) { return; }
		crawlDelay = Math.max(crawlDelayMin,del);
		
		currentCenterId = getValidCenterId(currentCenterId);
		if (cp == "random") {
			crawlDelay = Math.max(2100,del);
			cp = generateRandomCrawl();
		}
		crawlSequence = cp.split("");
		if (doFirstStepImmediately) {
			doNextCrawl();
		}
		crawlInterval = setInterval(function(){doNextCrawl();},crawlDelay);
	}

	function generateRandomCrawl(crawlSize) {
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
	}

	function doNextCrawl() {
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
			clearInterval(crawlInterval);
			return;
		}
		
		// interpret next crawl
		var c = crawlSequence[crawlIndex];
		
		if (c == "h") {
			navSplit("h",currentCenterId,true);
		} else if (c == "v") {
			navSplit("v",currentCenterId,true);
		} else if (c == "c") {
			navCollapse(true);
		}
	}


/********
HELPER STUFF
*********/
function updateMaxDepths() {
	if (isGridSizeLocked) {
		maxDepthH = 7; // TODO really calculate this
		maxDepthV = 7; // TODO really calculate this
	}
}

function getValidCenterId(centerId) {
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
}

function canSplit(dir, pcid) {
	var p = pHash[pcid];
	if (dir == "h" && p.horz.length > 0) {
		return true;
	} else if (dir == "v" && p.vert.length > 0) {
		return true;
	}
	return false;
}

function centerTheGrid() {
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
}

function getURLParam(name) {
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
}

function AllowScroll(flag) {
	if (flag == false) {
		document.ontouchmove = function(e){ e.preventDefault(); } 
	} else {
		document.ontouchmove = function(e){};
	}
}

function AllowZoom(flag) {
  if (flag == true) {
    $('head meta[name=viewport]').remove();
    $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10.0, minimum-scale=1, user-scalable=1" />');
  } else {
    $('head meta[name=viewport]').remove();
    $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0" />');              
  }
}

function isTouchDevice(){
  return (typeof(window.ontouchstart) != 'undefined') ? true : false;
}

