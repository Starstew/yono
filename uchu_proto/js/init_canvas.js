/* init canvas */
$(function(){
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
	yono.canvas.init();
});
yono.data.jsonDataLoadComplete = function() {
	var pst = yono.data.getPiecesSortedBySubtime();
	var img_arr = [];
	for (var i=0;i<pst.length;i++) {
		img_arr.push(pst[i]);
	}
	yono.canvas.loadImages(img_arr);
	setTimeout(function(){
		var set = yono.data.getAncestorSet("170_AJP",22);
		yono.canvas.drawConfiguration(set);
	},2000);
	setTimeout(function(){
		var set = yono.data.getAncestorSet("073_OED",22);
		yono.canvas.drawConfiguration(set);
	},3000);
	setTimeout(function(){
		var set = yono.data.getAncestorSet("037_CAT",22);
		yono.canvas.drawConfiguration(set);
	},4000);
};