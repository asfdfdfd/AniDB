/* *
 * @file Utilities
 * @author fahrenheit (alka.setzer@gmail.com)
           some code derived from work by PetriW and Rar at anidb
 * @version 2.1 (22.03.2007)
 */

// TIME/DATE FUNCTIONS //

function padLeft(text, padChar, count) {
  var result = '';
  text = new String(text);
  while (text.length + result.length < count) {
    result += result + padChar;
  }
  return (result + text);
}
function padRight(text, padChar, count) {
  var result = '';
  text = new String(text);
  while (text.length + result.length < count) {
    result += result + padChar;
  }
  return (text + result);
}

/* *
 * Function that converts UTC TIME/UNIXTIME date format to a string
 * @param data The date to convert
 * @return A string with the date
 */
function convertTime(data) {
  if (!data) return;
  if (data.indexOf('T') >= 0) 
    return (data.split('T').join(" "));
  else if (data.indexOf('-') >= 0 && data.indexOf(' ') < 0)
    return data;
  else if (data.indexOf(' ') >= 0)
		return data;
	else {
    var datetime = new Date(data * 1000);
		if (datetime) return data;
    return (datetime.getFullYear() + '-' + padLeft(datetime.getMonth()+1, '0', 2) + '-' + padLeft(datetime.getDate(), '0', 2));
  }
}

/* *
 * Function that converts given date to javascript a Date object
 * @param data The date to convert
 * @return A Date object
 */
function javascriptDate(data) {
  if (!data) return;
  if (data.indexOf('T') >= 0) { // UTC time
    var date = data.split('T')[0].split('-');
    var time = data.split('T')[1].split(':');
    return new Date(Number(date[0]),Number(date[1])-1,Number(date[2]),Number(time[0]),Number(time[1]),Number(time[2]));
  } else if (data.indexOf('-') >= 0 && data.indexOf(' ') >= 0 && data.indexOf(':') >= 0) {
    var date = data.split(' ')[0].split('-');
    var time = data.split(' ')[1].split(':');
    return new Date(Number(date[0]),Number(date[1])-1,Number(date[2]),Number(time[0]),Number(time[1]),Number(time[2]));
  } else if (data.indexOf('.') >= 0 && data.indexOf(' ') < 0 && data.indexOf(':') < 0) {
    var date = data.split('.');
    return new Date(Number(date[2]),Number(date[1])-1,Number(date[0]));
  } else if (data.indexOf('.') >= 0 && data.indexOf(' ') >= 0 && data.indexOf(':') >= 0) {
    var date = data.split(' ')[0].split('.');
    var time = data.split(' ')[1].split(':');
    return new Date(Number(date[2]),Number(date[1])-1,Number(date[0]),Number(time[0]),Number(time[1]),Number(time[2]));
  } else
    return datetime = new Date(data * 1000); // UNIX time format
}

/* *
 * This function returns a Date of UTC time date
 * @param data The date
 * @return Date in the format of dd.mm.yyyy
 */
function cTimeDate(data) {
  if (!data) return;
  if (data.indexOf(' ') >= 0 && data.indexOf('-') >= 0) {
    data = data.split(' ')[0];
    data = data.split('-')[2] + '.' + data.split('-')[1] + '.' + data.split('-')[0];
    return (data);
	} else if (data.indexOf('-') < 0 && data.indexOf(' ') >= 0) {
		return (data.split(' ')[0]);
  } else if (data.indexOf('-') >= 0 && data.indexOf(' ') < 0) {
    data = data.split('-')[2] + '.' + data.split('-')[1] + '.' + data.split('-')[0];
    return (data);
  } else return(data);
}
/* *
 * This function returns a Hour of UTC time date
 * @param data The date
 * @return Date in the format of hh:mm:ss
 */
function cTimeHour(data) {
  if (!data) return;
  if (data.indexOf(' ') >= 0) return (data.split(' ')[1]);
  else if (data.indexOf(':') >= 0 && data.indexOf(' ') < 0) return(data);
  else return(data);
}

// DOM NODE FUNCTIONS //

/* *
 * Returns the nodeValue of a given node
 * @param node The node where to extract information
 * @return String containing node data
 */
function nodeData(node) { 
  try { return node.childNodes.item(0).nodeValue; } 
  catch(e) { return ''; }
}

// STUB //
function doNothing() { return false; }

/* *
 * Debug function that shows the dom tree of a node
 * @param node The node to show the tree
 * @return void (shows an alert box)
 */
function goDeepDOMtree(node,level) {
  if (!node.childNodes.length) return (node.nodeValue);
  var spacing = '';
  for (var k = 0; k < level; k++) spacing += '..';
  var out = spacing +'<'+node.nodeName+'>';
  for (var i = 0; i < node.childNodes.length; i++){
    var sNode = node.childNodes[i];
    if (sNode.childNodes && sNode.childNodes.length) out += '\n';
    out += goDeepDOMtree(sNode,level+1);
    if (sNode.childNodes && sNode.childNodes.length) out += spacing;
  }
  out += '</'+node.nodeName+'>\n';
  return out;
} 

function showDOMtree(node) {
  var out = '<'+node.nodeName+'>\n';
  for (var i = 0; i < node.childNodes.length; i++){
    var sNode = node.childNodes[i];
    out += goDeepDOMtree(sNode,1);
  }
  out += '</'+node.nodeName+'>';
  alert(out);
}

/* *
 * Function that parses HMTL text and converts it to DOM nodes
 * @param source Text to convert
 * @return a SPAN containing the converted text
 */
function convertStringToDom(source) {
	var span = document.createElement('SPAN');
	// yeah, yeah.. I know i shouldn't be using innerHTML but it's a pain otherwise
	span.innerHTML = convert_input(source);
	return span;
}

/* *
 * Function that searches a HTMLCollection Object for an element
 * with a specific class name
 * @param nodes The nodes
 * @param name The name of the class to find
 * @param useIndexOf If true will use a indexOf(name) >= 0 to search
 * @return requested node(s)
 */
function getElementsByClassName(nodes, name, useIndexOf) {
  var ret = new Array();
  for (var i = 0; i < nodes.length; i++) {
    if (!useIndexOf) { if (nodes[i].className == name) ret.push(nodes[i]); }
    else { if (nodes[i].className.indexOf(name) >= 0 ) ret.push(nodes[i]); }
  }
  return ret;
}

