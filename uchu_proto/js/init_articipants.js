$(function(){
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	//yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
	yono.page.articipants.initPage({"navUrl":"index.html"} );
});