/* file XMLParser for mylist, anime and episode xml data 
 * @author fahrenheit (alka.setzer@gmail.com)
 *				 Some code derived from PetriW's work at anidb
 * @contents Core Classes
 *					 Core Parsing Functions
 *					 PseudoFiles Functions
 *					 Filtering Functions
 * @version 2.1.2 (26.06.2007)
 */
jsVersionArray.push({
	"file":"anime3/parser.js",
	"version":"2.1.3",
	"revision":"$Revision$",
	"date":"$Date::													 $",
	"author":"$Author$",
	"changelog":"Added CAnimeInfo"
});

// CORE Vars //

var episodeFileTableRenderList = new Array(); // stack of fileTables in queue for render (currently not used)
var verifiesLanguage = new Array();  // list of short language identifiers for which the user is marked verifier
var fInt = 100; // time to wait between ep node parsing 
var eInt = 150; // time to wait between ep render
//var config = new Object(); // config

// CORE Classes //

/* Creates a new Mylist Entry from a given node
 * @param node Node from which to get the mylist information
 * @return mylistEntry
 */
function CMylistEntry(node) {
	this.id = Number(node.getAttribute('id'));
	this.fileId = Number(node.getAttribute('fid'));
	this.episodeId = Number(node.getAttribute('eid'));
	this.groupId = Number(node.getAttribute('gid'));
	this.filetype = node.getAttribute('type');
	this.fstate = 'unknown';
	this.status = 'unknown';
	this.seen = 0;
	this.seenDate = null;
	this.source = null;
	this.storage = null;
	this.other = null;
	this.fType = null;
	this.relatedEids = new Array();
	for (var i = 0; i < node.childNodes.length; i++) {
	var sNode = node.childNodes.item(i);
	if (sNode.nodeType == 3) continue; // Text node, not interested
	switch (sNode.nodeName.toLowerCase()) {
		case 'state': this.status = nodeData(sNode); break;
		case 'fstate': this.fstate = nodeData(sNode); break;
		case 'seen': this.seen = Number(nodeData(sNode)); this.seenDate = convertTime(sNode.getAttribute('date')); break;
		case 'source': this.source = nodeData(sNode); break;
		case 'storage': this.storage = nodeData(sNode); break;
		case 'other': this.other = nodeData(sNode); break;
		case 'releids': this.relatedEids = nodeData(sNode).split(','); break;
		default: showAlert('mylistEntry for lid: '+this.id, node.nodeName, node.nodeName,sNode.nodeName);
	}
	}
	this.fType = mapFState(this.fstate);
}

/* Creates a new Group Entry from a given node
 * @param node Node from which to get the group information
 * @return groupEntry
 */
function CGroupEntry(node) {
	hiddenGroups++;
	this.relGroups = '';
	this.visible = true;
	this.defaultVisible = false;
	this.filtered = false;
	this.langFiltered = false;
	this.id = Number(node.getAttribute('id'));
	this.agid = Number(node.getAttribute('agid'));
	this.rating = '-';
	this.ratingCount = 0;
	this.commentCount = 0;
	this.userRating = -1; // set later
	this.relatedGroups = new Array();
	this.sepCnt = 0;
	this.epCnt = 0;
	this.isInMylistRange = '';
	this.epRange = '';
	this.audioLangs = new Array();
	this.subtitleLangs = new Array();
	this.state = 'unknown';
	this.stateId = 0;
	this.hasCherryBeenPoped = false; // just to know if we have the files related to this group on list
	for (var i = 0; i < node.childNodes.length; i++) {
	var sNode = node.childNodes.item(i);
	if (sNode.nodeType == 3) continue; // Text node, not interested
	switch (sNode.nodeName.toLowerCase()) {
		case 'relgroups': this.relatedGroups = nodeData(sNode).split(','); break;
		case 'name': this.name = nodeData(sNode); break;
		case 'sname': this.shortName = nodeData(sNode); break;
		case 'state': this.state = nodeData(sNode); this.stateId = Number(sNode.getAttribute('id')); break;
		case 'lastep': this.lastEp = epNoToString(nodeData(sNode)); break;
		case 'lastup': this.lastUp = convertTime(nodeData(sNode)); break;
		case 'rating': this.rating = nodeData(sNode); this.ratingCount = Number(sNode.getAttribute('cnt')); break;
		case 'cmts': this.commentCount = Number(sNode.getAttribute('cnt')); break; //re-add +1 when we are back to using xmln
		case 'epcnt': this.epCnt = Number(nodeData(sNode)); break;
		case 'sepcnt': this.sepCnt = Number(nodeData(sNode)); break;
		case 'eprange': this.epRange = nodeData(sNode); break;
		case 'aud': var langs = sNode.getElementsByTagName('lang');
				for (var k = 0; k < langs.length; k++) this.audioLangs.push(nodeData(langs[k]));
				break;
			case 'sub': var langs = sNode.getElementsByTagName('lang');
				for (var k = 0; k < langs.length; k++) this.subtitleLangs.push(nodeData(langs[k]));
				break;
		default: showAlert('groupEntry for gid: '+this.id, node.nodeName, node.nodeName,sNode.nodeName);
	}
	}
}

/* Creates a new Anime Entry from a given node
 * @param node Node from which to get the anime information
 * @return animeEntry
 */
function CAnimeEntry(node) {
	this.id = Number(node.getAttribute('id'));
	this.type = node.getAttribute('type');
	this.titles = new Array();
	this.episodes = new Array();
	this.groups = new Array();
	this.highestEp = 0;
	for (i = 0; i < node.childNodes.length; i++) {
	var sNode = node.childNodes.item(i);
	if (sNode.nodeType == 3) continue; // Text node, not interested
	switch (sNode.nodeName.toLowerCase()) {
		case 'neps': this.eps = Number(nodeData(sNode)); break;
		case 'epcnt': this.epCount = Number(nodeData(sNode)); break;
		case 'fcnt': this.fileCount = Number(nodeData(sNode)); break;
		case 'gcnt': this.groupCount = Number(nodeData(sNode)); break;
		case 'filedata':
		case 'eps': 
		case 'groups': break; // Will be taken care elsewhere 
		case 'titles':
			for (var k = 0; k < sNode.childNodes.length; k++) {
				var tNode = sNode.childNodes.item(k);
				if (tNode.nodeType == 3) continue; // Text node, not interested
			var ttype = tNode.getAttribute('type');
			var tlang = tNode.getAttribute('lang');
			var ttitle = nodeData(tNode);
			if (!this.titles[ttype]) this.titles[ttype] = new Object();
			this.titles[ttype][tlang] = ttitle;
			}
			break;
		default: showAlert('animeEntry for aid: '+this.id, node.nodeName, node.nodeName,sNode.nodeName);
	}
	}
}

CAnimeEntry.prototype.getTitle = function() {
	var title = null;
	for (var type in this.titles){ // loop title types and see if we have a match
		if (this.titles[type][animeTitleLang]) { title = this.titles[type][animeTitleLang]; break; }
	}
	if (!title) // just return the main title
	for (var lang in this.titles['main']) { title = this.titles['main'][lang]; break; }
	if (!title) title = 'unknown';
	return (title);
}

CAnimeEntry.prototype.getAltTitle = function() {
	var title = null;
	if (this.titles['main'][animeAltTitleLang]) return(this.titles['main'][animeAltTitleLang]);
	if (this.titles['official'][animeAltTitleLang]) return(this.titles['official'][animeAltTitleLang]);
	if (this.titles['official']['x-jat']) return(this.titles['official']['x-jat']);
	if (this.titles['official']['en']) return(this.titles['official']['en']);
	for (var i in this.titles['official']) return(this.titles['official'][i]);
}

/* Creates a new Episode Entry from a given node
 * @param node Node from which to get the episode information
 * @return episodeEntry
 */