/* *
 * Function that searches a HTMLCollection Object for an element
 * with a specific name
 * @param nodes The nodes
 * @param sname The name of the class to find
 * @param useIndexOf If true will use a indexOf(name) >= 0 to search
 * @return requested node(s)
 */
function getElementsByName(nodes, sname, useIndexOf) {
  var ret = new Array();
  for (var i = 0; i < nodes.length; i++) {
    if (!useIndexOf) { if (nodes[i].name == sname) ret.push(nodes[i]); }
    else { if (nodes[i].name.indexOf(sname) >= 0 ) ret.push(nodes[i]); }
  }
  return ret;
}

/* *
 * Function that returns elements of given tag name for the given node only
 * @param node The node
 * @param tag The nodeName of the node.childNodes elements to find
 * @return requested node(s)
 */
function getNodeElementsByTagName(node, tag) {
  var ret = new Array();
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].nodeName == tag) ret.push(node.childNodes[i]);
  }
  return ret;
}

/* *
 * Creates icons
 * @param parentNode ParenteNode of the newly created icon or null if want return
 * @param text Text
 * @param url HREF
 * @param onclick Onclick action
 * @param title ALT and Title attribute
 * @param cname Class name
 */
function createIcon(parentNode, text, url, onclick, title, className) {
  var obj;
  if (url == '' || url == null) obj = document.createElement('SPAN');
  else {
    obj = document.createElement('A');
    obj.href = url;
  }
  if (onclick != null || onclick != '') obj.onclick = onclick;
  if (text != null) obj.appendChild(document.createTextNode(text));
  if (title != null || title != '') {
    obj.title = title;
    obj.alt = title;
  }
  if (className != null && className != '') obj.className = 'i_icon '+className;
  if (parentNode != null && parentNode != '') parentNode.appendChild(obj);
  else return(obj);
}

function createLink(parentNode, text, url, rel, onclick, title, className) {
  var obj = createIcon('', text, url, onclick, title, className);
  if (rel == '' || rel == null) obj.rel = rel;
  if (className != null || className != '') obj.className = className;
  if (parentNode != null && parentNode != '') parentNode.appendChild(obj);
  else return(obj);
}

/* *
 * Creates a SELECT option element
 * @param parentNode ParenteNode of the newly created option or null if want return
 * @param text Text for the option
 * @param value Value of the option
 * @param isSelected Should this option be selected
 */
function createSelectOption(parentNode, text, value, isSelected) {
  var obj = document.createElement('OPTION');
  if (text != null) obj.appendChild(document.createTextNode(text));
  if (value != null) obj.value = value;
  if (isSelected) obj.selected = true;
  if (parentNode != null && parentNode != '') parentNode.appendChild(obj);
  else return(obj);
}

function createCheckbox(name,checked) {
  var ck = document.createElement('INPUT');
  ck.type = 'checkbox';
  ck.name = name;
  if (checked != null) ck.checked = checked;
  return ck;
}

function createSelect(base,name,id) {
  var select = document.createElement('SELECT');
  select.name = name;
  select.size = 1;
  if (id != null) select.id = id;
  for (var i = 0; i < base.options.length; i++) {
    var option = document.createElement('OPTION');
    if (base.options[i].selected) option.selected = true;
    option.value = base.options[i].value;
    option.appendChild(document.createTextNode(base.options[i].text));
    select.appendChild(option);
  }
  return select;
}

function createTextInput(name,size,disabled,hidden) {
  var input = document.createElement('INPUT');
  if (!hidden) input.type = 'text';
  else input.type = 'hidden';
  input.name = name;
  if (size != null) input.size = size;
  if (disabled != null) input.disabled = disabled;
  return input;
}

function createBasicSelect(name,id,onchange) {
	var select = document.createElement('SELECT');
	if (name && name != '') select.name = name;
	if (id && id != '') select.id = id;
	if (onchange && onchange != '') select.onchange = onchange;
	return select;
}

function createLanguageSelect(parentNode,name,id,onchange,selected) {
	var select = createBasicSelect(name,id,onchange);
	for (var lang in languageMap) {
		var option = document.createElement('OPTION');
		var op = languageMap[lang];
		option.text = op['name'];
		option.value = lang;
		if (lang == selected) option.selected = true;
		select.appendChild(option);
	}
	if (parentNode && parentNode != '') parentNode.appendChild(select);
	else return select;
}

function createSelectArray(parentNode,name,id,onchange,selected,optionArray) {
	var select = createBasicSelect(name,id,onchange);
	for (var opt in optionArray) {
		var option = document.createElement('OPTION');
		var op = optionArray[opt];
		createSelectOption(select,op['text'], opt, (opt == selected));
	}
	if (parentNode && parentNode != '') parentNode.appendChild(select);
	else return select;
}

function createCheckBox(parentNode,name,id,onchange,checked) {
	var ck = document.createElement('INPUT');
	ck.type = 'checkbox';
	if (name && name != '') ck.name = name;
	if (id && id != '') ck.id = id;
	if (onchange && onchange != '') ck.onchange = onchange;
	if (checked) ck.checked = true;
	if (parentNode && parentNode != '') parentNode.appendChild(ck);
	else return ck;
}

function makeBar(parentNode,start,end,total,map) {
  var mult = 1;
  if ( total > 0 && 192 / total >= 1) mult = 192 / total;

  var width = 1 + end - start;
  var img = document.createElement('IMG');
  img.src = 'http://static.anidb.net/pics/anidb_bar_h_'+map['img']+'.gif';
  img.width = ( width * mult );
  img.height = 10;
  img.title = img.alt = '';
  if (parentNode != null || parentNode != '') parentNode.appendChild(img);
  else return img;
}

function makeCompletionBar(parentNode, range, maps) {
  var len = range.length;
  if ( len > 300 ) len = 300;
  var span = document.createElement('SPAN');
  span.className = 'range eps';
  if (maps[1]['use'] || maps[2]['use']) {
    span.setAttribute('anidb:data',maps);
    span.onmouseout = hideTooltip;
    span.onmouseover = function onmouseover(event) {
      var node = document.createElement('DIV');
      if (maps[1]['use']) node.appendChild(document.createTextNode(maps[1]['desc']));
      if (maps[1]['use'] && maps[2]['use']) node.appendChild(document.createElement('BR')); 
      if (maps[2]['use']) node.appendChild(document.createTextNode(maps[2]['desc']));
      setTooltip(node,true,'auto');
    }
  }

  for (var i=0; i < len; ) {
    var v = range[i];
    var k = i+1;
    while ( k < len && range[k] == v ) k++;
    if (!v) v=0;
    makeBar(span, i+1, k, len, maps[v] );
    i = k;
  }
  if (parentNode == null || parentNode == '') return span;
	else parentNode.appendChild(span);
}

