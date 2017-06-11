yono.page = yono.page || {};
yono.page.articipants = (function(){
	var piecesBasePath = "./pieceImgs/",
		navUrlBase = "./index.html";

	var initPage = function(iobj) {
		if (iobj.hasOwnProperty("navUrl")) {
			navUrlBase = iobj.navUrl;
		}
		if (iobj.hasOwnProperty("piecesUrl")) {
			piecesBasePath = piecesUrl;
		}
	};

	yono.data.jsonDataLoadComplete = function() {
		displayArtistList();
		showRecentlyAddedYonodes();
		var artistId = getURLParam('artistId');
		if (artistId != undefined) {
			showArtistInfo(artistId);
		}
	};

	var displayArtistList = function(sortType) {
		var divArtistList = $("#artistList");
		divArtistList.empty();
		
		var sortedList = yono.data.artistsArray.sort(yono.data.sortByName);
		if (sortType == "pieces") {
			sortedList = yono.data.artistsArray.sort(yono.data.sortByName).reverse();
			sortedList = sortedList.sort(yono.data.sortByFinishedPieces).reverse();
		}
		for (var i = 0; i < sortedList.length; i++) {
			var aObj = sortedList[i];
			var len = (aObj.finishedPieces) ? aObj.finishedPieces.length : 0;
			if (len == 0) { continue; } // skip if no pieces
			var artist_entry = "<a class='artistListButton' href='javaScript:void(0)' onClick='yono.page.articipants.showArtistInfo(\"" + aObj.id + "\");'>" + aObj.name + 
				"<span> " + len + "</span></a>";
	
			divArtistList.append(artist_entry);
		}	
	};

	var showArtistInfo = function(aId) {
		if (aId == undefined) {
			aId = "OTZ";
		}
		
		$("html, body").animate({ scrollTop: 0 }, "slow");
		
		var aObj = yono.data.artists[aId];
		if (aObj == undefined) {
			return;
		}
		// update elements
		$("#artistName").empty();
		$("#artistName").append(aObj.name);
		
		$("#artistExtraInfo").empty();
		var len = (aObj.finishedPieces) ? aObj.finishedPieces.length : 0;
		$("#artistExtraInfo").append(len + " pieces completed. ");
		$("#artistExtraInfo").append("[<a href='" + aObj.url + "'>website</a>]");
			
		// generate pieces grid
		$("#piecesGrid").empty();
		var lastPc;
		for (var i in aObj.finishedPieces) {
			var pid = aObj.finishedPieces[i];
			var cpc = yono.data.pHash[pid];
			$("#piecesGrid").append("<a href='javaScript:void(0);' onClick='yono.page.articipants.showDetailedImage(\"" + pid + "\");'><img id='" + pid + "_thumb' class='pieceThumbnail' src='" + piecesBasePath + cpc.id + ".png'/></a>");
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
	};

	var showDetailedImage = function(pid) {
		$("#pieceDetail").empty();
		$("#pieceDetail").append("<a href='" + navUrlBase + "?centerId="+pid+"'><img src='" + piecesBasePath + "4x/" + pid + ".png'></a>");
	}

	var showRecentlyAddedYonodes = function() {
		var rayDiv = $("#recentYonodes");
		rayDiv.empty();
		var listOfIds = yono.data.pArrayBySubtime.reverse();
		for (var i = 0; i < 20; i++) {
			var pid = listOfIds[i];
			var yonodeObj = yono.data.pHash[pid];
			var artistName = yono.data.artists[yonodeObj.artist].name;
			var di = parseInt(yonodeObj['subtime']);
			var d = new Date(di*1000);
			var dLocale = (d > 0) ? d.toDateString() : "";
		
			var yonodeDiv = "<div class='recentYonode'><a href='" + navUrlBase + "?centerId=" + pid + "'><img title='" + artistName + " on " + dLocale + "' src='" + piecesBasePath + "2x/" + pid + ".png'></a></div>";
			rayDiv.append(yonodeDiv);
		}
	};

	var showAllYonodes = function(holder_selector) {
		var listOfIds = yono.data.pArrayBySubtime.reverse();
		// display all the yonodes
		var ay = $(holder_selector);
		ay.empty();
		
		var reverseList = listOfIds.reverse();
		for (var i = 0; i < reverseList.length; i++) {
			var pid = reverseList[i];
			var yonodeObj = yono.data.pHash[pid];
			var artistName = yono.data.artists[yonodeObj.artist].name;
			var di = parseInt(yonodeObj['subtime']);
			var d = new Date(di*1000);
			var dLocale = (d > 0) ? d.toDateString() : "";
			var yonodeDiv = "<div class='recentYonode'><a href='" + navUrlBase + "?centerId=" + pid + "' title='Yonode" + pid + " by " + artistName + " on " + dLocale + "'><img src='" + piecesBasePath + "2x/" + pid + ".png' alt='Yonode" + pid + " at 2x size'></a></div>";
			ay.append(yonodeDiv);
		}
	};

	var showUchuReport = function(holder_selector) {
		var listOfIds = yono.data.pArrayBySubtime.reverse();
		// update report
		var ur = $(holder_selector);
		ur.empty();
		ur.append("<span class='yonodeDataLabel'>Completed Yonodes:</span><span class='yonodeData'>" + listOfIds.length + "</span>");
		var mrYonode = yono.data.pHash[listOfIds[0]];
		var mrDate = new Date(mrYonode.subtime * 1000);
		var mrDateString = mrDate.toString();
		var mrArtistName = yono.data.artists[mrYonode.artist].name;
		ur.append("<br/><span class='yonodeDataLabel'>Most recent:</span><span class='yonodeData'>" +  mrDateString + " by " + mrArtistName + "</span>");
	};

	var getURLParam = function(name) {
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
	};

	return {
		initPage: initPage,
		displayArtistList: displayArtistList,
		showArtistInfo: showArtistInfo,
		showDetailedImage: showDetailedImage,
		showRecentlyAddedYonodes: showRecentlyAddedYonodes,
		getURLParam: getURLParam,
		showAllYonodes: showAllYonodes,
		showUchuReport: showUchuReport
	}
}());
