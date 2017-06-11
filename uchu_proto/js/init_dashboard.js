$(function() {
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	// yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
});
yono.data.jsonDataLoadComplete = function() {
	jsonObj = yono.data.jsonObj;
	buildPiecesList();
	buildArtistsList();
}