function CEpisodeEntry(node) {
	this.id = Number(node.getAttribute('id'));
	this.epno = '';
	this.type = 'normal';
	this.typeFull = 'Normal Episode';
	this.typeChar = '';
	this.epnoNum = 0;
	this.vote = -1; // set later
	this.isRecap = (node.getAttribute('recap') ? Number(node.getAttribute('recap')) : 0);
	this.animeId = -1;
	this.hiddenFiles = 0;
	this.seenDate = 0;
	this.length = 0;
	this.playLength = 0;
	this.relDate = 0;
	this.userCount = 0;
	this.fileCount = 0;
	this.other = '';
	this.rating = '-';
	this.ratingCount = 0;
	this.newFiles = false;
	this.titles = new Array();
	this.files = new Array(); // File IDS of related files are stored in the files array
	this.pseudoFiles = new Array(); // pseudo files are a totaly new thing
	this.update = (node.getAttribute('update') ? Number(node.getAttribute('update')) : 0);
	for (var i = 0; i < node.childNodes.length; i++) {
	var sNode = node.childNodes.item(i);
	if (sNode.nodeType == 3) continue; // Text node, not interested
	switch (sNode.nodeName.toLowerCase()) {
		case 'flags': this.flags = Number(nodeData(sNode)); break;
		case 'epno': 
			var eno = nodeData(sNode);
			this.epno = (!isNaN(Number(eno)) ? Number(eno) : Number(eno.substring(1,eno.length)));
			this.typeChar = (!isNaN(Number(eno)) ? '' : eno.substring(0,1));
			break;
		case 'len': this.length = Number(nodeData(sNode)); break;
		case 'date': this.addDate = convertTime(nodeData(sNode)); this.relDate = convertTime(sNode.getAttribute('rel')) || 0; break;
		case 'ucnt': this.userCount = Number(nodeData(sNode)); break;
		case 'fcnt': this.fileCount = Number(nodeData(sNode)); break;
		case 'other': this.other = nodeData(sNode); break;
		case 'rating': this.rating = nodeData(sNode); this.ratingCount = Number(sNode.getAttribute('cnt')); break;
		case 'titles':
			for (var k = 0; k < sNode.childNodes.length; k++) {
				var tNode = sNode.childNodes.item(k);
				if (tNode.nodeType == 3) continue; // Text node, not interested
				this.titles[tNode.getAttribute('lang')] = new Object();
			this.titles[tNode.getAttribute('lang')]['title'] = nodeData(tNode);
			this.titles[tNode.getAttribute('lang')]['update'] = (tNode.getAttribute('update')) ? tNode.getAttribute('update') : 0;
			this.titles[tNode.getAttribute('lang')]['verify'] = (tNode.getAttribute('verify')) ? tNode.getAttribute('verify') : 0;
			}
			break;
		case 'files': break;
		default: showAlert('episodeEntry for gid: '+this.id, node.nodeName, node.nodeName,sNode.nodeName);
	}
	}
	if (this.relDate == 0) this.date = this.addDate;
	else this.date = this.relDate;
	this.epnoNum = this.epno;
	switch(this.typeChar) {
		case 'S': this.type = 'special'; this.typeFull = 'Special Episode'; this.epnoNum = 100000+this.epnoNum; break;
		case 'C': this.type = 'opening'; this.typeFull = 'Opening/Ending/Credits'; this.epnoNum = 200000+this.epnoNum; break;
		case 'T': this.type = 'trailer'; this.typeFull = 'Trailer/Promo/Ads'; this.epnoNum = 300000+this.epnoNum; break;
		case 'P': this.type = 'parody'; this.typeFull = 'Parody/Fandub'; this.epnoNum = 400000+this.epnoNum; break;
		case 'O': this.type = 'other'; this.typeFull = 'Other Episodes'; this.epnoNum = 1000000+this.epnoNum; break;
	}
	if (this.isRecap) this.typeFull += ', Recap';

	this.playLength = this.length;
	// Format length
	var h, m;
	h = Math.floor(this.length / 60);
	m = this.length % 60;
	if (h > 0) {
		if (m > 0) this.length = h + 'h ' + m + 'm';
		else this.length = h + 'h';
	} else this.length = m + 'm';
}

CEpisodeEntry.prototype.getTitle = function() {
	var title = null;
	if (this.titles[episodeTitleLang]) title = this.titles[episodeTitleLang]['title'];
	if (!title && episodeTitleLang != 'en' && this.titles['en']) title = this.titles['en']['title']; 
	if (!title && episodeTitleLang != 'x-jat' && this.titles['x-jat']) title = this.titles['x-jat']['title'];
	if (!title && episodeTitleLang != 'ja' && this.titles['ja']) title = this.titles['ja']['title']; 
	if (!title) { for (var i in this.titles) { title = this.titles[i]['title']; break; } }
	if (!title) title = 'Episode '+this.typeChar+this.epno;
	return (title);
}

CEpisodeEntry.prototype.getAltTitle = function() {
	var title = this.titles[episodeAltTitleLang]; // first option
	if (!title && episodeAltTitleLang != 'en' && this.titles['en']) title = this.titles['en']['title']; 
	if (!title && episodeAltTitleLang != 'x-jat' && this.titles['x-jat']) title = this.titles['x-jat']['title'];
	if (!title && episodeAltTitleLang != 'ja' && this.titles['ja']) title = this.titles['ja']['title']; 
	if (!title) { for (var i in this.titles) { title = this.titles[i]['title']; break; } }
	if (!title) title = 'Episode '+this.typeChar+this.epno;
	return (title);
}

CEpisodeEntry.prototype.getTitles = function() {
	var ret = new Array();
	for (var tid in this.titles) ret.push(tid + ': ' +this.titles[tid]['title']);
	return (ret.join(', '));
}

/* Creates a new File Entry from a given node
 * @param node Node from which to get the file information
 * @return fileEntry
 */
