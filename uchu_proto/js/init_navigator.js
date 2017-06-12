$(function () {
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
	$("#yonograph").resizable({stop:function(){centerTheGrid();}});
	$("#crawlInfo").draggable();

	$("#toggleAni").on("click", function(e){
		toggleAnimation();
	});
	$("#toggleGrid").on("click", function(e){
		togglePixFx();
	});
	$(".toggle_size").on("click", function(e){
		$(".toggle_size").toggleClass("enabled",false);
		var px = parseInt($(this).data("pxsize"));
		yono.displayChangeSize(px);
		$(this).toggleClass("enabled",true);
	});
	$("#toggleCrawl").on("click", function(e){
		$(this).toggleClass("enabled", yono.toggleRandomCrawl());
	});

	// set the ui values
	$("#toggleAni, #toggleSize2").toggleClass("enabled",true);
	yono.displayChangeSize(64);
	yono.toggleAnimationEnabled(true);
});

yono.data.jsonDataLoadComplete = function() {
	var iobj = {
		basePieceSize: 64,
		uchuData: this,
		isGridSizeLocked: true
	}
	yono.init(iobj);
}

function togglePixFx() {
	var is_fx = yono.toggleShowingPixelEdgeEffects();
	$("#toggleGrid").toggleClass("enabled",is_fx);
	yono.showYonograph();
}

function toggleAnimation() {
	var iae = yono.toggleAnimationEnabled();
	$("#toggleAni").toggleClass("enabled",iae);
	yono.showYonograph();
}