function expandRange(range,limit,map,array) {
  if (!range && !array) return (new Array(limit));
  var rangeGroups = range.split(',');
  for (var r = 0; r < rangeGroups.length; r++) {
    var rangeGroup = rangeGroups[r];
    var rg = rangeGroup.split('-');
    if ( rg.length == 1 ) array[Number(rg[0])] = map['type'];
    else { for( var i = Number(rg[0]); i <= Number(rg[1]); i++) array[ i-1 ] = map['type']; }
  }
  return array;
}

// GENERAL FUNCTIONS //

/* *
 * Creates a cookie
 */
function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function delCookie(name) {
	createCookie(name,"",-1);
}

/* *
 * Function that expands/collapses ul's
 */
function toggleUL() {
	if (this.nodeName != 'UL') return;
	var lis = ul.getElementsByTagName('LI');
	var expand = (this.className.indexOf('t_expand') > -1) ? false : true;
	for (var i = 0; i < lis.length; i++) {
		if (!expand) lis[i].style.display = 'none';
		else lis[i].style.display = '';
	}
	if (!expand) this.className.replace('t_expand','t_fold');
	else this.className.replace('t_fold','t_expand');
	var div = this.getElementsByTagName('DIV')[0];
	if (!div || (div && div.className.indexOf('icons') <0)) return;
	while (div.childNodes.length) div.removeChild(div.childNodes[0]);
	var state = (!expand) ? 'plus' : 'minus';
	createIcon(div, (!expand) ? '[+]' : '[-]', null, toggleUL, (!expand) ? 'expand' : 'fold', 'i_'+state);
}

/* *
 * Function that initiates the toogle function
 */
function initToggle(node,defaultState) {
	if (node.nodeName != 'UL') return;
	// create the icon div
	var div = document.createElement('DIV');
	div.className = 'icons';
	var state = (defaultState == 'expand') ? 'plus' : 'minus';
	createIcon(div, (defaultState == 'expand') ? '[+]' : '[-]', null, toggleUL, defaultState, 'i_'+state);
	node.insertBefore(div,node.firstChild);
	node.className += ' t_' + (defaultState) ? defaultState : 'expand';
	if (defaultState != 'expand') { // collapse
		var lis = node.getElementsByTagName('LI');
		for (var i = 0; i < lis.length; i++) lis[i].style.display = 'none';
	}
}

/* *
 * Function that alerts the user for errors
 * @param func Name of the function
 * @param process 
 * @param pNode Parent node
 * @param cNode Child node (or currentNode)
 * @return void
 */
function showAlert(func, process, pNode, cNode) {
  if (cNode != '#text' && seeDebug)
  alert(func+
	      '\nProcessing: '+process+
	      '\nUnrecognized '+pNode+' node: '+cNode+
        '\nPlease warn your favorite moderator with this text message');
}

/* *
 * Function that parses the URI
 * return Object holding URI Data
 */
function parseURI() {
  var uri = "" + window.location;
  var obj = new Object();
	obj['basename'] = uri.substr(uri.lastIndexOf('/')+1,((uri.indexOf('?') >= 0) ? uri.indexOf('?') : uri.length));
  if (uri.indexOf('?') > -1) { // we have an URI
    var elems;
    if (uri.indexOf('#') >= 0) {
      elems = uri.substring(uri.indexOf('?')+1,uri.indexOf('#')).split('&');
      obj['#'] = uri.substring(uri.indexOf('#')+1,uri.length);
    } else elems = uri.substring(uri.indexOf('?')+1,uri.length).split('&');
  }
  for (i in elems) {
    var efield = String(elems[i]).split('=')[0];
    var evalue = String(elems[i]).split('=')[1];
    obj[efield] = evalue;
  }
  return obj;
}

/* *
 * Function that updates the URI
 * @param obj URI object
 * @return void (set's the URI)
 */
function updateURI(obj) {
  var uri = "" + window.location;
  var currentURI = uri.substring(0,uri.indexOf('?'));
  var initial = true;
  for (var field in obj) {
    if (field == '#') continue;
    if (!initial) currentURI += '&';
    else currentURI += '?';
    currentURI += field + '=' + obj[field];
  }
  if (obj['#']) currentURI += '#' + obj['#'];
  return (currentURI);
}

/* *
 * Function that clones an object
 * @param what The object to clone
 * @return usage: var x = new cloneObject(y);
 */
function cloneObject(what) {
  var i;
  for (i in what)
    this[i] = what[i];
}

/* *
 * Adds array push prototype to arrays if not defined
 */
function Array_push() {
  var A_p = 0;
  for (A_p = 0; A_p < arguments.length; A_p++) {
    this[this.length] = arguments[A_p];
  }
  return(this.length);
}
if (typeof Array.prototype.push == "undefined") {
  Array.prototype.push = Array_push;
}

/* *
 * Adds array shift prototype to arrays if not defined
 */
function Array_shift() {
  var A_s = 0;
  var response = this[0];
  for (A_s = 0; A_s < this.length-1; A_s++) {
    this[A_s] = this[A_s + 1];
  }
  this.length--;
  return(response);
}
if (typeof Array.prototype.shift == "undefined") {
  Array.prototype.shift = Array_shift;
}

/* *
 * This function is used to update the status of the Request
 * @param text Text to show
 * @return void
 */
function updateStatus(text,add) {
  try {
    if (document.getElementById('statusBox')) {
      var statusBox = document.getElementById('statusBox');
      if (!add) { 
        if (statusBox.firstChild) statusBox.removeChild(statusBox.firstChild);
        statusBox.appendChild(document.createTextNode(text)); 
      } else {
        statusBox.firstChild.nodeValue += text;
      }
    }
    else window.status = text;
  } catch (e) { }
}

/* *
 * Converts episode numbers from exp notation to interface notation
 * @param epno Episode Number to convert
 * @return converted episode number
 */