function CFileEntry(node) {
	this.id = Number(node.getAttribute('id'));
	this.animeId = -1; // Assigned by the caller
	this.episodeId = -1; // Properly assigned by the caller
	this.type = node.getAttribute('type');
	this.epRelations = new Array(); // holds file<->ep relations for a file
	this.fileRelations = new Array(); // holds file<->file relations for a file
	this.relatedFiles = new Array(); // if (this.length) this is a pseudoFile
	this.relatedPS = new Array(); // used to store related pseudoFiles ids
	this.relatedGroups = new Array(); // used to hold related group information
	//this.relatedEpisodes = new Array(); // used only if external file
	// defaults
	this.flags = 0;
	this.visible = true; // should the file be displayed (default: yes)
	this.crc32 = '';
	this.crcStatus = '';
	this.isDeprecated = false;
	this.ed2k = '';
	this.ed2klink = '';
	this.size = 0;
	this.date = 0;
	this.relDate = 0;
	this.length = 0;
	this.fileType = '';
	this.groupId = 0;
	//this.groupName = ''; // only for pseudo files
	//this.groupShortName = '';	// only for pseudo files
	this.version = 'v1';
	this.isCensored = 0;
	this.isUncensored = 0;
	this.quality = 'unknown';
	this.resolution = 'unknown';
	this.pixelarea = 0;
	this.source = 'unknown';
	this.other = '';
	this.usersTotal = 0;
	this.usersUnknown = 0;
	this.usersDeleted = 0;
	this.vidCnt = 0;
	this.audCnt = 0;
	this.subCnt = 0;
	this.avdumped = 0;
	this.newFile = false;
	this.isTrueVirtual = false; // Haruhi brought up lots of issues with virtual files
	this.pseudoFile = false; // Got fed up with strange methods for checking if a file isn't pseudo
	this.videoTracks = new Array();
	this.audioTracks = new Array();
	this.subtitleTracks = new Array();
	this.isRaw = false;
	// Actualy fill the data;
	for (var i = 0; i < node.childNodes.length; i++) {
	var sNode1 = node.childNodes.item(i);
	switch (sNode1.nodeName.toLowerCase()) {
		case 'size': this.size = Number(nodeData(sNode1)); break;
		case 'ed2k': this.ed2k = nodeData(sNode1); break;
		case 'crc': this.crc32 = nodeData(sNode1); break;
		case 'len': this.length = Number(nodeData(sNode1)); break;
		case 'ftype': this.fileType = nodeData(sNode1); break;
		case 'group': this.groupId = Number(sNode1.getAttribute('id')); this.relatedGroups.push(this.groupId); break; 
		case 'flags': this.flags = Number(nodeData(sNode1)); break;
		case 'date': 
			this.date = convertTime(nodeData(sNode1));
			if (Number(new Date()/1000 - javascriptDate(this.date)/1000) < 86400) this.newFile = true;
			this.relDate = convertTime(sNode1.getAttribute('rel'));
			break;
		case 'avdumped': this.avdumped = Number(nodeData(sNode1)); break;
		case 'vid':
			this.vidCnt = Number(sNode1.getAttribute('cnt')) || 0;
			for (var j = 0; j < sNode1.childNodes.length; j++) {
				var dNode = sNode1.childNodes.item(j);
			if (dNode.nodeType == 3) continue;
				switch (dNode.nodeName.toLowerCase()) {
					case 'stream':
						var stream = new Object;
						stream.resW = 0;
						stream.resH = 0;
						stream.ar = 'unknown';
						stream.codec = 'unknown';
						stream.codec_sname = 'unk';
						for (var k = 0; k < dNode.childNodes.length; k++) {
							var stNode = dNode.childNodes.item(k);
							if (stNode.nodeType == 3) continue;
							switch (stNode.nodeName.toLowerCase()) {
								case 'res': 
									stream.resW = Number(stNode.getAttribute('w')) || 0; 
									stream.resH = Number(stNode.getAttribute('h')) || 0;										 
									if (stream.resW && stream.resH) {
										this.resolution = stream.resW + 'x' + stream.resH;
										this.pixelarea = Number(stream.resW)*Number(stream.resH);
									}
									break;
								case 'ar': stream.ar = nodeData(stNode); break;
								case 'codec': stream.codec_sname = stNode.getAttribute('sname'); stream.codec = nodeData(stNode); break;
								default: showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'videoStream['+k+']', dNode.nodeName,stNode.nodeName);
							}
						} 
						this.videoTracks.push(stream);
						break;
					default: showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'videoStreams', dNode.nodeName,stNode.nodeName);
				}
			}
			break;
		case 'aud':
			this.audCnt = Number(sNode1.getAttribute('cnt')) || 0;
			for (var j = 0; j < sNode1.childNodes.length; j++) {
				var dNode = sNode1.childNodes.item(j);
			if (dNode.nodeType == 3) continue;
				switch (dNode.nodeName.toLowerCase()) {
					case 'stream':
						var stream = new Object;
						stream.chan = 'unknown';
						stream.codec = 'unknown';
						stream.codec_sname = 'unknown';
						stream.type = 'normal';
						for (var k = 0; k < dNode.childNodes.length; k++) {
							var stNode = dNode.childNodes.item(k);
							if (stNode.nodeType == 3) continue;
							switch (stNode.nodeName.toLowerCase()) {
								case 'chan': stream.chan = nodeData(stNode); break;
								case 'lang': stream.lang = nodeData(stNode); break;
								case 'codec': stream.codec_sname = stNode.getAttribute('sname'); stream.codec = nodeData(stNode); break;
								case 'type': stream.type = nodeData(stNode); break;
								default: showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'audioStream['+k+']', dNode.nodeName,stNode.nodeName);
							}
						}
						this.audioTracks.push(stream);
						break;
					default:	showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'audioStreams', dNode.nodeName,stNode.nodeName);
				}
			}
		// @TODO remove this miserable hack
		if (this.audCnt > this.audioTracks.length && this.audioTracks.length == 3) {
			// grab the last stream and copy it :P
			for (var k = 3; k < this.audCnt; k++) {
				var stream = new Object();
				stream.chan = 'unknown';
				stream.codec = 'unknown';
				stream.codec_sname = 'unknown';
				stream.type = 'unknown';
				stream.lang = this.audioTracks[2]['lang'];
				this.audioTracks.push(stream);
			}
		}
			break;
		case 'sub':
			this.subCnt = Number(sNode1.getAttribute('cnt')) || 0;
			for (var j = 0; j < sNode1.childNodes.length; j++) {
				var dNode = sNode1.childNodes.item(j);
			if (dNode.nodeType == 3) continue;
				switch (dNode.nodeName.toLowerCase()) {
					case 'stream':
						var stream = new Object;
						stream.type = 'unknown';
						stream.flags = 0;
						for (var k = 0; k < dNode.childNodes.length; k++) {
							var stNode = dNode.childNodes.item(k);
							if (stNode.nodeType == 3) continue;
							switch (stNode.nodeName) {
								case 'lang': stream.lang = nodeData(stNode); break;
								case 'type': stream.type = nodeData(stNode); break;
								case 'flags': stream.flags = Number(nodeData(stNode)); break;
								default: showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'subtitleStream['+k+']', dNode.nodeName,stNode.nodeName);
							}
						}
						this.subtitleTracks.push(stream);
						break;
					default: showAlert('fileEntry for fid: '+this.id+' (type: '+this.type+')', 'subtitleStreams', sNode1.nodeName,dNode.nodeName);
				}
			}
			// @TODO remove this miserable hack
			if (this.subCnt > this.subtitleTracks.length && this.subtitleTracks.length == 3) {
				// grab the last stream and copy it :P
				for (var k = 3; k < this.subCnt; k++) {
					var stream = new Object();
					stream.type = 'unknown';
					stream.flags = 0;
					stream.lang = this.subtitleTracks[2]['lang'];
					this.subtitleTracks.push(stream);
				}
			}
			break;
		case 'qual': this.quality = nodeData(sNode1); break;
		case 'source': this.source = nodeData(sNode1); break;
		case 'other': this.other = nodeData(sNode1); break;
		case 'users':
			for (var j = 0; j < sNode1.childNodes.length; j++) {
				var sNode2 = sNode1.childNodes.item(j);
				switch (sNode2.nodeName.toLowerCase()) {
					case 'all': this.usersTotal = Number(nodeData(sNode2)); break;
					case 'ukn': this.usersUnknown = Number(nodeData(sNode2)); break;
					case 'del': this.usersDeleted = Number(nodeData(sNode2)); break;
				}
			}
			break;
		default: showAlert('fileEntry for fid: '+this.id, node.nodeName, node.nodeName,sNode1.nodeName);
	}
	}
	// do some clean up
	if (this.relDate == '') this.relDate = 0;
	if (this.flags & 1) { this.crcStatus = 'valid'; }
	if (this.flags & 2) { this.crcStatus = 'invalid'; this.isDeprecated = true; }
	if (this.flags & 4) { this.version = 'v2'; }
	if (this.flags & 8) { this.version = 'v3'; }
	if (this.flags & 16) { this.version = 'v4'; }
	if (this.flags & 32) { this.version = 'v5'; }
	if (this.flags & 64) { this.isUncensored = 1; }
	if (this.flags & 128) { this.isCensored = 1; }
	if (this.vidCnt && !this.subCnt) { this.isRaw = true; }
}

CFileEntry.prototype.isVirtual = function(eid) {
	if (this.isTrueVirtual) return true;
	return (this.episodeId != eid);
}

/* Creates a new AnimeInfo node */
function CAnimeInfo(node) {
	this.aid = Number(node.getAttribute('id'));
	this.desc = node.getAttribute('desc');
	this.title = node.getAttribute('name');
	this.picurl = node.getAttribute('picurl');
	this.restricted = Number(node.getAttribute('restricted'));
	this.year = node.getAttribute('year');
}

/* Creates a new CharInfo node */
function CCharInfo(node) {
	this.charid = Number(node.getAttribute('charid'));
	this.desc = node.getAttribute('desc');
	this.title = node.getAttribute('name');
	this.picurl = node.getAttribute('picurl');
	this.restricted = false;
}

// CORE Functions //

/* Function that creates a pseudo group entry for the times cache fails
 * @param gid GroupId of the non existing group
 */
function createPseudoGroupEntry(gid) {
	var newGroupEntry = new cloneObject(groups[0]);
	newGroupEntry.id = gid;
	groups[gid] = newGroupEntry;
}

/* Processes a node to extract Custom (user) information
 * @param node Node to process
 * @return boolean (true if processing succeful, false otherwise)
 */
