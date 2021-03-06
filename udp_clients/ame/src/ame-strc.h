// Copyright (C) 2006 epoximator
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

#define STR_NAME "ame 0.2.07"
#define STR_ABOUT_TITLE "雨 070721"
#define STR_ABOUT "\
ame 0.2.07 by epoximator\n\
Limited C++/wxWidgets version of WebAOM\n\
"
#define STR_INFO "\
 Copyright 2007 epoximator\n\
 This software is licenced under GPL\n\
 Contact: http://www.anidb.net/forum/privmsg.php?mode=post&u=2555\n\
\n\
 This application make use of:\
  wxWidgets - http://www.wxwidgets.org\
  Copyright (c) 1998-2005 Julian Smart, Robert Roebling et al\n\
\n\
 Changelog:\n\
  070721 - 07:\n\
   -fixed source (R) test, thx to KaptK\n\
  070519 - 06:\n\
   -added test U(tag:tag) which returns true if both tags are defined and unequal\n\
  060913 - 05:\n\
   -fixed files added to mylist when checkbox not selected\n\
   -fixed lid not set to 0 after remove from mylist\n\
   -added user name/password focus in the login dialog\n\
  060903 - 04:\n\
   -fixed manual add to mylist\n\
   -fixed M short cut partly (still assumes romaji)\n\
   -fixed Identify / I\n\
   -added / implemented Rem from mylist\n\
   -added TRUNCATE support\n\
   -added regexp test to epno/epname\n\
   -added some more debugging output\n\
  060819 - 03:\n\
   -fixed key mapping K in job list\n\
   -fixed add to mylist check\n\
   -fixed crash on raw (no group) files\n\
   -fixed crash on job list keys when file is unidentified\n\
   -fixed log writing\n\
   -added key map I and ENTER in job list\n\
   -added lid column to job list\n\
   -note: TRUNCATE<x,y> is not supported\n\
  060818 - 02:\n\
   -fixed the N, D and S tests\n\
   -fixed file dialog filtering\n\
   -added key mappings to job list\n\
   -added file length (duration). this might break your db, use webaom to update it\n\
   -double clicking a job does now open the html file info view\n\
   -note: postgresql is not supported yet\n\
\n\
 Missing features:\n\
  General:\n\
   -list sorting\n\
   -alt view\n\
   -chii emulator\n\
   -extra hash algs\n\
   -store password\n\
   -html log, auto&disk\n\
  Database:\n\
   -only mysql support atm\n\
   -create (use webaom)\n\
   -autoload\n\
   -remove\n\
   -unicode in file paths\n\
  Udp Connection:\n\
   -comm. tags\n\
   -keep-alive\n\
   -encryption\n\
   -compression\n\
\n\
 To use db:\n\
  -install mysql odbc driver (http://dev.mysql.com/downloads/connector/odbc/3.51.html)\n\
  -add a odbc data source; 'Data Source Name'='Database'=webaom\n\
  -set initial statement to 'set names utf8'\n\
  -use jdbc string (see wiki)\n\
  -also, the database has to be defined;\n\
   - use WebAOM to create the database or extract the definition from webaom.jar and do it manually\n\
"

#define FILE_HTM "\
<html>\
	<body bgcolor=#DEE3E7 text=#006699 link=#006699>\
		<center><font face=\"Verdana, Arial, Helvetica, sans-serif\">\
					<font size=6><a href=\"%ula\">%ann</a> - <a href=\"%uly\">%yea</a> - %typ</font><br>\
					<font size=4><a href=\"%ulm\">%kan</a> - %eng</font><br>\
					<font size=5>Ep %enr of %eps (%lep): <a href=\"%ule\">%epn</a></font><br>\
					<small>(fid=<a href=\"%ulf\">%fid</a>, aid=<a href=\"%ula\">%aid</a>, eid=<a href=\"%ule\">%eid</a>, gid=<a href=\"%ulg\">%gid</a>, lid=<a href=\"%ulx\">%lid</a>)</small>\
					<table cellspacing=\"2\">\
						<tr><td bgcolor=#EFEFEF>File</td><td bgcolor=#EFEFEF><a href=\"%ulf\">%fil</a></td></tr>\
						<tr><td bgcolor=#EFEFEF>Original</td><td bgcolor=#EFEFEF>%ori</td></tr>\
						<tr><td bgcolor=#EFEFEF>Path</td><td bgcolor=#EFEFEF><a href=\"file://%pat\">%pat</a></td></tr>\
						<tr><td bgcolor=#EFEFEF>New File</td><td bgcolor=#EFEFEF>%new</td></tr>\
						<tr><td bgcolor=#EFEFEF>Size/CRC</td><td bgcolor=#EFEFEF>%siz / %CRC</td></tr>\
						<tr><td bgcolor=#EFEFEF>Status</td><td bgcolor=#EFEFEF>%sta</td></tr>\
						<tr><td bgcolor=#EFEFEF>Group</td><td bgcolor=#EFEFEF><a href=\"%ulg\">%grp</a></td></tr>\
						<tr><td bgcolor=#EFEFEF>Cat</td><td bgcolor=#EFEFEF>%gen</td></tr>\
						<tr><td bgcolor=#EFEFEF>Dub/Sub</td><td bgcolor=#EFEFEF>%dub / %sub</td></tr>\
						<tr><td bgcolor=#EFEFEF>Tech</td><td bgcolor=#EFEFEF>%src (%qua quality): %res %vid / %aud %ver %cen</td></tr>\
			</table>\
			<b>Hash sums</b>\
			<table cellspacing=\"2\">\
				<tr><td bgcolor=#EFEFEF>ed2k</td><td bgcolor=#EFEFEF>%ed2</td></tr>\
				<tr><td bgcolor=#EFEFEF>md5</td><td bgcolor=#EFEFEF>%md5</td></tr>\
				<tr><td bgcolor=#EFEFEF>sha1</td><td bgcolor=#EFEFEF>%sha</td></tr>\
			</table>\
		</font></center>\
	</body>\
</html>\
"