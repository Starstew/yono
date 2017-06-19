yono.data = (function(){
	var exports = {},
		jsonObj = {},
		jsonPath = "",
		pHash, // hash of pieces
		pArray, // array of pieces objects
		pArrayBySubtime, // array of pieces IDs, sorted by submission time
		artists, // artist data
		artistsArray, // array of artist data
		artistCount; // tally of all artists

	/**
	The iobj (init object) contains configuration elements. 
	If not overridden, there will be defaults.
	*/
	var init = function(iobj) {
		if (iobj) {
			if (iobj.jsonData) {
				this.processJson(iobj.jsonData);
				return;
			} else {
				this.jsonPath = (iobj['jsonPath'] != undefined) ? iobj['jsonPath'] : jsonPath;
			}
		}
	
		this.loadJsonData();
	};

	var loadJsonData = function () {
		var self = this;
		$.getJSON(this.jsonPath, function(json) {self.processJson(json);});
	};

	var processJson = function(json) {
		this.jsonObj = json;
		
		this.readArtistsFromJson(); 
		this.artistCount = Object.keys(this.artists).length;
		
		this.generatePiecesList();
		
		this.generateArtistMetaData();
		
		this.jsonDataLoadComplete();
	};

	// stub for overriding
	var jsonDataLoadComplete = function () {};
	
	var generatePiecesList = function() {
		this.pHash = new Object();
		this.buildPiecesHash();
		this.pArray = this.buildPiecesArray();
		this.pArrayBySubtime= this.getPiecesSortedBySubtime();
	};
	
	var readArtistsFromJson = function() {
		this.artists = this.jsonObj["artistTable"];
		this.artistsArray = new Array();
		for (var i in this.artists) {
			this.artists[i]['id'] = i;
			this.artistsArray.push(this.artists[i]);
		}
	};
	
	var buildPiecesArray = function() {
		if (this.pHash == undefined || this.pHash == null) {
			return;
		}
		
		var retArray = new Array();
		for (var i in this.pHash) {
			retArray.push(this.pHash[i]);
		}
		
		return retArray;
	};

	var buildPiecesHash = function() {
		var raws = this.jsonObj["piecesRaw"];
		
		// build a hash of pieces by looping through raw data
		var idlist = new Array();
		for (var i = 0; i < raws.length; i++) {
			this.buildPieceObj(raws[i]);
		}
		
		// clean out any blank objects
		for (var i in this.pHash) {
			var phid = this.pHash[i]['id'];
			if (phid == null || phid == undefined || phid == "") {
				delete this.pHash[i];
			}
		}
		
		this.piecesCount = raws.length;
	};
	
	var buildPieceObj = function(pObj) {
		var rp = pObj;
		var id = rp["id"];
		var art = rp["artist"];
		var pid = rp["parentid"];
		var spl = rp["split"];
		var ip = rp["subtime"] == undefined;
		var subtime = rp["subtime"];
		
		// create object in hash if not already there
		if (this.pHash[pid] == null) {
			this.pHash[pid] = this.createEmptyPieceObj();
		}
		if (this.pHash[id] == null) {
			this.pHash[id] = this.createEmptyPieceObj();
		}
		
		// set hash info for THIS piece
		this.pHash[id]["artist"] = art;
		this.pHash[id]["id"] = id;
		this.pHash[id]["ip"] = ip;
		this.pHash[id]["parent"] = pid;
		this.pHash[id]["split"] = spl;
		this.pHash[id]["seen"] = Boolean.FALSE;
		this.pHash[id]["subtime"] = subtime;
		
		// set hash info for PARENT piece
		if (spl == "h") {
			this.pHash[pid]["horz"] = id;
		} else {
			this.pHash[pid]["vert"] = id;
		}
	};
	
	var createEmptyPieceObj = function() {
		var p = new Object();
		p["horz"] = "";
		p["vert"] = "";
		p["artist"] = "";
		p["id"] = "";
		p["ip"] = Boolean.FALSE;
		p["parent"] = "";
		p["seen"] = Boolean.FALSE;
		return p;
	};

	var generateArtistMetaData = function() {
		// count pieces per artist
		for (var p in this.pHash) {
			var cpc = this.pHash[p];
			var aid = cpc.artist;
			if (this.artists[aid] != undefined) {
				if (this.artists[aid].hasOwnProperty('finishedPieces') == false) {
					this.artists[aid]['finishedPieces'] = new Array();
				}
				if (cpc.ip == false) {
					this.artists[aid]['finishedPieces'].push(cpc.id);
				}
			}
		}
	};
	
	var getPiecesSortedBySubtime = function() {
		var a = this.pArray.slice(0);
		a.sort(this.sortBySubtime);
		var b = new Array();
		for (var i = 0; i < a.length; i++) {
			if (a[i].subtime != undefined) {
				b.push(a[i].id);
			}
		}
		return b;
	};

	var getAncestorSet = function(cyonode,depth) {
		var a = [],
			current_yonode = cyonode;
		a.push({id:cyonode,split:this.pHash[cyonode]["split"]});
		for (var i=0;i<depth;i++) {
			current_yonode = this.pHash[current_yonode]["parent"];
			if (!current_yonode) {
				break;
			}
			a.push({id:current_yonode,split:this.pHash[current_yonode]["split"]});
		}
		return a;
	};
	
	// helpers
	var sortByName = function(a, b) {
		var prop = "name";
		var aP = (a == undefined) ? "" : a[prop].toLowerCase();
	  	var bP = (b == undefined) ? "" : b[prop].toLowerCase();
	  	return ((aP < bP) ? -1 : ((aP > bP) ? 1 : 0));
	};
	var sortByFinishedPieces = function(a, b) {
		var prop = "finishedPieces";
		var aP = (a == undefined || a[prop] == undefined) ? 0 : a[prop].length;
	  	var bP = (b == undefined || b[prop] == undefined) ? 0 : b[prop].length;
	  	return ((aP < bP) ? -1 : ((aP > bP) ? 1 : 0));
	};
	var sortBySubtime = function(a, b) {
		var prop = "subtime";
		var aP = (a == undefined || a[prop] == undefined) ? 0 : parseInt(a[prop]);
	  	var bP = (b == undefined || b[prop] == undefined) ? 0 : parseInt(b[prop]);
	  	return ((aP < bP) ? -1 : ((aP > bP) ? 1 : 0));
	};

	exports = {
		artists: artists,
		pHash: pHash,
		pArrayBySubtime: pArrayBySubtime,
		artistsArray: artistsArray,
		init: init,
		loadJsonData: loadJsonData,
		processJson: processJson,
		jsonDataLoadComplete: jsonDataLoadComplete,
		generatePiecesList: generatePiecesList,
		readArtistsFromJson: readArtistsFromJson,
		buildPiecesArray: buildPiecesArray,
		buildPiecesHash: buildPiecesHash,
		buildPieceObj: buildPieceObj,
		createEmptyPieceObj: createEmptyPieceObj,
		generateArtistMetaData: generateArtistMetaData,
		getPiecesSortedBySubtime: getPiecesSortedBySubtime,
		sortByName: sortByName,
		sortByFinishedPieces: sortByFinishedPieces,
		sortBySubtime: sortBySubtime,
		getAncestorSet: getAncestorSet
	};

	return exports;
}());