function epNoToString(epno) {
  var ret = Number(epno);
  if (isNaN(ret)) return epno;
  if (ret >= 10000) return 'O' + Number(ret - 10000);
  if (ret >= 4000 && ret < 10000) return 'P' + Number(ret - 4000);
  if (ret >= 3000 && ret < 4000) return 'T' + Number(ret - 3000);
  if (ret >= 2000 && ret < 3000) return 'C' + Number(ret - 2000);
  if (ret >= 1000 && ret < 2000) return 'S' + Number(ret - 1000);
  return ret;
}

/* *
 * This function formats the file size
 * @param size Size in bytes
 * @param force Should force LAY_FORMATFILESIZE?
 * @return Converted file size
 */
function formatFileSize(size,force) {
  var format = false;
  if (LAY_FORMATFILESIZE) format = LAY_FORMATFILESIZE;
  if (force) format = force;
  if (!format) {
    var aux = new String(size);
    var sz = new Array();
    for (var i = 0; i < aux.length; i++) sz.push(aux.charAt(i));
    aux = ''; 
    var i = sz.length - 1;
    while (i - 2 > 0) { i -= 2; sz.splice(i, 0, '.'); i--; }
    for (i = 0; i < sz.length; i++) aux += sz[i];
    return (aux);
  }
  var tsize = parseInt(size);
  if (tsize < 1000) return(tsize + ' B'); // Byte
  else {
    tsize = tsize / 1024;
    if (tsize < 1000) return(tsize.toFixed(2) + ' KB'); // kilobyte
    else { // megabyte
      tsize = tsize / 1024;
      return(tsize.toFixed(2) + ' MB');
    }
  }
}

/* *
 * This function formats a length to a given format
 * @param length Length in seconds
 * @param format The output format ['long'|'rounded']
 * @return Formated length
 */
function formatFileLength(length, format) {
  var tsec = length % 60;
  var tmin = Math.floor(length/60);
  tmin = tmin % 60;
  var thr = Math.floor(tmin/60);
  thr = thr % 60;
  var tday = Math.floor(thr/60);
  var output = '';
  if (format == 'long') {
    if (tday) output += tday + ':';
    if (thr) output += thr + ':';
    if (tmin) output += tmin + ':';
    output += tsec;
  } else { // format is 'rounded'
    var minutes = 0;
    if (tday) minutes = tday * 1440;
    if (thr) minutes += thr * 60;
    if (tmin) minutes += tmin;
    if (tsec > 29) minutes += 1;
    output = minutes+'m';
  }
  return output;
}

// QUALITY FUNCTIONS //

function buildQualityIcon(node,quality) {
  var qual = quality.replace(' ','');
	if (node == null || node == '') return createIcon(node, quality, null, null, 'quality: '+quality, 'i_rate_'+qual);
	else createIcon(node, quality, null, null, 'quality: '+quality, 'i_rate_'+qual);
}

// EPISODE Functions //

/* *
 * Finds and returns every mylist entry associated with a given eid
 * @param eid Episode id of the episode to find entries
 * @return Array with found entries
 */
function findMylistEpEntries(eid) {
	var ret = new Array();
	var episode = episodes[eid];
	for (var sd in mylist) {
		if (mylist[sd].episodeId != eid) continue;
		ret.push(mylist[sd]);
	}
	return ret;
}

// SORTING Functions //

function c_undefined_simp(a, b) {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}
function c_undefined(a, b) {
  return a.split('|')[0] - b.split('|')[0];
}
function c_undefined_r(b, a) {
  return b.split('|')[0] - a.split('|')[0];
}
function c_string(a, b) {
  if (a.split('|')[1] < b.split('|')[1]) return -1;
  if (a.split('|')[1] > b.split('|')[1]) return 1;
	return a.split('|')[0] - b.split('|')[0];	
}
function c_string_r(b, a) {
  if (a.split('|')[1] < b.split('|')[1]) return -1;
  if (a.split('|')[1] > b.split('|')[1]) return 1;
  return b.split('|')[0] - a.split('|')[0];
}
function c_number(a, b) {
  val =  a.split('|')[1] - b.split('|')[1];
  return val || (a.split('|')[0] - b.split('|')[0]);
}
function c_number_r(b, a) {
  val =  a.split('|')[1] - b.split('|')[1];
  return val || (a.split('|')[0] - b.split('|')[0]);
}

function get_text(node) {
	return node.firstChild.nodeValue;
}
function dig_text(node) {
	while (node && !node.nodeValue) { node = node.firstChild; }
	return node.nodeValue;
}
function dig_text_lower(node) {
	while (node && !node.nodeValue) { node = node.firstChild; }
	return node.nodeValue.toLowerCase();
}
function get_title(node) {
	return node.title;
}
function get_blank(node) {
	return "";
}
function get_anidbsort(node) {
  // Should be using node.getAttributeNS("http://anidb.info/markup","sort");
	return node.getAttribute("anidb:sort");
}
function get_datelong(node) {
  while (node && !node.nodeValue) { node = node.firstChild; }
  var edate = node.nodeValue.split(".");
  var ehour = node.nodeValue.split(":");
  var day = Number(edate[0]);  
  var month = Number(edate[1]);
  var now = new Date();
  var year;
  var echar = node.nodeValue.charAt(node.nodeValue.lastIndexOf('.')+1);
  if (echar != '1' || echar != '2') {
    if (month > now.getMonth()) year = (now.getFullYear()-1)
    else year = now.getFullYear();
  } else year = parseInt(node.nodeValue.substring(lastIndexOf('.')+1,lastIndexOf('.')+5));
  var hour = Number(node.nodeValue.substring(node.nodeValue.indexOf(':')-2,node.nodeValue.indexOf(':')));
  var minute = Number(ehour[1]);
  return new Date(year,month-1,day,hour,minute).getTime();
}
function get_date(node) {
  while (node && !node.nodeValue) { node = node.firstChild; }
  var edate = node.nodeValue.split(".");
  var day = Number(edate[0]);
  var month = Number(edate[1])-1;
  var year = Number(edate[2]);
  return Number(new Date(year,month,day));
}

/* *
 * This function attaches the sorting function to TH's
 * @param node If specified tells the root node [node]
 * @param ident If specified tells to make a special case for the TH identified by ident [identifier]
 * @param sortico If specified the TH referenced by ident will get this sort icon or the i_down1 icon [up|down] 
 */ 