function parseCustom(node) {
	if (!node) return false; // no nodes return;
	for (var nd = 0; nd < node.length; nd++) { // find the right custom entry
		if (node[nd].parentNode.nodeName == 'root') { node = node[nd]; break; }
	}
	if (node.length > 1 || node.parentNode.nodeName != 'root') return; 
	uid = Number(node.getAttribute('uid')) || 0;
	mod = Number(node.getAttribute('mod')) || 0;
	for (var i = 0; i < node.childNodes.length; i++) {
		childNode = node.childNodes.item(i);
		if (childNode.nodeType == 3) continue;
		switch (childNode.nodeName) {
			case 'langverifier':
				var langNodes = childNode.getElementsByTagName('lang');
				for (m = 0; m < langNodes.length; m++) {
					verifiesLanguage[m] = nodeData(langNodes[m]);
				}
			case 'mylist':
				var mylistNodes = childNode.getElementsByTagName('file');
				for (m = 0; m < mylistNodes.length; m++) {
					var mylistNode = mylistNodes[m];
					mylistEntry = new CMylistEntry(mylistNode);
					mylist[mylistEntry.fileId] = mylistEntry;
					var ep = episodes[mylistEntry.episodeId];
					if (ep && mylistEntry.seenDate) ep.seenDate = mylistEntry.seenDate;
					// now do the same thing for related episodes
					for (var e = 0; e < mylistEntry.relatedEids.length; e++) {
						var episode = episodes[mylistEntry.relatedEids[e]];
						if (episode && mylistEntry.seenDate && !episode.seenDate) episode.seenDate = mylistEntry.seenDate;
					}
					var group = groups[mylistEntry.groupId];
					if (group) group.visible = true;
				}
				var mylistNodes = childNode.getElementsByTagName('group');
				for (m = 0; m < mylistNodes.length; m++) {
					var mylistNode = mylistNodes[m];
					var gid = Number(mylistNode.getAttribute('id'));
					var group = groups[gid];
					if (group) group.isInMylistRange = nodeData(mylistNode.getElementsByTagName('inmylist')[0]);
				}
				break;
			case 'ratings': // taking care of both episode votes and group ratings
				var groupVotes = childNode.getElementsByTagName('group');
				var episodeVotes = childNode.getElementsByTagName('ep');
				for (var gv = 0; gv < groupVotes.length; gv++) { // Group rating entries
					var gvote = groupVotes[gv];
					var urating = nodeData(gvote);
					var agid = gvote.getAttribute('agid');
					var gid = aGroups[agid] ? aGroups[agid].gid : 0;
					var group = groups[gid];
					if (group) group.userRating = urating;
				}
				for (var ev = 0; ev < episodeVotes.length; ev++) {
					var evote = episodeVotes[ev];
					var vote = nodeData(evote);
					var eid = evote.getAttribute('id');
					episodes[eid].vote = vote;
				}
				break;
			case 'config': parseConfig(childNode); break;
			default: showAlert('Options',node.nodeName,node.nodeName,childNode.nodeName);
		}
	}
	return true;
}

/* Function to parse configuration options
 * @param node Config node
 * @return void Options will be set
 */
function parseConfig(node) {
	for (var i = 0; i < node.childNodes.length; i++) {
		var sNode = node.childNodes.item(i);
		if (sNode.nodeType == 3) continue;
		switch (sNode.nodeName) {
			case 'epp': preferredEntriesPerPage = parseInt(nodeData(sNode)) || 25; break;
			case 'settings':
				var lay = Number(nodeData(sNode)) || 0;
				config[sNode.nodeName] = new Array();
				var optionNodes = sNode.getElementsByTagName('option');
				for (var j = 0; j < optionNodes.length; j++) {
					config[sNode.nodeName][nodeData(optionNodes[j])] = true;
				}
				break;
			case 'animelang':
				for (var j = 0; j < sNode.childNodes.length; j++) {
					var dNode = sNode.childNodes.item(j);
					switch (dNode.nodeName) {
						case 'lang': animeTitleLang = nodeData(dNode); animeAltTitleLang = dNode.getAttribute('alt') || 'en'; break;
						default: showAlert('Options',sNode.nodeName,sNode.nodeName,dNode.nodeName);
					}
				}
				break;
			case 'eplang':
				for (var j = 0; j < sNode.childNodes.length; j++) {
					var dNode = sNode.childNodes.item(j);
					switch (dNode.nodeName) {
						case 'lang': episodeTitleLang = nodeData(dNode); episodeAltTitleLang = dNode.getAttribute('alt') || 'x-jat'; break;
						default: showAlert('Options',sNode.nodeName,sNode.nodeName,dNode.nodeName);
					}
				}
				break;
			case 'filealang':
				for (var j = 0; j < sNode.childNodes.length; j++) {
					var dNode = sNode.childNodes.item(j);
					switch (dNode.nodeName) {
						case 'lang': filterAudLang.push(nodeData(dNode)); break;
						default: showAlert('Options',sNode.nodeName,sNode.nodeName,dNode.nodeName);
					}
				}
				break;
			case 'fileslang':
				for (var j = 0; j < sNode.childNodes.length; j++) {
					var dNode = sNode.childNodes.item(j);
					switch (dNode.nodeName) {
						case 'lang': filterSubLang.push(nodeData(dNode)); break;
						default: showAlert('Options',sNode.nodeName,sNode.nodeName,dNode.nodeName);
					}
				}
				break;
			case 'ed2k': break;
			default: showAlert('Options','config',sNode.nodeName,dNode.nodeName);
		}
	}
}

/* Processes a node to extract group information
 * @param node Node to process
 * @param aid Anime ID of group data
 * @return void (sets groups)
 */
function parseGroups(node,aid) {
	if (!node) return false; // no nodes return;
	for (var nd = 0; nd < node.length; nd++) { // find the right groups entry
		if (node[nd].parentNode.nodeName == 'anime') { node = node[nd]; break; }
	}
	if (node.length > 1 || node.parentNode.nodeName != 'anime') return;
	var groupNodes = node.getElementsByTagName('group');
	var anime = animes[aid];
	for (var i = 0; i < groupNodes.length; i++) {
		var childNode = groupNodes[i];
		var groupEntry = new CGroupEntry(childNode);
		var aGroupEntry = {'id': groupEntry.agid, 'gid': groupEntry.id};
		groups[groupEntry.id] = groupEntry;
		aGroups[aGroupEntry.id] = aGroupEntry;
		if (anime.groups.indexOf(groupEntry.id) < 0) anime.groups.push(groupEntry.id);
		if (!isNaN(Number(groupEntry.lastEp)) && Number(groupEntry.lastEp) > anime.highestEp) anime.highestEp = groupEntry.lastEp;
		if (seeDebug) updateStatus('processed group '+(i+1)+' of '+groupNodes.length);
	}
	// create the "no group" group entry
	var groupEntry = new Object();
	groupEntry.id = groupEntry.agid = 0;
	groupEntry.name = "no group";
	groupEntry.shortName = "no group";
	groupEntry.visible = true;
	groupEntry.rating = '-';
	groupEntry.ratingCount = groupEntry.commentCount = 0;
	groupEntry.userRating = -1;
	groupEntry.sepCnt = groupEntry.epCnt = 0;
	groupEntry.isInMylistRange = '';
	groupEntry.epRange = '';
	groupEntry.audioLangs = groupEntry.subtitleLangs = new Array();
	groupEntry.state = 'unknown';
	groupEntry.stateId = 0;
	groupEntry.hasCherryBeenPoped = false;
	groupEntry.filtered = 0;
	groups[groupEntry.id] = groupEntry;
	anime.groups.push(0);
}

/* Processes a node to extract episode information
 * @param node Node to process
 * @param aid Anime ID of episode data
 * @param cntEps If set to true will count the number of normal episodes currently present in a given anime
 * @return void (sets episodes)
 */
function parseEpisodes(node,aid,cntEps) {
	if (!node) return false; // no nodes return;
	for (var nd = 0; nd < node.length; nd++) { // find the right episode entry
		if (node[nd].parentNode.nodeName == 'anime') { node = node[nd]; break; }
	}
	if (node.length > 1 || node.parentNode.nodeName != 'anime') return; 
	var epNodes = node.getElementsByTagName('ep');
	var epCnt = 0;
	for (var i = 0; i < epNodes.length; i++) {
		var childNode = epNodes[i];
		var episodeEntry = new CEpisodeEntry(childNode);
		episodeEntry.animeId = aid;
		if (cntEps && (episodeEntry.typeChar == 'N' || episodeEntry.typeChar == '')) epCnt++;
		episodes[episodeEntry.id] = episodeEntry;
		epOrder.push(episodeEntry.id);
		parseEpisode(childNode,aid);
		if (animes[aid].episodes.indexOf(episodeEntry.id) < 0) animes[aid].episodes.push(episodeEntry.epnoNum+'|'+episodeEntry.id);
		if (seeDebug) updateStatus('processed episode '+(i+1)+' of '+epNodes.length);
	}
	if (cntEps && epCnt > animes[aid].highestEp) animes[aid].highestEp = epCnt;
}

