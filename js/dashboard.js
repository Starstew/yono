var jsonObj = new Object();
var jsonUrl = "uchuData.json";
var imgsUrl = "./pieceImgs/";
var navUrl = "./index.html";
var articipantsUrl = "./articipants.html";


function initDashboard(iobj) {
	if (iobj) {
		if (iobj.hasOwnProperty("jsonUrl")) {
			jsonUrl = iobj.jsonUrl;
		}
		if (iobj.hasOwnProperty("imgsUrl")) {
			imgsUrl = iobj.imgsUrl;
		}
		if (iobj.hasOwnProperty("navUrl")) {
			navUrl = iobj.navUrl;
		}
	}
	
	$.getJSON(jsonUrl, function(json) {
	    jsonObj = json;
	    
	    buildPiecesList();
		buildArtistsList();
	});
}

function buildArtistsList() {
	var artists = jsonObj.artistTable;
	var aDiv = $("#artistsList");
	aDiv.empty();
	for (var a in artists) {
		var aObj = artists[a];
		aDiv.append("<div class='artist_id_and_link'><div class='artist_id'>" + a + "</div> : <a href='" + articipantsUrl + "?artistId=" + a + "'>" + aObj.name + "</a></div>");
	}
}

function buildPiecesList() {
	var pieces = getPiecesListFromRaw();
	pieces.reverse();
	for (var i = 0; i < pieces.length; i++) {
		var p = pieces[i];
		var id = p["id"];
		var img = imgsUrl+id+".png";
		var h = p["horz"];
		var v = p["vert"];
		var ip = p["ip"];
		
		var yonograph = p["yonograph"];
		
		var h_class = "pieceConnection";
		var v_class = "pieceConnection";
		h_class += h.length <= 0 ? " isopen" : "";
		v_class += v.length <= 0 ? " isopen" : "";
		h = h || "OPEN";
		v = v || "OPEN";

		var h_html = "<div class='" + h_class + "'>H:" + h + "</div>";
		var v_html = "<div class='" + v_class + "'>V:" + v + "</div>";
		
		var ohtml = "<div class='pieceRow' id='"+ id + "'>";
		if (ip) {
			img = imgsUrl+"_inprogress.png";
			h_html = "<div class='pieceConnection'>COMING</div>";
			v_html = "<div class='pieceConnection'>SOON</div>";
		}
		ohtml += "<div class='pieceImgId'><div class='img_id'>" + id + "</div><a href='" + navUrl + "?centerId=" + id + "'><img width='64' height='64' src='"+img+"'/></a></div>";
		ohtml += h_html;
		ohtml += v_html;
		
		ohtml += "</div>\n";
		$("#manifest").append(ohtml);
	}
	$("#manifest").append("<br style='clear:both'/>");
}

function getPiecesListFromRaw() {
	var raws = jsonObj["piecesRaw"];
	
	// build a hash of pieces by looping through raw data
	var phash = new Object();
	var idlist = new Array();
	for (var i = 0; i < raws.length; i++) {
		var rp = raws[i];
		var id = rp["id"];
		var art = rp["artist"];
		var pid = rp["parentid"];
		var spl = rp["split"];
		//var ip = (rp["ip"] == 1);
		var ip = rp["subtime"] == undefined;
		var yonograph = (rp["yonograph"] == 1);
		
		idlist.push(id);
		
		// create object in hash if not already there
		if (phash[pid] == null) {
			phash[pid] = buildPieceObj();
		}
		if (phash[id] == null) {
			phash[id] = buildPieceObj();
		}
		
		// set hash info for THIS piece
		phash[id]["artist"] = art;
		phash[id]["id"] = id;
		phash[id]["ip"] = ip;
		phash[id]["yonograph"] = yonograph;
		
		// set hash info for PARENT piece
		if (spl == "h") {
			phash[pid]["horz"] = id;
		} else {
			phash[pid]["vert"] = id;
		}
	}
	
	// build pieces array from hash
	var pieces = new Array();
	for (var i = 0; i < idlist.length; i++) {
		var id = idlist[i];
		if (phash.hasOwnProperty(id)) {
			pieces.push(phash[id]);
		}
	}
	return pieces;
}

function buildPieceObj() {
	var p = new Object();
	p["horz"] = "";
	p["vert"] = "";
	p["artist"] = "";
	p["id"] = "";
	p["ip"] = Boolean.FALSE;
	p["yonograph"] = Boolean.FALSE;
	return p;
}

function toggleDiv(divId) {
	$("#"+divId).slideToggle('slow',function() {});
}