function init_sorting(node,ident,sortico) {
  if (!node) node = document;
  var headinglist;
	if (document.getElementsByTagName) headinglist = node.getElementsByTagName('TH');
	else return;
	// The Sorting functions, see FunctionMap for the actual function names
	var sortFuncs = new Array('c_latin','c_number','c_datetime','c_datelong','c_date','c_set','c_setlatin');
	for (var i = 0; i < headinglist.length; i++) {
		headinglist[i].onclick = sortcol; // This applies the actual sorting behaviour
		// And the following adds the icons (Optional, it's just a visual input)
    /*
		for (var k = 0; k < sortFuncs.length; k++) {
		  if (headinglist[i].className.indexOf(sortFuncs[k]) >= 0) {
		    var dv = document.createElement('DIV');
		    dv.className = 'icons';
		    var span = document.createElement('SPAN');
		    span.className = 'i_icon i_sort';
		    span.title = 'click header to sort column';
		    // Optional part, sets a specific icon to match the default db order
		    if (ident && ident.length) {
		      var identifier = headinglist[i].className.substring(0,headinglist[i].className.indexOf(" ")) || headinglist[i].className;
		      if (identifier.indexOf(ident) >= 0) {
		        if (sortico && sortico.length) {
		          if (sortico == 'up') {
		            span.className = 'i_icon i_up1';
		            span.title = 'sort ascending';
		          } else {
		            span.className = 'i_icon i_down1';
		            span.title = 'sort descending';
		          }
	          } else { 
	            span.className = 'i_icon i_down1';
	            span.title = 'sort descending';
	          }
	        }
		    } 
		    dv.appendChild(span);
		    headinglist[i].insertBefore(dv,headinglist[i].firstChild);
		    break;
		  }
	  }
    */
  }
	FunctionMap = {'c_latin':{'sortf':c_string, 'sortr':c_string_r, 'getval':dig_text_lower},
		'c_number':{'sortf':c_number, 'sortr':c_number_r, 'getval':dig_text},
		'c_datetime':{'sortf':c_string, 'sortr':c_string_r, 'getval':get_anidbsort},
		'c_datelong':{'sortf':c_number, 'sortr':c_number_r, 'getval':get_datelong},
		'c_date':{'sortf':c_number, 'sortr':c_number_r, 'getval':get_date},
		'c_set':{'sortf':c_number, 'sortr':c_number_r, 'getval':get_anidbsort},
		'c_setlatin':{'sortf':c_string, 'sortr':c_string_r, 'getval':get_anidbsort},
		'c_none':{'sortf':c_undefined, 'sortr':c_undefined_r, 'getval':get_blank} }  
}

/* *
 * Finds the active sort col and return it's identifier
 * @param node If specified tells the root node [node]
 */
function findSortCol(node) {
  if (!node) node = document;
  var headinglist;
	if (document.getElementsByTagName)
		headinglist = node.getElementsByTagName('TH');
	else 	
	  return;
	for (var i = 0; i < headinglist.length; i++) {
    var heading = headinglist[i];
    if (heading.className.indexOf('s_forward') >= 0 || heading.className.indexOf('s_reverse') >= 0) {
      return heading.className.substring(0,heading.className.indexOf(" ")) || heading.className;
    } else continue;
  }
  return null;
}

function sortcol(node) {
	if (!node) node = this; // ie funkyness
  if (node.nodeName != 'TH') node = this;
	var here = node;
	// We find out if our header is in the tBody of the Table
	// Because if it's not we are going to sort the whole TBody
  var sortIndex = 0;
	if (here.parentNode.parentNode.nodeName == 'TBODY') sortIndex = Number(here.parentNode.rowIndex)+1; 
	// We now find out which sort function to apply to the column or none
	var sortfunc = node.className.substring(node.className.indexOf(" c_")+1,(node.className.indexOf(" ",node.className.indexOf(" c_")+1)+1 || node.className.length+1)-1);
	if (sortfunc.indexOf('c_') == -1 || sortfunc == 'c_none') return; // There will be no sorting for this column.
	// We get all the spans in the icons divs so that we can clear their icons
/*
	var headinglist = here.parentNode.getElementsByTagName('SPAN');
	for (var i=0; i < headinglist.length; i++) {
	  var span = headinglist[i];
	  if (span.className.indexOf('i_down1') >= 0 || span.className.indexOf('i_up1') >= 0) {
	    span.className = 'i_icon i_sort';
		  span.title = 'click header to sort column';
		}
	}
*/
  // clear other sorting that could be present
  for (var i = 0; i < node.parentNode.childNodes.length; i++) {
    var cell = node.parentNode.childNodes[i];
    if (cell.nodeName != 'TH' || cell.className == node.className) continue; // our node
    if (cell.className.indexOf(' s_forward') > -1) cell.className = cell.className.replace(' s_forward','');
    if (cell.className.indexOf(' s_reverse') > -1) cell.className = cell.className.replace(' s_reverse','');
  }
	// Finding the current header sort icon span
/*
	var curSpan;
	var spanlist = here.getElementsByTagName('SPAN');
	for (var i = 0; i < spanlist.length; i++) {
	  var span = spanlist[i];
	  if (span.className.indexOf('i_sort') >= 0) {
	    curSpan = span;
	    break;
	  }
	}
*/
  // Finding the actual Table node
	while (here.nodeName != 'TABLE')
	  here = here.parentNode;
	var container = here;
	container.style.display = 'none';
  // An identifier so we can track this column
	var identifier = node.className.substring(0,node.className.indexOf(" ")) || node.className;
	var sortlist = new Array();
	var sortmap = new Object();
	var pContainer = container.tBodies[0];
  var rowlist = pContainer.getElementsByTagName('TR');
	var funcmap = FunctionMap[sortfunc] || FunctionMap['c_none'];
	// We now build a construct that will hold the sorting data
  var cellIdx = 0;
  var i = sortIndex;
  var cloneTB = document.createElement('TBODY'); // a clone table body, cloneNode doesn't work as expected
  while (rowlist.length > sortIndex) {
    var cRow = rowlist[sortIndex];
    var cellList = cRow.getElementsByTagName('TD');
    if (cellList[cellIdx].className.indexOf(identifier) < 0) { // do this the hard way
      for (var k = 0; k < cellList.length; k++) {
        var cell = cellList[k];
        if (cell.className.indexOf(identifier) < 0) continue; // next cell
        var cellid = i+"|"+funcmap['getval'](cell);
        sortlist.push(cellid);
        cloneTB.appendChild(cRow);
        sortmap[cellid] = cloneTB.lastChild;
        cellIdx = k;
        break; // we allready found our cell no need to continue;
      }
    } else { // we allready know the index just do the simple version
      var cell = cellList[cellIdx];
      var cellid = i+"|"+funcmap['getval'](cell);
      sortlist.push(cellid);
      cloneTB.appendChild(cRow);
      sortmap[cellid] = cloneTB.lastChild;
    }
    i++;
  }
	// Are we sorting forward or reverse? If no info, we apply a Forward sort
	if (node.className.indexOf("s_forward") >= 0) {
		sortlist.sort(funcmap['sortr']);
		node.className = node.className.replace("s_forward", "s_reverse");
/*
		curSpan.className = 'i_icon i_down1';
		curSpan.title = 'sort descending';
*/
	} else {
		sortlist.sort(funcmap['sortf']);
		node.className = node.className.replace(" s_reverse","") + " s_forward";
/*
		curSpan.className = 'i_icon i_up1';
		curSpan.title = 'sort ascending';
*/
	}

	for (var i = 0; i < sortlist.length; i++) {
		var row = sortmap[sortlist[i]];
		if (!(i%2)) { row.className = row.className.replace(/ g_odd|g_odd/,"") + " g_odd"; }
		else { row.className = row.className.replace(/ g_odd|g_odd/,""); }
		pContainer.appendChild(row);
	}
	container.style.display = '';
}