/* Processes a node to extract anime information
 * @param node Node to process
 * @return void (sets anime)
 */
function parseAnimes(node) {
	if (!node) return false; // no nodes return;
	var isAnimePage = (uriObj && uriObj['show'] && uriObj['show'].indexOf('anime') >= 0) ? true : false;
		for (var nd = 0; nd < node.length; nd++) { // find the right animes entry
		if (node[nd].parentNode.nodeName == 'root') { node = node[nd]; break; }
	}
	if (node.length > 1 || node.parentNode.nodeName != 'root') return; 
	var animeNodes = node.getElementsByTagName('anime');
	for (var i = 0; i < animeNodes.length; i++) {
		if (animeNodes[i].parentNode.nodeName != 'animes') continue; // there could be other anime nodes
		var childNode = animeNodes[i];
		var animeEntry = new CAnimeEntry(childNode);
		animes[animeEntry.id] = animeEntry;
		//if (isAnimePage) anime = animes[animeEntry.id]; // assigning a shortcut
		anime = animes[animeEntry.id]; // assigning a shortcut
		var groupNodes = childNode.getElementsByTagName('groups');
		parseGroups(groupNodes,animeEntry.id); // Parsing Groups
		var epNodes = childNode.getElementsByTagName('eps');
		parseEpisodes(epNodes,animeEntry.id,(animeEntry.eps == 0)); // Parsing Episodes
		// sort the episode list
		anime.episodes.sort(
			function sort(a,b) {
				var eno1 = Number(a.split('|')[0]);
				var eno2 = Number(b.split('|')[0]);
				if (eno1 < eno2) return -1;
				if (eno1 > eno2) return 1;
				return 0;
			}
		)
		for (var ai = 0; ai < anime.episodes.length; ai++) {
			anime.episodes[ai] = Number(anime.episodes[ai].split('|')[1]);
		}
		animeOrder.push(animeEntry.id); // This is need because Opera is a bad boy in for (elem in array)
		if (seeDebug) updateStatus('processed anime '+(i+1)+' of '+epNodes.length);
	}
}

/* Builds a fileEntry
 * @param node The node to parse
 * @param aid Anime Id
 * @param eid Episode Id
 * @return void (adds file to "files" and adds the file id to the ep.files list
 */
function buildFileEntry(node, aid, eid) {
	if (!node || !aid || !eid) return; // invalid call
	if (node.nodeName != 'file') return; // invalid node
	var fileEntry = new CFileEntry(node);
	var episode = episodes[eid];
	fileEntry.episodeId = eid;
	fileEntry.animeId = aid;
	if (files[fileEntry.id] && files[fileEntry.id].type == 'stub') { // In case we had a stub file, copy relevant entries
		var efile = files[fileEntry.id];
		for (var r in efile.epRelations)
			fileEntry.epRelations[r] = efile.epRelations[r];
		for (var r in efile.fileRelations)
			fileEntry.fileRelations[r] = efile.fileRelations[r];
		for (var r in efile.relatedFiles)
			fileEntry.relatedFiles[r] = efile.relatedFiles[r];
		for (var r in efile.relatedPS)
			fileEntry.relatedPS[r] = efile.relatedPS[r];
		for (var r in efile.relatedGroups)
			fileEntry.relatedGroups[r] = efile.relatedGroups[r];
	}
	if (fileEntry.epRelations.length) {	// got to test something first
		for (var fereid in fileEntry.epRelations) {
			if (fereid != fileEntry.episodeId) continue;
			fileEntry.isTrueVirtual = true;
			break;
		}
	}
	// special trick to fool cache issues
	if (!groups[fileEntry.groupId]) createPseudoGroupEntry(fileEntry.groupId);
	files[fileEntry.id] = fileEntry;
	if (!episode) return; // This only happens in case of an external file
	if (fileEntry.newFile) episode.newFiles = true;
	if (episode.files.indexOf(fileEntry.id) < 0) episode.files.push(fileEntry.id);
}

/* Processes a node to extract file information for a given episode
 * @param node Node to process
 * @param aid Anime ID of episode data
 * @return void (sets files)
 */
function parseEpisode(node, aid) {
	if (!node || node.parentNode.nodeName != 'eps') return;
	var eid = Number(node.getAttribute('id'));
	var fileNodes = node.getElementsByTagName('file');
	var episode = episodes[eid];
	var nodeTime = new Date();
	for (var i = 0; i < fileNodes.length; i++)
		buildFileEntry(fileNodes[i],aid, eid);
	if (seeTimes) 
		alert('Processing files for eid.'+eid+' took: '+(new Date() - nodeTime)+' ms');
}

/* Function that parses extra files, needed by relations
 * @param nodes Relation nodes
 * @return void (sets info for files)
 */
function parseExtraFiles(nodes,eid) {
	if (!nodes) return;
	for (var i = 0; i < nodes.length; i++) {
		//var fid = Number(nodes[i].getAttribute('id'));
		var eid = Number(nodes[i].getAttribute('eid'));
		var aid = Number(nodes[i].getAttribute('aid'));
		buildFileEntry(nodes[i], aid, eid);
	}
}

/* Function that parses file<->ep relations
 * @param nodes Relation nodes
 * @return void (sets info for files)
 */ 
function parseEpRelations(nodes) {
	if (!nodes) return;
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeName != 'rel') continue;
		var fid = Number(nodes[i].getAttribute('fid'));
		var eid = Number(nodes[i].getAttribute('eid'));
		var startp = Number(nodes[i].getAttribute('startp'));
		var endp = Number(nodes[i].getAttribute('endp'));
		var file = files[fid];
		var episode = episodes[eid];
		if (!file) { // can happen, the trick is to create a stub fileEntry
			var node = document.createElement('file');
			node.setAttribute('id',fid);
			node.setAttribute('type','stub');
			file = new CFileEntry(node);
			file.visible = false;
			files[fid] = file;
		}
		if (!episode) { if (seeDebug) alert('ERR.parseEpRelations: no episode'); continue; } // this realy should not happen
		if (episode.files.indexOf(fid) < 0) episode.files.push(fid); // add this file to the eps files
		file.epRelations[eid] = {"startp":startp,"endp":endp};
		if (file.episodeId == eid) file.isTrueVirtual = true;
	}
}

/* Function that parses file<->file relations
 * @param nodes Relation nodes
 * @return void (sets info for files)
 */ 
function parseFileRelations(nodes) {
	if (!nodes) return;
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeName != 'rel') continue;
		var fid = Number(nodes[i].getAttribute('fid'));
		var otherfid = Number(nodes[i].getAttribute('otherfid'));
		var type = nodes[i].getAttribute('type');
		if (pseudoFiles.create) {
			var found = false;
			for (var pfR in pseudoFiles.relations) {
				var rel = pseudoFiles.relations[pfR];
				if (((rel['fid'] == otherfid && rel['otherfid'] == fid) || (rel['fid'] == fid && rel['otherfid'] == otherfid)) && rel['type'] == type) { found = true; break; } 
			}
			if (!found) pseudoFiles.relations.push({"fid":fid,"otherfid":otherfid,"type":type,"resolved":false}); // Store this relation
		}
		var fileA = files[fid];
		var fileB = files[otherfid];
		if (!fileA) { // can happen, the trick is to create a stub fileEntry
			var node = document.createElement('file');
			node.setAttribute('id',fid);
			node.setAttribute('type','stub');
			fileA = new CFileEntry(node);
			fileA.visible = false;
			files[fid] = fileA;
		}
		if (!fileB) { // can happen, the trick is to create a stub fileEntry
			var node = document.createElement('file');
			node.setAttribute('id',otherfid);
			node.setAttribute('type','stub');
			fileB = new CFileEntry(node);
			fileB.visible = false;
			files[otherfid] = fileB;
		}
		var found = false;
		for (var fR in fileA.fileRelations) {
			var rel = fileA.fileRelations[fR];
			if (rel['dir'] == '=>' && rel['relfile'] == otherfid && rel['type'] == type) { found = true; break; }
		}
		if (!found) fileA.fileRelations.push({"dir":'=>',"relfile":otherfid,"type":type});
		if (fileA.relatedFiles.indexOf(otherfid) < 0) fileA.relatedFiles.push(otherfid);
		found = false;
		for (var fR in fileB.fileRelations) {
			var rel = fileB.fileRelations[fR];
			if (rel['dir'] == '<=' && rel['relfile'] == fid && rel['type'] == type) { found = true; break; }
		}
		if (!found) fileB.fileRelations.push({"dir":'<=',"relfile":fid,"type":type});
		if (fileB.relatedFiles.indexOf(fid) < 0) fileB.relatedFiles.push(fid);
		// deprecate files based on this
		if (type == 'newer-ver-of')
			fileB.isDeprecated = true;
	}
}

