/* init canvas */
$(function(){
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment

	// ui
	$(".nav_expand_horz").on("click", function(){
		yono.canvas.expandCurrentYonode();
	});
	$(".nav_expand_vert").on("click", function(){
		yono.canvas.expandCurrentYonode(true);
	});
	$(".nav_collapse").on("click", function(){
		yono.canvas.collapseCurrentYonode();
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
		//yono.canvas.expandToYonograph(params);
		yono.canvas.drawYonograph(yono.data.getAncestorSet("045_OED",100));
		yono.canvas.setNavStateYonoId("045_OED");
	},500);
};