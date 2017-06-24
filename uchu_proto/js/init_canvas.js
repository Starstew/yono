/* init canvas */
$(function(){
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment

	// ui
	$(".nav_expand_horz").on("click", function(){
		yono.canvas.expandCurrentYonode();
		updateUiState();
	});
	$(".nav_expand_vert").on("click", function(){
		yono.canvas.expandCurrentYonode(true);
		updateUiState();
	});
	$(".nav_collapse").on("click", function(){
		yono.canvas.collapseCurrentYonode();
		updateUiState();
	});
	$("#yono_canvas").on("click", function(e){
		handleCanvasMouse(e);
	});
	$("#yono_canvas").on("mousemove", function(e){
		handleCanvasMouse(e);
	});
});
yono.data.jsonDataLoadComplete = function() {
	var pst = yono.data.getPiecesSortedBySubtime();
	var img_arr = [];
	for (var i=0;i<pst.length;i++) {
		img_arr.push(pst[i]);
	}
	yono.canvas.init({"pieces_set":"2X"});
	yono.canvas.loadImages(img_arr);
	setTimeout(function(){
		var params = {yid:"045_OED",depth:2,speed:1000};
		yono.canvas.drawYonograph(yono.data.getAncestorSet("045_OED",100));
		yono.canvas.setNavStateYonoId("045_OED");
		updateUiState();
	},500);
};
var updateUiState = function(){
	var ns = yono.canvas.getNavState();
	var col = ns.is_collapsible,
		evt = ns.is_expandable_vert,
		ehz = ns.is_expandable_horz;
	$(".nav_collapse").prop("disabled",!col);
	$(".nav_expand_vert").prop("disabled",!evt);
	$(".nav_expand_horz").prop("disabled",!ehz);
};
var isInBox = function (tbx, pt) {
	return(pt.x > tbx.x && pt.x < tbx.x + tbx.w && pt.y > tbx.y && pt.y < tbx.y + tbx.h);
};
var handleCanvasMouse= function(e) {
	var c = $(e.currentTarget)[0],
		hw = c.width/2, //half width
		hh = c.height/2, //half height
		ha = 20, // half area
		ns = yono.canvas.getNavState(),
		nodehalf = ns.nodesize / 2;

	var lbx = {x:hw-nodehalf-ha,y:hh-ha,w:ha*2,h:ha*2};
	var tbx = {x:hw-ha,y:hh-nodehalf-ha,w:ha*2,h:ha*2};
	var bbx = {x:hw-ha,y:hh+nodehalf-ha,w:ha*2,h:ha*2};
	var rbx = {x:hw+nodehalf-ha,y:hh-ha,w:ha*2,h:ha*2};
	var pt = {x:e.offsetX,y:e.offsetY};
	var is_hexpand = isInBox(lbx,pt) || isInBox(rbx,pt);
	var is_vexpand = isInBox(tbx,pt) || isInBox(bbx,pt);
	
	if (e.type == "click") {
		if (is_hexpand) {
			yono.canvas.expandCurrentYonode();
		} else if (is_vexpand) {
			yono.canvas.expandCurrentYonode(true);
		} else {
			yono.canvas.collapseCurrentYonode();
		}
	} else if (e.type = "mousemove") {
		if (is_hexpand && ns.is_expandable_horz) {
			$(c).css("cursor","ew-resize");
		} else if (is_vexpand && ns.is_expandable_vert) {
			$(c).css("cursor","ns-resize");
		} else {
			$(c).css("cursor","default");
		}
	}
	
};