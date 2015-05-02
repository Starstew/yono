// artists page building
var myYonoData = new yonoData();
var piecesBasePath = "./pieceImgs/";
var navUrlBase = "./";

function initArticipantsPage(iobj) {
	if (iobj.hasOwnProperty("navUrl")) {
		navUrlBase = iobj.navUrl;
	}
	if (iobj.hasOwnProperty("piecesUrl")) {
		piecesBasePath = piecesUrl;
	}
}

$(function () {
	myYonoData.init({"jsonData":uchuDataJson}); // for local environment
	//myYonoData.init({"jsonPath":"uchuData.json"}); // for server environment
});

myYonoData.jsonDataLoadComplete = function() {
	displayArtistList();
	showRecentlyAddedYonodes();
	var artistId = getURLParam('artistId');
	if (artistId != undefined) {
		showArtistInfo(artistId);
	}
}

function displayArtistList(sortType) {
	var divArtistList = $("#artistList");
	divArtistList.empty();
	
	var sortedList = myYonoData.artistsArray.sort(myYonoData.sortByName);
	if (sortType == "pieces") {
		sortedList = myYonoData.artistsArray.sort(myYonoData.sortByName).reverse();
		sortedList = sortedList.sort(myYonoData.sortByFinishedPieces).reverse();
	}

	for (var i = 0; i < sortedList.length; i++) {
		var aObj = sortedList[i];
		var len = (aObj.finishedPieces) ? aObj.finishedPieces.length : 0;
		if (len == 0) { continue; } // skip if no pieces
		divArtistList.append("<a class='artistListButton' href='javaScript:void(0)' onClick='showArtistInfo(\"" + aObj.id + "\");'>" + aObj.name + "<span style='float:right;font-weight:bold;background:#aaaaaa;width:25px;text-align:center;color:#ffffff'> " + len + "</span></a>");
	}
	
}

function showArtistInfo(aId) {
	if (aId == undefined) {
		aId = "OTZ";
	}
	
	$("html, body").animate({ scrollTop: 0 }, "slow");
	
	var aObj = myYonoData.artists[aId];
	if (aObj == undefined) {
		return;
	}
	// update elements
	$("#artistName").empty();
	$("#artistName").append(aObj.name);
	
	$("#artistExtraInfo").empty();
	var len = (aObj.finishedPieces) ? aObj.finishedPieces.length : 0;
	$("#artistExtraInfo").append("Finished " + len + " pieces. ");
	$("#artistExtraInfo").append("[<a href='" + aObj.url + "'>website</a>]");
		
	// generate pieces grid
	$("#piecesGrid").empty();
	var lastPc;
	for (var i in aObj.finishedPieces) {
		var pid = aObj.finishedPieces[i];
		var cpc = myYonoData.pHash[pid];
		$("#piecesGrid").append("<a href='javaScript:void(0);' onClick='showDetailedImage(\"" + pid + "\");'><img id='" + pid + "_thumb' class='pieceThumbnail' src='" + piecesBasePath + cpc.id + ".png'/></a>");
		var inum = parseInt(i);
		
		$("#" + pid + "_thumb").fadeOut(0);	
		$("#" + pid + "_thumb").fadeIn(100 + (100 * inum));	
		lastPc = i;	
	}
	if (lastPc) {
		showDetailedImage(aObj.finishedPieces[lastPc]);
	} else {
		$("#pieceDetail").empty();
	}
}

function showDetailedImage(pid) {
	$("#pieceDetail").empty();
	$("#pieceDetail").append("<a href='" + navUrlBase + "?centerId="+pid+"'><img src='" + piecesBasePath + "4x/" + pid + ".png'></a>");
}

function showRecentlyAddedYonodes() {
	var rayDiv = $("#recentYonodes");
	rayDiv.empty();
	var listOfIds = myYonoData.pArrayBySubtime.reverse();
	for (var i = 0; i < 20; i++) {
		var pid = listOfIds[i];
		var yonodeObj = myYonoData.pHash[pid];
		var artistName = myYonoData.artists[yonodeObj.artist].name;
		var di = parseInt(yonodeObj['subtime']);
		var d = new Date(di*1000);
		var dLocale = (d > 0) ? d.toDateString() : "";
	
		var yonodeDiv = "<div class='recentYonode'><a href='" + navUrlBase + "?centerId=" + pid + "'><img title='" + artistName + " on " + dLocale + "' src='" + piecesBasePath + "2x/" + pid + ".png'></a></div>";
		rayDiv.append(yonodeDiv);
	}
}

function getURLParam( name )
{
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