// ED2K/SFV Functions //

// The hash Object holds hashing defaults
var hashObj = new Object();
hashObj.usePatterns = true;
hashObj.convertSpaces = true;
hashObj.spacesChar = '_';
hashObj.defaultPattern = "%ant - %enr%ver - %ept - <[%grp]><(%crc)><(%cen)><(%lang)><(%raw)>";
hashObj.pattern = hashObj.defaultPattern;
hashObj.ed2k = "ed2k://|file|"+hashObj.pattern+".%ext|%flen|%ed2k|";
hashObj.sfv = hashObj.pattern+".%ext %crc";
hashObj.validHashes = [ "ed2k", "sfv" ];

var validIdentifiers = ["%ant","%anat","%ept","%epat","%enr","%pn","%fpn","%raw",
                        "%crc","%CRC","%ver","%cen","%dub","%sub","%lang","%flang",
                        "%grp","%grn","%qual","%src","%res","%vcodec","%eps","%atype",
                        "%fid","%aid","%eid","%gid","%dlen","%ext","%ed2k","%uncen",
                        "%acodec","%achans","%hlen","%flen"]
/* *
 * Function that tests if a given identifier is valid
 * @param identifier The identifier to test
 * @return true|false
 */
function checkIdentifiers(identifier) {
  for (var i = 0; i < validIdentifiers.length; i++) {
    if (identifier.indexOf(validIdentifiers[i]) >= 0) return true;
  }
  return false;
}
/* *
 * Function that creates the link for a given hash
 * @return void (sets the hash href) 
 */
function applyFormat(identifier, file, episode, anime, group) {
  var originalIdentifier = identifier;
  var dropIfNull = false;
  if (identifier.indexOf('<') >= 0) {  
    originalIdentifier = originalIdentifier.substr(originalIdentifier.indexOf('<')+1,originalIdentifier.indexOf('>')-1);
    identifier = identifier.match(/(\%[A-Z]+)/i)[0];
    originalIdentifier = originalIdentifier.replace(identifier,"%replaceme");
    dropIfNull = true;
  }
  //alert('identifier: '+identifier+' ('+originalIdentifier+') exists? '+checkIdentifiers(identifier));
  if (!checkIdentifiers(identifier)) return ("");
  identifier = identifier.replace("%ant",anime.getTitle());
  identifier = identifier.replace("%anat",anime.getAltTitle());
  identifier = identifier.replace("%ept",episode.getTitle());
  identifier = identifier.replace("%epat",episode.getAltTitle());
  if (identifier.indexOf("%enr") >= 0) {
    var epLen = String(anime.eps);
    var epFmt = '0000'+episode.epno;
    epFmt = epFmt.slice(epFmt.length-epLen.length);
    identifier = identifier.replace("%enr",episode.typeChar+epFmt); 
  }
  identifier = identifier.replace("%pn",(anime.type == 'movie') ? "PA" : "EP");
  identifier = identifier.replace("%fpn",(anime.type == 'movie') ? "Part" : "Episode");
  if (identifier.indexOf("%raw") >= 0) {
    if (file.type == 'video' && file.subtitleTracks.length == 0)
      identifier = identifier.replace("%raw",(file.audioTracks.length == 1 && file.audioTracks[0].lang == 'ja') ? "RAW" : "");
    else identifier = identifier.replace("%raw","");
  }
  identifier = identifier.replace("%crc",(file.crcStatus == 'invalid') ? "INVALID" : file.crc32);
  identifier = identifier.replace("%CRC",(file.crcStatus == 'invalid') ? "INVALID" : file.crc32.toUpperCase());
  identifier = identifier.replace("%ver",(file.version != 'v1') ? file.version : "");
  identifier = identifier.replace("%cen",(file.isCensored) ? "cen" : "");
  identifier = identifier.replace("%uncen",(file.isUncensored) ? "uncen" : "");
  if (identifier.indexOf("%dub") >= 0) {
    var dub = new Array();
    for (var i = 0; i < file.audioTracks.length; i++) dub.push(file.audioTracks[i].lang);
    identifier = identifier.replace("%dub",(dub.length) ? dub.join(',') : "");
  }
  if (identifier.indexOf("%sub") >= 0) {
    var sub = new Array();
    for (var i = 0; i < file.subtitleTracks.length; i++) sub.push(file.subtitleTracks[i].lang);
    identifier = identifier.replace("%sub",(sub.length) ? sub.join(',') : "");
  }
  if (identifier.indexOf("%lang") >= 0 || identifier.indexOf("%flang") >= 0) {
    var dub = new Array();
    for (var i = 0; i < file.audioTracks.length; i++) {
      if (file.audioTracks[i].lang == "ja") continue;
      if (identifier.indexOf("%lang") >= 0 && dub.length > 1) { dub.push("+"); break; }
      dub.push(file.audioTracks[i].lang);
    }
    var sub = new Array();
    for (var i = 0; i < file.subtitleTracks.length; i++) {
      if (file.subtitleTracks[i].lang == "en") continue;
      if (identifier.indexOf("%lang") >= 0 && sub.length > 1) { sub.push("+"); break; }
      sub.push(file.subtitleTracks[i].lang);
    }
    var langs = "";
    if (dub.length) langs += 'dub';
    if (dub.length && sub.length) langs += '.';
    if (sub.length) langs += 'sub';
    if (dub.length || sub.length) langs += '_';
    langs += dub.join();
    if (dub.length && sub.length) langs += '.';
    langs += sub.join();
    if (langs == 'dub.sub_ja.en') langs = "";
    if (identifier.indexOf("%lang") >= 0) identifier = identifier.replace("%lang",langs);
    if (identifier.indexOf("%flang") >= 0) identifier = identifier.replace("%flang",langs);
  }
  identifier = identifier.replace("%grp",(group) ? group.shortName : '');
  identifier = identifier.replace("%grn",(group) ? group.name : '');
  identifier = identifier.replace("%qual",(file.quality != 'unknown') ? file.quality : "");
  identifier = identifier.replace("%src",file.source);
  identifier = identifier.replace("%vcodec",(file.type == 'video') ? file.videoTracks[0].codec : "");
  identifier = identifier.replace("%acodec",(file.type == 'video' || file.type == 'audio') ? file.audioTracks[0].codec : "");
  identifier = identifier.replace("%achans",((file.type == 'video' || file.type == 'audio') && file.audioTracks[0].chan != 'unknown') ? mapAudioChannels(file.audioTracks[0].chan) : "");
  identifier = identifier.replace("%res",(file.type == 'video' && file.resolution != 'unknown') ? file.resolution : "");
  identifier = identifier.replace("%eps",anime.eps);
  identifier = identifier.replace("%atype",(anime.type != 'unknown') ? mapAnimeType(anime.type) : "");
  identifier = identifier.replace("%fid",file.id);
  identifier = identifier.replace("%gid",file.groupId);
  identifier = identifier.replace("%eid",file.episodeId);
  identifier = identifier.replace("%aid",file.animeId);
  identifier = identifier.replace("%flen",file.size);
  identifier = identifier.replace("%dlen",formatFileSize(file.size,false));
  identifier = identifier.replace("%hlen",formatFileSize(file.size,true));
  identifier = identifier.replace("%ext",file.fileType);
  identifier = identifier.replace("%ed2k",file.ed2k);
  if (dropIfNull) {
    if (identifier != '') identifier = originalIdentifier.replace("%replaceme",identifier);
    else identifier = "";
  }
  return (identifier);
}

