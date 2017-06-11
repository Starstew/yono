yono.data.jsonDataLoadComplete = function() {
	yono.page.articipants.showUchuReport('#uchuReport');
	yono.page.articipants.showAllYonodes('#allYonodes');
}
$(function(){
	yono.page.articipants.initPage({"navUrl":"index.html"} );
	var navUrlBase = "./index.html";
	yono.data.init({"jsonData":uchuDataJson}); // for local environment
	//yono.data.init({"jsonPath":"uchuData.json"}); // for server environment
});