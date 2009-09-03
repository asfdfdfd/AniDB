// File_Id3 - Info for Id3 tagged files
// Copyright (C) 2007-2007 Jerome Martinez, Zen@MediaArea.net
//
// This library is free software: you can redistribute it and/or modify it
// under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this library. If not, see <http://www.gnu.org/licenses/>.
//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Information about ID3 tagged files
//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//---------------------------------------------------------------------------
#ifndef MediaInfo_File_Id3H
#define MediaInfo_File_Id3H
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
#include "MediaInfo/File__Base.h"
//---------------------------------------------------------------------------

namespace MediaInfoLib
{

//***************************************************************************
// Class File_Id3
//***************************************************************************

class File_Id3 : public File__Base
{
protected :
    //Format
    void Read_Buffer_Init ();
    void Read_Buffer_Continue ();

private :
    //Buffer
    size_t Element_Size;

    //Temp - ID3v1
    Ztring Id3v1_Title;
    Ztring Id3v1_Artist;
    Ztring Id3v1_Album;
    Ztring Id3v1_Year;
    Ztring Id3v1_Comment;
    Ztring Id3v1_Track;
    Ztring Id3v1_Genre;

protected :
    //Information
    void HowTo (stream_t StreamKind);
};

//***************************************************************************
// Class File_Id3_Helper
//***************************************************************************

class File_Id3_Helper
{
public :
    File_Id3_Helper(File__Base* Base_);
    ~File_Id3_Helper();

protected :
    //Temp - ID3
    File_Id3* ID3;

    //From elsewhere
    bool Id3_Read_Buffer_Continue ();
    void Id3_Read_Buffer_Finalize ();

    //Data
    File__Base* Base;
};

} //NameSpace

#endif