/* Processes a node to extract filedata information
 * @param node Node to process
 * @param aid Anime ID of episode data
 * @return void (sets files)
 */
function parseFiledata(node, aid) {
	if (!node || node.parentNode.nodeName != 'anime') return;
	var extraFiles = (node.getElementsByTagName('extrafiles').length) ? node.getElementsByTagName('extrafiles')[0].getElementsByTagName('file') : null;
	var fileRel = (node.getElementsByTagName('filerel').length) ? node.getElementsByTagName('filerel')[0].getElementsByTagName('rel') : null;
	var fileEpRel = (node.getElementsByTagName('fileeprel').length) ? node.getElementsByTagName('fileeprel')[0].getElementsByTagName('rel') : null;
	var nodeTime = new Date();
	parseExtraFiles(extraFiles);
	parseEpRelations(fileEpRel);
	parseFileRelations(fileRel);
	if (seeTimes) 
		alert('Processing filedata for aid.'+aid+' took: '+(new Date() - nodeTime)+' ms');
}

// PseudoFiles Functions //

var pseudoFiles = new Object();
pseudoFiles.create = false; // Should we create pseudo Files?
pseudoFiles.noHide = false; // Do we hide the original rows?
pseudoFiles.relations = new Array();	// Need this to hold a list of relations
pseudoFiles.sequence = -1; // Sequence Number
pseudoFiles.list = new Array(); // list of pseudoFiles 
pseudoFiles.listByEp = new Array(); // list of pseudoFiles stored by eid i.e.: pseudoFiles.list[eid] = {fileA,fileB} 
pseudoFiles.nextSequence = function nextSequence() {
	this.sequence++;
	return (this.sequence);
};

function makePseudoFile(fileA,fileB,type) {
	var found = false;
	var node = document.createElement('file');
	node.type = (fileA.type == fileB.type) ? fileA.type : 'pseudo';
	node.id = pseudoFiles.nextSequence();
	var file = new CFileEntry(node);
	file.pseudoFile = true;
	// FIX VALUES
	if (fileA.type == fileB.type) file.type = fileA.type;
	// Just so you know i tried with a switch, didn't work
	else if (type == 'external-sub-for') file.type = 'video';
	else if (type == 'newer-ver-of') file.type = 'other';
	else if (type == 'bundle') file.type = 'other';
	else if (type == 'op/end-for') file.type = 'video';
	else if (type == 'external-audio-for') file.type = 'video'; 
	else if (type == 'other') file.type = 'other';
	//alert('type of relation: '+type+'\nfileA.type: '+fileA.type+'\nfileB.type: '+fileB.type+'\nfile.type: '+file.type);
	file.animeId = (fileA.animeId == fileB.animeId) ? fileA.animeId : null;
	file.episodeId = (fileA.episodeId == fileB.episodeId) ? fileA.episodeId : null;
	file.crcStatus = (fileA.crcStatus == fileB.crcStatus) ? fileA.crcStatus : '';
	// Some tests
	if (file.relatedFiles.indexOf(fileA.id) < 0) file.relatedFiles.push(fileA.id);
	if (file.relatedFiles.indexOf(fileB.id) < 0) file.relatedFiles.push(fileB.id);
	if (file.relatedGroups.indexOf(fileA.groupId) < 0) file.relatedGroups.push(fileA.groupId);
	if (file.relatedGroups.indexOf(fileB.groupId) < 0) file.relatedGroups.push(fileB.groupId);
	// End of tests;
	file.size = fileA.size + fileB.size;
	file.date = (javascriptDate(fileA.date) > javascriptDate(fileB.date)) ? fileA.date : fileB.date;
	if (fileA.relDate > 0 || fileB.relDate > 0) {
		if (fileA.relDate > 0 && fileB.relDate > 0) file.relDate = (javascriptDate(fileA.relDate) > javascriptDate(fileB.relDate)) ? fileA.relDate : fileB.relDate;
		else if (fileA.relDate > 0) file.relDate = fileA.relDate;
		else if (fileB.relDate > 0) file.relDate = fileB.relDate;
		else file.relDate = 0;
	}
	file.length = fileA.length + fileB.length;
	file.groupId = (fileA.groupId == fileB.groupId) ? fileA.groupId : 0;
	file.version = (Number(fileA.version.charAt(1)) > Number(fileB.version.charAt(1))) ? fileA.version : fileB.version;
	file.isCensored = (fileA.isCensored == fileB.isCensored) ? fileA.isCensored : 0;
	file.isUncensored = (fileA.isUncensored == fileB.isUncensored) ? fileA.isUncensored : 0;
	if (fileA.type == 'video' || fileB.type == 'video') {
		if (fileA.type == 'video' && fileB.type == 'video')
		file.quality = (mapQuality(fileA.quality) > mapQuality(fileB.quality)) ? fileA.quality : fileB.quality;
		else file.quality = (fileA.type == 'video') ? fileA.quality : fileB.quality;
	} else file.quality = fileA.quality;
	if (fileA.resolution == fileB.resolution) file.resolution = fileA.resolution;
	else {
		if (fileA.resolution != 'unknown' || fileB.resolution	!= 'unknown' ) {
			if (fileA.resolution != 'unknown') file.resolution = fileA.resolution;
			else file.resolution = fileB.resolution;
		}
	}
	file.source = (fileA.source == fileB.source) ? fileA.source : 'unknown';
	file.usersTotal = fileA.usersTotal + fileB.usersTotal;
	file.usersUnknown = fileA.usersUnknown + fileB.usersUnknown;
	file.usersDeleted = fileA.usersDeleted + fileB.usersDeleted;
	file.vidCnt = (fileA.vidCnt || fileB.vidCnt) ? 1 : 0;
	file.audCnt = fileA.audCnt + fileB.audCnt;
	file.subCnt = fileA.subCnt + fileB.subCnt;
	file.newFile = (fileA.newFile || fileB.newFile) ? true : false;
	// This one is a bit dubious (i'm choosing the videoTrack of the file with the greatest version
	if (file.vidCnt) { 
		if (fileA.vidCnt && fileB.vidCnt)
			file.videoTracks = (Number(fileA.version.charAt(1)) > Number(fileB.version.charAt(1))) ? fileA.videoTracks : fileB.videoTracks;
		else if (fileA.vidCnt) file.videoTracks = fileA.videoTracks;
		else if (fileB.vidCnt) file.videoTracks = fileB.videoTracks;
	}
	if (file.audCnt) {
		for (var a = 0; a < fileA.audioTracks.length; a++)
			file.audioTracks.push(fileA.audioTracks[a]);
		for (var a = 0; a < fileB.audioTracks.length; a++)
			file.audioTracks.push(fileB.audioTracks[a]);
	}
	if (file.subCnt) {
		if (fileA.fileType != 'idx') { // Bogus no sub lang content files
			for (var s = 0; s < fileA.subtitleTracks.length; s++) file.subtitleTracks.push(fileA.subtitleTracks[s]);
		}
		if (fileB.fileType != 'idx') {
			for (var s = 0; s < fileB.subtitleTracks.length; s++) file.subtitleTracks.push(fileB.subtitleTracks[s]);
		}
	}
	if (file.crcStatus == 'valid') file.flags += 1;
	if (file.crcStatus == 'invalid') { file.flags += 2; this.isDeprecated = true; }
	if (file.version == 'v2') file.flags += 4;
	if (file.version == 'v3') file.flags += 8;
	if (file.version == 'v4') file.flags += 16;
	if (file.version == 'v5') file.flags += 32;
	if (file.isCensored) file.flags += 64;
	if (file.isUncensored) file.flags += 128;
	// Add this file to the pseudoFiles.list
	pseudoFiles.list[file.id] = file;
	fileA.relatedPS.push(file.id);
	fileB.relatedPS.push(file.id);
	if (file.episodeId) {
		if (!pseudoFiles.listByEp[file.episodeId]) pseudoFiles.listByEp[file.episodeId] = new Array();
		if (pseudoFiles.listByEp[file.episodeId].indexOf(file.id) < 0) pseudoFiles.listByEp[file.episodeId].push(file.id);
		if (episodes[file.episodeId].pseudoFiles.indexOf(file.id) < 0) episodes[file.episodeId].pseudoFiles.push(file.id);
	} else {
		if (!pseudoFiles.listByEp[fileA.episodeId]) pseudoFiles.listByEp[fileA.episodeId] = new Array();
		if (!pseudoFiles.listByEp[fileB.episodeId]) pseudoFiles.listByEp[fileB.episodeId] = new Array();
		if (pseudoFiles.listByEp[fileA.episodeId].indexOf(file.id) < 0) pseudoFiles.listByEp[fileA.episodeId].push(file.id);
		if (pseudoFiles.listByEp[fileB.episodeId].indexOf(file.id) < 0) pseudoFiles.listByEp[fileB.episodeId].push(file.id);
		if (episodes[fileA.episodeId].pseudoFiles.indexOf(file.id) < 0) episodes[fileA.episodeId].pseudoFiles.push(file.id);
		if (episodes[fileB.episodeId].pseudoFiles.indexOf(file.id) < 0) episodes[fileB.episodeId].pseudoFiles.push(file.id);
	}
}