function createHashLink() {
  var ahref = this.getElementsByTagName('A')[0];
  if (ahref.href.indexOf("!fillme!") < 0) return; // we allready have the hash
  var fid = Number(this.parentNode.id.split('fid_')[1]);
  var file = files[fid];
  if (!file) return;
  var episode = episodes[file.episodeId];
  var curAnime = animes[file.animeId];
  var group = (file.groupId != 0) ? groups[file.groupId] : null;
  var possibleHashTypes = this.className.split(' ');
  var i;
  var found = false;
  for (i = 0; i < possibleHashTypes.length; i++) {
    if (hashObj.validHashes.indexOf(possibleHashTypes[i]) >= 0) { found = true; break; }
  }
  if (!found) return;
  var hashType = possibleHashTypes[i];

  if (!hashObj.usePatterns) hashObj.pattern = hashObj.defaultPattern;
  var pattern = hashObj[hashType]; 
  //alert('pattern.in: '+pattern); 
  var lt = 0; var gt = 0; // Find case '<' and '>' matches
  for (var i = 0; i < pattern.length; i++) {
    if (pattern.charAt(i) == '<') lt++;
    if (pattern.charAt(i) == '>') gt++;
  }
  if ((lt == gt) && (lt > 0)) { // only continues if lt == gt
    while (pattern.lastIndexOf("<") != -1) { // first get rid of the conditional patterns
      var i = pattern.lastIndexOf("<");
      var fI = 0;
      while (pattern.indexOf(">",fI) != -1) {
        var k = pattern.indexOf(">",fI);
        if (k < i) {
          fI = k + 1;
          continue;
        } // we have found a pair of thingies
        var splitstr = pattern.slice(i,k+1);
        pattern = pattern.replace(splitstr,function(str, offset, s) { return applyFormat(str,file,episode,anime,group); });
        break; // continue to next match thingie
      }
    }
  }
  pattern = applyFormat(pattern,file,episode,anime,group);
  if (hashObj.convertSpaces) pattern = pattern.replace(/ /mgi,hashObj.spacesChar);
  //alert('pattern.out: '+pattern);
  ahref.href = pattern;
}

// SOME FORMATING FUNCTIONS

/* *
 * This function creates and inserts an href at the selection
 * @param obj The RTE obj
 * @param fTA The underlying textArea
 * @param val The type of the link
 * @param attribute The attribute of the link
 * @param textOnly true if only the text of the link is needed
 */
function createHTTPLink(val,attribute,sel,textOnly) {
  var base = "http://anidb.net/";
  var type = ""; // link type
  switch (val) {
    case 'anime':
    case 'creq':
    case 'ep':
    case 'file':
    case 'group':
    case 'producer':
    case 'reviews':
    case 'mylist':
    case 'votes': type = val.charAt(0); break;
    case 'titles': type = 'at'; break;
    case 'producers': type = 'ap'; break;
    case 'genres': type = 'ag'; break;
    case 'cats': type = 'ac'; break;
    case 'relations': type = 'ar'; break;
    case 'user': type = 'up'; break;
    case 'review': type = 'rs'; break;
    case 'groupcmts': type = 'agc'; break;
    case 'wiki': base = "http://wiki.anidb.net/w/"; break;
    case 'forum':
    case 'forum.topic':
    case 'forum.board':
    case 'forum.post': 
      base = "http://forum.anidb.net/";
      if      (val == 'forum.board') base += "viewforum.php?f=";
      else if (val == 'forum.topic') base += "viewtopic.php?t=";
      else if (val == 'forum.post' ) base += "viewtopic.php?p=";
      break;
    case 'tracker': base = "http://tracker.anidb.net/view.php?id="; break;
    default: base = "";
  }
  if (base == "") return; //no base no link
  return '<a href="'+base+type+attribute+'" type="'+val+'" att="'+attribute+'">'+sel+'</a>';
}

/*
 * Link replacement functions 
 */
function convertLinksInput(mstr, m1, m2, m3, offset, s) {
  return createHTTPLink(null,null,m1,m2,m3,true);
}

