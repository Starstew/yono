/* init canvas */
$(function(){
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
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
		yono.canvas.expandToYonograph(params);
	},500);
};