/* Creates pseudoFiles
 * This is totaly magic, there is absolutely no reason why i should be doing this
 * @return void (creates a pseudoFile)
 */
function pseudoFilesCreator() {
	if (!pseudoFiles.create || (pseudoFiles.relations && !pseudoFiles.relations.length)) return; // Nothing to do
	for (var i = 0; i < pseudoFiles.relations.length; i++) {
		var rel = pseudoFiles.relations[i];
		var fid = rel['fid'];
		var otherfid = rel['otherfid'];
		var type = rel['type'];
		var fileA = files[fid];
		var fileB = files[otherfid];
		var resolved = rel['resolved'];
		if (resolved) continue;
		if (!fileA || !fileB) { if (seeDebug) alert('ERR.pseudoFilesCreator: borked files'); continue; } // this realy should not happen
		/*alert('working on relation of type: '+type+' for files\nfid: '+fid+'\notherfid: '+otherfid+
			'\nrelatedFile.relatedPS['+fileB.relatedPS.length+']: '+fileB.relatedPS);*/
		if (type == 'bundle') makePseudoFile(fileA,fileB,type);
		if (type == 'op/end-for' || type == 'external-sub-for' || type == 'external-audio-for') {
			var file = null;
			if (fileB.relatedPS && fileB.relatedPS.length) {
				for (var k = 0; k < fileB.relatedPS.length; k++) {
					//alert('searching pseudoFiles of fid '+fileB.id+' pF['+fileB.relatedPS[k]+'].type: '+pseudoFiles.list[fileB.relatedPS[k]].type);
					if (pseudoFiles.list[fileB.relatedPS[k]].type == 'video') { file = pseudoFiles.list[fileB.relatedPS[k]]; break; }
				}
				//if (file) alert('id['+(file.pseudoFile ? 'Y' : 'N')+']: '+file.id+' type: '+file.type); 
				if (!file) makePseudoFile(fileA,fileB,type);
				else {
					if (type == 'external-sub-for') {
						file.subCnt += fileA.subCnt;
						for (var k = 0; k < fileA.subtitleTracks.length; k++)
							file.subtitleTracks.push(fileA.subtitleTracks[k]);
					}
					if (type == 'external-aud-for') {
						file.audCnt += fileA.audCnt;
						for (var k = 0; k < fileA.audioTracks.length; k++)
							file.audioTracks.push(fileA.audioTracks[k]);
					}
					// if (type == 'op/end-for') Nothing should be done in this case
					file.usersTotal += fileA.usersTotal;
					file.usersUnknown += fileA.usersUnknown;
					file.usersDeleted += fileA.usersDeleted;
					file.size += fileA.size;
					if (file.relatedFiles.indexOf(fileA.id) < 0) file.relatedFiles.push(fileA.id);
					if (fileA.relatedPS.indexOf(file.id) < 0) fileA.relatedPS.push(file.id);
				}
			} else makePseudoFile(fileA,fileB,type);
		}
		pseudoFiles.relations[i]['resolved'] = true;
	}
	// make the rows
	for (var e in pseudoFiles.listByEp) {
		var epFileTable = document.getElementById('episode'+e+'files');
		if (!epFileTable) { if (seeDebug) alert('ERR.pseudoFilesCreator: no fileTable'); continue; }
		for (var k in pseudoFiles.listByEp[e]) {
			var curPF = document.getElementById('rfid_'+pseudoFiles.listByEp[e][k]+'_eid_'+e);
			if (!curPF)
				epFileTable.tBodies[0].appendChild(createFileTableRow(episodes[e],pseudoFiles.list[pseudoFiles.listByEp[e][k]]));
		}
	}
}

// FILTERING Functions //

var filterObj = new Object();
filterObj.useDefaultFilters = false;
filterObj.processingFiles = new Array(); // Auxiliar object that holds temporary results
/* RULES */
filterObj.defaultUnfiltered = {0:2,
								1:{"fdate":"<,172800"},
								2:{"ftype":"==,generic"}};
filterObj.unfiltered = filterObj.defaultUnfiltered;
filterObj.defaultDeprecated = {0:5,
							1:{"eusers":">=,50","fusers":"<=,3","fcrc":"!=,valid"},
							2:{"fcrc":"==,invalid"},
							3:{"fqual":">,1","fqual":"<=,5"},
							4:{"c_sf_fgroup":"==,this","c_rf_fsource":"==,this","c_rf_fversion":"==,this","c_rf_fextension":"==,this","c_rf_fcrc":"==,valid","fcrc":"!=,valid","fgroup":"!=,0"},
							5:{"c_sf_fgroup":"==,this","c_rf_fsource":"==,this","c_rf_fversion":">,this","c_rf_fextension":"==,this","c_rf_fcrc":"==,valid","fgroup":"!=,0"}}
filterObj.deprecated = filterObj.defaultDeprecated;
filterObj.defaultVisible = {0:5,
							1:{"fdeprecated":"==,true"},
							2:{"finmylist":"==,true"},
							3:{"fusers":">=,50"},
							4:{"fdate":"<,604800"},
							5:{"efvisible":"<,1"}};
filterObj.visible = filterObj.defaultVisible;
filterObj.defaultHidden = {0:4,
							1:{"falang":"==,obj.filterAudLang"},
							2:{"fslang":"==,obj.filterSubLang"},
							3:{"fraw":"==,HIDERAWS"},
							4:{"fgroupfiltered":"==,HIDEFILTEREDGROUPS"}};