/*
 * Replacement functions
 */
function convert_input(str) {
  str = str.replace(/\[b\]/mgi,'<b>');
  str = str.replace(/\[\/b\]/mgi,'</b>');
  str = str.replace(/\[i\]/mgi,'<i>');
  str = str.replace(/\[\/i\]/mgi,'</i>');
  str = str.replace(/\[u\]/mgi,'<u>');
  str = str.replace(/\[\/u\]/mgi,'</u>');
  str = str.replace(/\[s\]/mgi,'<strike>');
  str = str.replace(/\[\/s\]/mgi,'</strike>');
  str = str.replace(/\[ul\]/mgi,'<ul>');
  str = str.replace(/\[\/ul\]/mgi,'</ul>');
  str = str.replace(/\[ol\]/mgi,'<ol>');
  str = str.replace(/\[\/ol\]/mgi,'</ol>');
  str = str.replace(/\[li\]/mgi,'<li>');
  str = str.replace(/\[\/li\]/mgi,'</li>');
  str = str.replace(/\[br\]/mgi,'<br>');
	str = str.replace(/\\"/mgi,'"');
	str = str.replace(/\\'/mgi,"'");
	str = str.replace(/\\`/mgi,"`");
  str = str.replace(/\[([a-z].+?)\:(\d+)\:([^\:\\\/\[\]].+?)\]/mgi,convertLinksInput);
  return (str);
}

// TOOLTIP FUNCTIONS //

var offsetfromcursorX=12;       //Customize x offset of tooltip
var offsetfromcursorY=10;       //Customize y offset of tooltip
var offsetdivfrompointerX=0;   //Customize x offset of tooltip DIV relative to pointer image
var offsetdivfrompointerY=0;   //Customize y offset of tooltip DIV relative to pointer image. Tip: Set it to (height_of_pointer_image-1).

var divHTMLTOOLTIP; //tooltip

var ie = document.all;
var ns6 = document.getElementById && !document.all;
var enabletip = false;

//var pointerobj = document.all ? document.all["dhtmlpointer"] : document.getElementById? document.getElementById("dhtmlpointer") : "";

function ietruebody(){
	return (document.compatMode && document.compatMode!="BackCompat") ? document.documentElement : document.body;
}

/* *
 * Sets the tooltip
 */
function setTooltip(thetext, dom, thewidth, thecolor){
  while (divHTMLTOOLTIP.childNodes.length) divHTMLTOOLTIP.removeChild(divHTMLTOOLTIP.firstChild);
  if (!thetext) return;
	if (typeof thewidth != "undefined") {
	  if (thewidth != 'auto') divHTMLTOOLTIP.style.width = thewidth + 'px';
	  else divHTMLTOOLTIP.style.width = thewidth;
	}
	if (typeof thecolor != "undefined" && thecolor != "") divHTMLTOOLTIP.style.backgroundColor = thecolor;
  if (typeof dom != "undefined") {
    if (dom) divHTMLTOOLTIP.appendChild(thetext);
    else divHTMLTOOLTIP.innerHTML = thetext;
  }
	enabletip = true;
  divHTMLTOOLTIP.style.visibility = "visible";
	return false;
}

function positionTooltip(e){
	if (enabletip){
    divHTMLTOOLTIP.style.position = 'absolute';
		var nondefaultpos = false;
    var curX = 0;
    var curY = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) { curX = e.pageX; curY = e.pageY; }
    else if (e.clientX || e.clientY) { curX = e.clientX + document.body.scrollLeft; curY = e.clientY + document.body.scrollTop; }
		//Find out how close the mouse is to the corner of the window
		var winwidth = ie && !window.opera ? ietruebody().clientWidth : window.innerWidth - 20;
		var winheight = ie && !window.opera ? ietruebody().clientHeight : window.innerHeight - 20;
		var rightedge = ie && !window.opera ? winwidth - event.clientX - offsetfromcursorX : winwidth - e.clientX - offsetfromcursorX;
		var bottomedge = ie && !window.opera ? winheight - event.clientY - offsetfromcursorY : winheight - e.clientY - offsetfromcursorY;
		var leftedge = (offsetfromcursorX < 0) ? offsetfromcursorX * (-1) : - 5000;
		//if the horizontal distance isn't enough to accomodate the width of the context menu
		if (rightedge < divHTMLTOOLTIP.offsetWidth) { //move the horizontal position of the menu to the left by it's width
			divHTMLTOOLTIP.style.left = (curX - divHTMLTOOLTIP.offsetWidth) + 'px';
			nondefaultpos = true;
		}
		else if (curX < leftedge) divHTMLTOOLTIP.style.left = "5px";
		else { //position the horizontal position of the menu where the mouse is positioned
			divHTMLTOOLTIP.style.left = (curX + offsetfromcursorX - offsetdivfrompointerX) + 'px';
			//pointerobj.style.left = curX + offsetfromcursorX + "px";
		}
		if (bottomedge < divHTMLTOOLTIP.offsetHeight) { //same concept with the vertical position
			divHTMLTOOLTIP.style.top = (curY - divHTMLTOOLTIP.offsetHeight - offsetfromcursorY) + 'px';
			nondefaultpos = true;
		} else {
			divHTMLTOOLTIP.style.top = (curY + offsetfromcursorY + offsetdivfrompointerY) + 'px';
			//pointerobj.style.top = curY + offsetfromcursorY + "px";
		}
    divHTMLTOOLTIP.style.visibility = "visible";
    /*
		if (!nondefaultpos)	pointerobj.style.visibility="visible"
		else pointerobj.style.visibility="hidden"
    */
	}
}

function hideTooltip(){
  enabletip = false;
  divHTMLTOOLTIP.style.visibility = "hidden";
  while (divHTMLTOOLTIP.childNodes.length) divHTMLTOOLTIP.removeChild(divHTMLTOOLTIP.firstChild);
	//pointerobj.style.visibility = "hidden";
	divHTMLTOOLTIP.style.left = "-5000px";
	divHTMLTOOLTIP.style.backgroundColor = '';
	divHTMLTOOLTIP.style.width = '';
}

function initTooltips() {
  divHTMLTOOLTIP = document.createElement('DIV');
  divHTMLTOOLTIP.id = "obj-tooltip"
  document.body.appendChild(divHTMLTOOLTIP);
  document.onmousemove = positionTooltip;
}
