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

#include <wx/wxprec.h>

#include <wx/db.h>
#include <wx/dir.h>
#include <wx/file.h>
#include <wx/timer.h>
#include <wx/tokenzr.h>
#include <wx/wfstream.h>
#include <wx/listctrl.h>
#include <wx/html/htmlwin.h>

#include <process.h>

#include "ame-id.h"
#include "ame-tools.h"
#include "ame-db.h"
#include "ame-job.h"
#include "ame-main.h"
#include "ame-cache.h"
#include "anidb-base.h"
#include "ame-rules.h"
#include "ame-dir-trav.h"
#include "ame-thread-netio.h"
#include "ame-thread-diskio.h"
#include "ame-options.h"
#include "ame-diag-login.h"
#include "ame-strc.h"

int getStateId(wxString s){
	for(int i=0; i<4;i++)
		if(s.CmpNoCase(STRFSTATE[i])==0)
			return i;
	return -1;
}
int AmeCtrlReplaceList::OnGetItemImage(long item) const{
	return 0;
}
void AmeFrame::OnDatabase(wxCommandEvent& WXUNUSED(event)){
	m_miDB->Enable(false);
	m_odMydb->Enable(false);
	if(!A.m_db->ok()){
		if(A.m_db->connect(m_odMydb->GetValue())){
			A.m_db_thread = new AmeThreadDB(A.m_db);
			A.m_db_thread->Create();
			A.m_db_thread->Run();
			//POPI(A.m_db->getDid(wxT("c:\\test\\")));
		}else{
			m_miDB->Enable(true);
			m_odMydb->Enable(true);
		}
	}
}
void AmeFrame::OnQuit(wxCommandEvent& WXUNUSED(event)){
	if(wxGetApp().m_disk_thread)
		wxGetApp().m_disk_thread->Delete();
	if(wxGetApp().m_net_thread)
		wxGetApp().m_net_thread->Delete();
    Close(TRUE);
}
void AmeFrame::OnAbout(wxCommandEvent& WXUNUSED(event)){
	wxMessageBox(wxT(STR_ABOUT), wxT(STR_ABOUT_TITLE), wxOK | wxICON_INFORMATION, this);
}
void AmeFrame::OnWiki(wxCommandEvent& WXUNUSED(event)){
	MYEXEC(wxT("http://wiki.anidb.info/w/WebAOM"));
}
void AmeFrame::OnSave(wxCommandEvent& WXUNUSED(event)){
	AmeOptions *o = A.m_opt;

	//o->setB(oBUNUSED0, false);
	o->setB(oBHASHCRC, m_odHcrc->IsChecked());
	o->setB(oBHASHMD5, m_odHmd5->IsChecked());
	o->setB(oBHASHSHA, m_odHsha->IsChecked());
	o->setB(oBHASHTTH, m_odHtth->IsChecked());
	o->setB(oBADDFILE, m_ofAdd->IsChecked());
	o->setB(oBWATCHED, m_ofWatched->IsChecked());
	//o->setB(oBUNUSED1, false);
	//o->setB(oBNATKEEP, false);
	o->setB(oBSTORPSW, m_odSpsw->IsChecked());
	o->setB(oBALOADDB, m_odAldb->IsChecked());
	o->setB(oBAUTOLOG, m_odAlog->IsChecked());
	//o->setB(oBUNUSED2, false);

	long l;
	if(m_ocRport->GetValue().ToLong(&l))
		o->setI(oIRPORT, l);
	if(m_ocLport->GetValue().ToLong(&l))
		o->setI(oILPORT, l);
	o->setI(oISTATE, getStateId(m_ofState->GetValue())); //file state on mylist add
	o->setI(oITIMEO, m_ocTimeout->GetValue()); //timeout
	o->setI(oIDELAY, m_ocDelay->GetValue()); //datagram delay
	//o->setI(oIUSMOD, 1); //rename mode

	//TODO enable when enc of pass works: 
	o->setS(oSUSRNAME, A.m_up->username);
	o->setS(oSHOSTURL, m_ocHost->GetValue());
	o->setS(oSMYDBURL, m_odMydb->GetValue());
	o->setS(oSHASHDIR, m_odHashd->GetValue());
	o->setS(oSBROWSER, m_odBrows->GetValue());
	//o->setS(oSEXTENSN, wxT("avi,mkv,ogm,mp4"));
	o->setS(oSSOURCEF, m_ofSource->GetValue());
	o->setS(oSSTORAGE, m_ofStorage->GetValue());
	o->setS(oSOTHERIN, m_ofOther->GetValue());
	o->setS(oSVRLSREN, A.m_rules->getRuleName());
	o->setS(oSVRLSMOV, A.m_rules->getRulePath());
	o->setS(oSREPLSYS, A.m_rules->getEncRepl());
	//o->setS(oSHTMLCOL, wxT(""));
	o->setS(oSLOGFILE, m_odMylog->GetValue());
	//o->setS(oSPATHREG, wxT(""));
	//o->setS(oSFONTSTR, wxT(""));
	//o->setS(oSLOGHEAD, wxT(""));

	o->save();
}
void AmeFrame::OnExtensionAdd(wxCommandEvent& WXUNUSED(event)){
	wxString s = m_oeNew->GetValue();
	long i;
	for(i=0; i<m_oeList->GetItemCount();i++)
		if(m_oeList->GetItemText(i).CmpNoCase(s)==0)
			return;
	m_oeList->InsertItem(i, s);
}
void AmeFrame::OnExtensionRemove(wxListEvent& event){
	if(event.GetKeyCode()==389){
		long item = m_oeList->GetNextItem(-1, wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
		if(item>=0)
			m_oeList->DeleteItem(item);
	}
}
void AmeFrame::OnFile(wxCommandEvent& WXUNUSED(event)){
	wxString wild;
	if(m_listReplace->GetItemCount()>0){
		wild = SP1("Wanted extensions|*.%s", m_oeList->GetItemText(0));
		for(long l=1; l<m_oeList->GetItemCount(); l++)
			wild.append(SP1(";*.%s", m_oeList->GetItemText(l)));
		wild.append(wxT("|All files|*.*"));
	}
	wxFileDialog diag(this,wxT("Select files"),wxT(""),wxT(""),wild,wxFILE_MUST_EXIST|wxMULTIPLE);
	if(diag.ShowModal()==wxID_OK)
	{
		wxArrayString as;
		diag.GetPaths(as);
		//as.Sort();
		wxArrayString::iterator it;
		for(it=as.begin(); it!=as.end(); ++it)
			wxGetApp().m_jl->addFile(*it);

		m_listJobs->SetItemCount((long)wxGetApp().m_jl->count());
	}
}
void AmeFrame::OnFolder(wxCommandEvent& WXUNUSED(event)){
	wxDirDialog diag(this,_T("Select a directory"),_(""),wxFILE_MUST_EXIST|wxMULTIPLE);
	if(diag.ShowModal()==wxID_OK){
		wxArrayString ext;
		for(long i=0; i<m_oeList->GetItemCount();i++)
			ext.Add(m_oeList->GetItemText(i));
		wxArrayString as;
		wxDirTraverserSimple traverser(as, ext);
		wxDir dir(diag.GetPath());
		dir.Traverse(traverser, _T(""),wxDIR_DIRS|wxDIR_FILES);

		wxArrayString::iterator it;
		for(it=as.begin(); it!=as.end(); ++it)
			wxGetApp().m_jl->addFile(*it);

		m_listJobs->SetItemCount((long)wxGetApp().m_jl->count());
		//m_listJobs->UpdateWindowUI();
	}
}
void AmeFrame::OnMessageEvt(wxCommandEvent& event){
	long t = event.GetInt();
	wxString s = event.GetString();
	if(BCMP(t,MSG_LOG)){
		m_sb->SetStatusText(s);
		m_log->SetInsertionPointEnd();
		m_log->WriteText(SP1("%s\n", s));
	}
	if(BCMP(t,MSG_DEB)){
		m_debug->SetInsertionPointEnd();
		m_debug->WriteText(SP1("%s\n", s));
	}
	if(BCMP(t,MSG_HSH)){
		m_hash->SetInsertionPointEnd();
		m_hash->WriteText(SP1("%s\n", s));
	}
	if(BCMP(t,MSG_POP))
		POP(s);
	event.Skip();
}
void AmeFrame::OnDisk(wxCommandEvent& WXUNUSED(event)){
	if(wxGetApp().m_disk_thread==NULL){
		wxArrayString ext;
		for(long i=0; i<m_oeList->GetItemCount();i++)
			ext.Add(m_oeList->GetItemText(i));
		
		wxGetApp().m_disk_thread = new AmeThreadDiskIO(this, m_odHashd->GetValue(), ext);

		if ( wxGetApp().m_disk_thread->Create() != wxTHREAD_NO_ERROR ){
			wxLogError(wxT("Can't create thread!"));
			return;
		}
		panel_oe->Enable(false);
		m_odHashd->Enable(false);
		wxGetApp().m_disk_thread->Run();

	}else{
		//if(wxGetApp().m_disk_thread->IsPaused())
		//	wxGetApp().m_disk_thread->Resume();
		//else wxGetApp().m_disk_thread->Pause();
		wxGetApp().m_disk_thread->Delete();
		m_gauge->SetValue(100);
	}
}
void AmeFrame::OnGaugeEvt(wxCommandEvent& event){
	m_gauge->SetValue(event.GetInt());
}
void AmeFrame::OnDiskByeEvt(wxCommandEvent& WXUNUSED(event)){
	wxGetApp().m_disk_thread = NULL;
	m_miDisk->Check(false);
	panel_oe->Enable(true);
	m_odHashd->Enable(true);
	POSTM(MSG_LOG, wxT("DiskIO thread terminated."));
}
void AmeFrame::OnNet(wxCommandEvent& WXUNUSED(event)){
	if(wxGetApp().m_net_thread==NULL){
		AdbUserPass *up = wxGetApp().m_up;
		//if(!up->ok()){
		AmeDialogLogin ld(this, up);
		if(ld.ShowModal()!=wxID_OK){
			m_miNet->Check(false);
			return;
		}
		//}
		
		AdbConOptions *opt = new AdbConOptions();
		long l;
		if(!m_ocRport->GetValue().ToLong(&l)){
			POPT("Failed to parse 'Remote Port'");
			return;
		}
		opt->remote_port = l;
		if(!m_ocLport->GetValue().ToLong(&l)){
			POPT("Failed to parse 'Remote Port'");
			return;
		}
		opt->local_port = l;
		
		opt->host = m_ocHost->GetValue();
		opt->delay = m_ocDelay->GetValue()*1000;
		opt->timeout= m_ocTimeout->GetValue()*1000;

		AmeJobMan::add_to_mylist = m_ofAdd->IsChecked();
		wxString me;
		
		me.Append(SP1("&state=%d", getStateId(m_ofState->GetValue())));
		me.Append(SP1("&viewed=%d", (m_ofWatched->IsChecked()?1:0)));
		#define ADDIF(x,y) if(y.Length()>0) me.Append(SP1(x,y));
		ADDIF("&source=%s",m_ofSource->GetValue());
		ADDIF("&storage=%s",m_ofStorage->GetValue());
		ADDIF("&other=%s",m_ofOther->GetValue());
		

		wxGetApp().m_net_thread = new AmeThreadNetIO(this, opt, up, me);
		if ( wxGetApp().m_net_thread->Create() != wxTHREAD_NO_ERROR ){
			wxLogError(wxT("Can't create thread!"));
			return;
		}
		
		wxGetApp().m_net_thread->Run();
		panel_oc->Enable(false);
		panel_of->Enable(false);
	}else{
		//if(wxGetApp().m_disk_thread->IsPaused())
		//	wxGetApp().m_disk_thread->Resume();
		//else wxGetApp().m_disk_thread->Pause();
		wxGetApp().m_net_thread->Delete();
		//m_gauge->SetValue(100);
	}
}
void AmeFrame::OnNetLoginEvt(wxCommandEvent& WXUNUSED(event)){
	AmeDialogLogin ld(this, wxGetApp().m_up);
	ld.ShowModal();
}
void AmeFrame::OnNetByeEvt(wxCommandEvent& WXUNUSED(event)){
	wxGetApp().m_net_thread = NULL;
	panel_oc->Enable(true);
	panel_of->Enable(true);
	m_miNet->Check(false);
	POSTM(MSG_LOG, wxT("NetIO thread terminated."));
}
void AmeFrame::OnJobListLenEvt(wxCommandEvent& WXUNUSED(event)){
	m_listJobs->SetItemCount((long)A.m_jl->count());
}
void AmeFrame::OnJobListRefreshEvt(wxCommandEvent& event){
	m_listJobs->RefreshItem(event.GetInt());
	event.Skip();
}
void AmeFrame::OnDbByeEvt(wxCommandEvent& WXUNUSED(event)){
	wxGetApp().m_db_thread = NULL;
	POSTM(MSG_LOG, wxT("Database loaded."));
}
void AmeFrame::OnRadioNameEvt(wxCommandEvent& WXUNUSED(event)){
	m_wxTCrules->SetValue(wxGetApp().m_rules->getRuleName());
}
void AmeFrame::OnRadioPathEvt(wxCommandEvent& WXUNUSED(event)){
	m_wxTCrules->SetValue(wxGetApp().m_rules->getRulePath());
}
void AmeFrame::OnButtonApplyRulesEvt(wxCommandEvent& WXUNUSED(event)){
	if(m_wxRB0->GetValue())
		wxGetApp().m_rules->setRuleName(m_wxTCrules->GetValue());
	else wxGetApp().m_rules->setRulePath(m_wxTCrules->GetValue());
}
void AmeFrame::OnButtonAddReplaceEvt(wxCommandEvent& WXUNUSED(event)){
	if(m_app->m_rules->addReplaceRule(m_wxTCrf->GetValue(), m_wxTCrt->GetValue())){
		m_listReplace->SetItemCount((long)m_app->m_rules->getReplaceCount());
		m_listReplace->Refresh();
	}
}
void AmeCtrlReplaceList::OnListKeyDown(wxListEvent& event){
	long item;//, temp;
	switch( event.GetKeyCode() ){
		case 389:
			item = GetNextItem(-1, wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
			if( item != -1){
				if(wxGetApp().m_rules->removeReplaceRule((size_t)item)){
					long len = (long)wxGetApp().m_rules->getReplaceCount();
					SetItemCount(len--);
					if(item<len) RefreshItems(item,len);
					//SetItemState(item, 0, wxLIST_STATE_SELECTED|wxLIST_STATE_FOCUSED);
					if(len<1) RefreshItem(0);
				}				
			}
			break;
		/*case 388:
			item = GetItemCount();
            SetItemData(InsertItem(item, wxT(""), 0), item);
			SetItem(item, 0, wxT("ai"));
			SetItem(item, 1, wxT(""));*/
        default:
            event.Skip();
	}
}
wxString AmeCtrlReplaceList::OnGetItemText(long item, long column) const{
	if(column==0) return wxString::Format(_T("%d"), item);
	AmeApp *a = &wxGetApp();
	if(item>=(long)a->m_rules->getReplaceCount()) return _T("ERR");//TODO lock?
	wxString f, t;
	a->m_rules->getReplaceRule(item, f, t);
	switch(column){
		case 1: return f;
		case 2: return t;
	}
	return wxT("NULL");
}