filterObj.hidden = filterObj.defaultHidden;
/* AUXILIAR COMPARE FUNCTION */
filterObj.compare = function compare(symbol, a, b) {
	switch (symbol) {
		case '>' : return (a >	b);
		case '<' : return (a <	b);
		case '<=': return (a <= b);
		case '>=': return (a >= b);
		case '==': return (a == b);
		case '!=': return (a != b);
	}
	return 0;
};
/* TEST FUNCTIONS */
filterObj['fdate'] = function fdate(file,symbol,value,rthis) {
	var curDate = Number(new Date()) / 1000;
	var fDate = Number(javascriptDate(cTimeDate(file.date))) / 1000;
	if (rthis) return (fDate);
	return (filterObj.compare(symbol, curDate - fDate, value));
};
filterObj['eusers'] = function eusers(file,symbol,value,rthis) {
	var episode = episodes[file.episodeId];
	if (!episode) return false;
	if (rthis) return (episode.userCount);
	return (filterObj.compare(symbol, episode.userCount, value));
};
filterObj['fusers'] = function fusers(file,symbol,value,rthis) {
	if (rthis) return (file.usersTotal);
	return (filterObj.compare(symbol, file.usersTotal, value));
};
filterObj['fcrc'] = function fcrc(file,symbol,value,rthis) {
	if (rthis) return (file.crcStatus);
	return (filterObj.compare(symbol, file.crcStatus, value));
};
filterObj['fqual'] = function fqual(file,symbol,value,rthis) {
	if (rthis) return (mapQuality(file.quality));
	return (filterObj.compare(symbol, mapQuality(file.quality), value));
};
filterObj['fgroup'] = function fgroup(file,symbol,value,rthis) {
	if (rthis) return (file.groupId);
	return (filterObj.compare(symbol, file.groupId, value));
};
filterObj['fversion'] = function fversion(file,symbol,value,rthis) {
	if (rthis) return (file.version);
	return (filterObj.compare(symbol, file.version, value));
};
filterObj['finmylist'] = function finmylist(file,symbol,value,rthis) {
	if (rthis) return ((mylist[file.id]) ? true : false);
	return (filterObj.compare(symbol, (mylist[file.id]) ? true : false, value));
};
filterObj['efvisible'] = function efvisible(file,symbol,value,rthis) {
	var episode = episodes[file.episodeId];
	if (!episode) return false;
	if (rthis) return (episode.fileCount - episode.hiddenFiles);
	return (filterObj.compare(symbol, episode.fileCount - episode.hiddenFiles, value));
};
filterObj['falang'] = function falang(file,symbol,value,rthis) {
	if (rthis) return (false);
	if (file.audioTracks && !file.audioTracks.length) return false;
	var isInStream = false;
	if (value == 'obj.filterAudLang') {
		if (!filterAudLang.length) return (false);
		for (var al = 0; al < filterAudLang.length; al++) {
			for (var fal = 0; fal < file.audioTracks.length; fal++) {
				if (filterObj.compare(symbol, file.audioTracks[fal].lang, filterAudLang[al])) return (false);
			}		
		}
		return (true);
	} else {
		for (var fal = 0; fal < file.audioTracks.length; fal++) {
			if (filterObj.compare(symbol, file.audioTracks[fal].lang, value)) return (false);
		}
		return (true);
	}
	return (false);		
};
filterObj['fslang'] = function fslang(file,symbol,value,rthis) {
	if (rthis) return (false);
	if (file.subtitleTracks && !file.subtitleTracks.length) return false;
	var isInStream = false;
	if (value == 'obj.filterSubLang') {
		if (!filterSubLang.length) return (false);
		for (var sl = 0; sl < filterSubLang.length; sl++) {
			for (var fsl = 0; fsl < file.subtitleTracks.length; fsl++) {
				if (filterObj.compare(symbol, file.subtitleTracks[fsl].lang, filterSubLang[sl])) return (false);
			}		
		}
		return (true); // not found
	} else {
		for (var fsl = 0; fsl < file.subtitleTracks.length; fsl++) {
			if (filterObj.compare(symbol, file.subtitleTracks[fsl].lang, value)) return (false);
		}
		return (true); // not found
	}
	return (false);		
};
filterObj['ftype'] = function ftype(file,symbol,value,rthis) {
	if (rthis) return (file.type);
	return (filterObj.compare(symbol, file.type, value));
};
filterObj['fsource'] = function fsource(file,symbol,value,rthis) {
	if (rthis) return (file.source);
	return (filterObj.compare(symbol, file.source, value));
};
filterObj['fextension'] = function fextension(file,symbol,value,rthis) {
	if (rthis) return (file.fileType);
	return (filterObj.compare(symbol, file.fileType, value));
};
filterObj['fdeprecated'] = function fdeprecated(file,symbol,value,rthis) {
	if (rthis) return (file.isDeprecated);
	return (filterObj.compare(symbol, file.isDeprecated, value));
};
filterObj['fraw'] = function fraw(file,symbol,value,rthis) {
	if (rthis) return (file.isRaw);
	if (config['settings']['HIDERAWS'] && file.isRaw) return true;
	else return false;
	//return (filterObj.compare(symbol, file.isRaw, !HIDERAWS));
};
filterObj['fgroupfiltered'] = function fgroupfiltered(file,symbol,value,rthis) {
	var group = groups[file.groupId];
	if (!group) return false;
	if (rthis) return (group.filtered);
	return (filterObj.compare(symbol, group.filtered, config['settings']['HIDEFILTEREDGROUPS']));
};
filterObj['hidefiles'] = function hidefiles(file,symbol,value,rthis) {
	return (config['settings']['HIDEFILES'] == (value == 'true' ? true : false));
};

/* PROCESSING FUCTIONS */
filterObj.processFile = function processFile(file, operation) {
	if (!file) return false;
	var episode = episodes[file.episodeId];
	if (!episode) return false;
	var work;
	switch (operation) {
		case 'deprecated': if (filterObj.useDefaultFilters) work = filterObj.deprecated; else work = filterObj.defaultDeprecated; break;
		case 'unfiltered': if (filterObj.useDefaultFilters) work = filterObj.unfiltered; else work = filterObj.defaultUnfiltered; break;
		case 'visible': if (filterObj.useDefaultFilters) work = filterObj.visible; else work = filterObj.defaultVisible; break;
		case 'hidden': if (filterObj.useDefaultFilters) work = filterObj.hidden; else work = filterObj.defaultHidden; break;
		default: return;
	}
	for (var r = 1; r <= work[0]; r++) {
		var priority = work[r];
		filterObj.processingFiles = new Array();
		var rulePrResult = null;
		for (rule in priority) {
			var initRule = (rule.indexOf('c_sf_') >= 0 || rule.indexOf('c_rf_') >= 0) ? rule.indexOf('c_')+5 : 0; 
			var ruleName = rule.substr(initRule,rule.length);
			if (!filterObj[ruleName]) return; // INVALID RULENAME!!!!
			var sf = (rule.indexOf('c_sf_') >= 0) ? true : false;
			var rf = (rule.indexOf('c_rf_') >= 0) ? true : false;
			var symbol = priority[rule].split(',')[0];
			var value = priority[rule].split(',')[1];
			if (value == 'this') value = filterObj[ruleName](file,symbol,value,true);
			var ret;
			if (sf) {
				for (var lf = 0; lf < episode.files.length; lf++) {
					if (episode.files[lf] == file.id) continue;
					if (filterObj[ruleName](files[episode.files[lf]],symbol,value)) filterObj.processingFiles.push(episode.files[lf]);
				}
			} else if (rf) {
				var result = new Array();
				for (var lf = 0; lf < filterObj.processingFiles.length; lf++) {
					if (filterObj[ruleName](files[filterObj.processingFiles[lf]],symbol,value)) result.push(filterObj.processingFiles[lf]);
				}
				filterObj.processingFiles = result;
				if (filterObj.processingFiles && filterObj.processingFiles.length) {
					if (rulePrResult == null) rulePrResult = true;
					rulePrResult = rulePrResult & true;
				} else {
					if (rulePrResult == null) rulePrResult = false;
					rulePrResult = rulePrResult & false;
				}
			} else {
				ret = filterObj[ruleName](file,symbol,value);
				if (rulePrResult == null) rulePrResult = ret;
				rulePrResult = rulePrResult & ret;
			}
		}
		if (rulePrResult) {
			switch (operation) {
				case 'deprecated': file.isDeprecated = true; return file.isDeprecated;
				case 'unfiltered': file.isDeprecated = false; return file.isDeprecated;
				case 'visible': file.visible = true; return file.visible;
				case 'hidden': file.visible = false; return file.visible;
				default: return;
			}
		}
	}
	switch (operation) {
		case 'deprecated': 
		case 'unfiltered': return file.isDeprecated;
		case 'visible': 
		case 'hidden': return file.visible;
		default: return;
	}
};
filterObj.markDeprecated = function markDeprecated(file) {
	if (file.isDeprecated) return true;
	return (filterObj.processFile(file,'deprecated'));
}
filterObj.markUnfiltered = function markUnfiltered(file) {
	return (filterObj.processFile(file,'unfiltered'));
}
filterObj.markVisible = function markVisible(file) {
	// only do this step if HIDEFILES is set
	if (config['settings']['HIDEFILES']) return (filterObj.processFile(file,'visible'));
	else {
		file.visible = true;
		return true;
	}
}
filterObj.markHidden = function markHidden(file) {
	return (filterObj.processFile(file,'hidden'));
}
