// File_Rm - Info for Real Media files
// Copyright (C) 2002-2007 Jerome Martinez, Zen@MediaArea.net
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

//---------------------------------------------------------------------------
// Compilation conditions
#include <MediaInfo/Setup.h>
#ifdef __BORLANDC__
    #pragma hdrstop
#endif
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
#if defined(MEDIAINFO_RM_YES)
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
#include <ZenLib/ZtringListList.h>
#include <ZenLib/Utils.h>
#include "MediaInfo/Multiple/File_Rm.h"
using namespace ZenLib;
//---------------------------------------------------------------------------

namespace MediaInfoLib
{

// https://common.helixcommunity.org/nonav/2003/HCS_SDK_r5/htmfiles/rmff.htm
// http://wiki.multimedia.cx/index.php?title=RealMedia

//***************************************************************************
// Functions
//***************************************************************************

void File_Rm::Read_Buffer_Continue()
{
    while (Buffer_Parse());
}

//***************************************************************************
// Buffer
//***************************************************************************

//---------------------------------------------------------------------------
bool File_Rm::Buffer_Parse()
{
    //Element Name
    if (!Element_Name_Get())
        return false;

    //Element Size
    if (!Element_Size_Get())
        return false;

    //Parsing
    if (!Element_Parse())
        return false; //Not enough bytes

    //Next element
    Buffer_Offset=(size_t)(Element_Next-File_Offset);

    return true;
}

//---------------------------------------------------------------------------
bool File_Rm::Element_Parse()
{
    //Size
    if (Buffer_Offset+Element_HeaderSize+Element_Size>Buffer_Size
     && (Element_Name!=Rm::DATA || Buffer_Offset+16384>Buffer_Size)) //exception for DATA, but we want at least 16KB
        return false; //Not enough bytes

    //Details
    ELEMENT(0, Element_Name, Element_Size);

    //Positionning
    Buffer_Offset+=Element_HeaderSize;

    //Parsing
    #define ELEMENT_CASE(_NAME) \
        case Rm::_NAME : _NAME(); break;

    switch (Element_Name)
    {
        ELEMENT_CASE( RMF);
        ELEMENT_CASE(DATA);
        ELEMENT_CASE(INDX);
        ELEMENT_CASE(CONT);
        ELEMENT_CASE(MDPR);
        ELEMENT_CASE(PROP);
        ELEMENT_CASE(RJMD);
        ELEMENT_CASE(RMJE);
        ELEMENT_CASE(RMMD);
        ELEMENT_CASE(TAG );
        default : ;
    }

    FLUSH();
    return true;
}

//***************************************************************************
// Elements
//***************************************************************************

#define NAME_VERSION(ELEMENT_NAME) \
    NAME(ELEMENT_NAME) \
    int16u Version; \
    { \
        CC_BEGIN(); \
        GET_B2 (Version,                                            ObjectVersion); \
    } \
    Buffer_Offset+=2; \
    Element_Size-=2; \

#define INTEGRITY_VERSION(_VERSION) \
    if (Version>_VERSION) \
    { \
        Details_Add_Error("Unknow version"); \
        return; \
    } \

//---------------------------------------------------------------------------
void File_Rm::RMF()
{
    NAME_VERSION("Real Media Format");
    INTEGRITY_VERSION(1);

    //Parsing
    CC_BEGIN();
    if (Element_Size==6)
        SKIP_B2(                                                file_version) //The version of the RealMedia file.
    else
        SKIP_B4(                                                file_version); //The version of the RealMedia file.
    SKIP_B4(                                                    num_headers); //The number of headers in the header section that follow the RealMedia File Header.
    CC_END();

    //Filling
    Stream_Prepare(Stream_General);
    Fill("Format", "RMF");
}

//---------------------------------------------------------------------------
void File_Rm::CONT()
{
    NAME_VERSION("Content");
    INTEGRITY_VERSION(0);

    //Parsing
    Ztring title, author, copyright, comment;
    int16u title_len, author_len, copyright_len, comment_len;
    CC_BEGIN();
    GET_B2 (title_len,                                          title_len); //The length of the title data in bytes.
    GET_LOCAL(title_len, title,                                 title); //An array of ASCII characters that represents the title information for the RealMedia file.
    GET_B2 (author_len,                                         author_len); //The length of the author data in bytes.
    GET_LOCAL(author_len, author,                               author); //An array of ASCII characters that represents the author information for the RealMedia file.
    GET_B2 (copyright_len,                                      copyright_len); //The length of the copyright data in bytes.
    GET_LOCAL(copyright_len, copyright,                         copyright); //An array of ASCII characters that represents the copyright information for the RealMedia file.
    GET_B2 (comment_len,                                        comment_len); //The length of the comment data in bytes.
    GET_LOCAL(comment_len, comment,                             comment); //An array of ASCII characters that represents the comment information for the RealMedia file.
    CC_END();

    //Filling
    Fill(Stream_General, 0, "PlayTime", title);
    Fill(Stream_General, 0, "Performer", author);
    Fill(Stream_General, 0, "Copyright", copyright);
    Fill(Stream_General, 0, "Comment", comment);
}

//---------------------------------------------------------------------------
void File_Rm::DATA()
{
    NAME_VERSION("Data");

    //Handling exception for the size
    if (Buffer_Offset+Element_Size>Buffer_Size)
        Element_Size=Buffer_Size-Buffer_Offset; //DATA specific, we have bypassed the last detection, Only what we have

    //Parsing
    int32u num_packets;
    int16u length, flags;
    CC_BEGIN();
    GET_B4 (num_packets,                                        num_packets); //Number of packets in the data chunk.
    SKIP_B4(                                                    next_data_header); //Offset from start of file to the next data chunk. A non-zero value refers to the file offset of the next data chunk. A value of zero means there are no more data chunks in this file. This field is not typically used.
    for (int32u Pos=0; Pos<num_packets; Pos++)
    {
        FLUSH();
        ELEMENT_BEGIN();
        GET_B2 (Version,                                        object_version);
        INTEGRITY_VERSION(1);
        GET_B2 (length,                                         length); //The length of the packet in bytes.
        if (Version==0)
            ELEMENT(1, "Media_Packet_Header", length-12);
        else
            ELEMENT(1, "Media_Packet_Header", length-13);
        SKIP_B2(                                                stream_number); //The 16-bit alias used to associate data packets with their associated Media Properties Header.
        SKIP_B4(                                                timestamp); //The time stamp of the packet in milliseconds.
        if (Version==0)
        {
            SKIP_B1(                                            packet_group); //The packet group to which the packet belongs. If packet grouping is not used, set this field to 0 (zero).
            GET_B1 (flags,                                      flags); //Flags describing the properties of the packet.
                SKIP_FLAGS(flags, 0,                            reliable); //If this flag is set, the packet is delivered reliably.
                SKIP_FLAGS(flags, 1,                            keyframe); //If this flag is set, the packet is part of a key frame or in some way marks a boundary in your data stream.
        }
        if (Version==1)
        {
            SKIP_B2(                                            asm_rule); //The ASM rule assigned to this packet.
            SKIP_B1(                                            asm_flags); //Contains HX_  flags that dictate stream switching points.
        }
        if (Version==0)
            SKIP_XX(length-12,                                  data)
        else
            SKIP_XX(length-13,                                  data);

        //Stopping if too far
        if (Pos>10)
        {
            Pos=num_packets;
            FLUSH();
            ELEMENT(1, "(...)", Error);
        }

        ELEMENT_END();
    }
    CC_END();
}

//---------------------------------------------------------------------------
void File_Rm::INDX()
{
    NAME_VERSION("INDeX");

    //Parsing
    int32u num_indices;
    CC_BEGIN();
    GET_B4 (num_indices,                                        num_indices); //Number of index records in the index chunk.
    SKIP_B2(                                                    stream_number); //The stream number for which the index records in this index chunk are associated.
    SKIP_B4(                                                    next_index_header); //Offset from start of file to the next index chunk. This member enables RealMedia file format readers to find all the index chunks quickly. A value of zero for this member indicates there are no more index headers in this file.
    for (int32u Pos=0; Pos<num_indices; Pos++)
    {
        FLUSH();
        ELEMENT_BEGIN();
        GET_B2 (Version,                                        object_version);
        INTEGRITY_VERSION(0);
        ELEMENT(1, "Media_Packet_Header", 14);
        SKIP_B4(                                                timestamp); //The time stamp (in milliseconds) associated with this record.
        SKIP_B4(                                                offset); //The offset from the start of the file at which this packet can be found.
        SKIP_B4(                                                packet_count_for_this_packet); //The packet number of the packet for this record. This is the same number of packets that would have been seen had the file been played from the beginning to this point.
        ELEMENT_END();
    }
    CC_END();
}

//---------------------------------------------------------------------------
void File_Rm::MDPR()
{
    NAME_VERSION("MeDia PRoperties");
    INTEGRITY_VERSION(0);

    //Parsing
    Ztring stream_name;
    std::string mime_type;
    int32u avg_bit_rate, start_time, duration;
    int16u stream_number;
    int8u stream_name_size, mime_type_size, type_specific_len;
    CC_BEGIN();
    GET_B2 (stream_number,                                      stream_number); //Unique value that identifies a physical stream
    SKIP_B4(                                                    max_bit_rate); //The maximum bit rate required to deliver this stream over a network.
    GET_B4 (avg_bit_rate,                                       avg_bit_rate); //The average bit rate required to deliver this stream over a network.
    SKIP_B4(                                                    max_packet_size); //The largest packet size (in bytes) in the stream of media data.
    SKIP_B4(                                                    avg_packet_size); //The average packet size (in bytes) in the stream of media data.
    GET_B4 (start_time,                                         start_time); //The time offset in milliseconds to add to the time stamp of each packet in a physical stream.
    SKIP_B4(                                                    preroll); //The time offset in milliseconds to subtract from the time stamp of each packet in a physical stream.
    GET_B4 (duration,                                           duration); //The duration of the stream in milliseconds.
    GET_B1 (stream_name_size,                                   stream_name_size); //The length of the following stream_name  member in bytes.
    GET_LOCAL(stream_name_size, stream_name,                    stream_name); //A nonunique alias or name for the stream.
    GET_B1 (mime_type_size,                                     mime_type_size); //The length of the following mime_type  field in bytes.
    GET_STRING(mime_type_size, mime_type,                       mime_type); //A nonunique MIME style type/subtype string for data associated with the stream.
    GET_B4 (type_specific_len,                                  type_specific_len); //The length of the following type_specific_data in bytes
    CC_END_CANBEMORE();

    //Parsing TypeSpecific
    Buffer_Offset+=Stream_Pos;
    Element_Size-=Stream_Pos;
    FLUSH();
    ELEMENT(1, mime_type.c_str(), Element_Size);
    MDPR_IsStream=true;
    //if (type_specific_len!=Element_Size)
    //    return;
         if (0);
    else if (mime_type=="video/x-pn-realvideo")
        MDPR_realvideo();
    else if (mime_type=="video/x-pn-realvideo-encrypted")
    {
        MDPR_realvideo();
        Fill("Encrypted", "Y");
    }
    else if (mime_type=="audio/x-pn-realaudio")
        MDPR_realaudio();
    else if (mime_type=="audio/x-pn-realaudio-encrypted")
    {
        MDPR_realaudio();
        Fill("Encrypted", "Y");
    }
    else if (mime_type=="audio/X-MP3-draft-00")
        MDPR_mp3();
    else if (mime_type=="audio/x-ralf-mpeg4")
        MDPR_ralf();
    else if (mime_type=="audio/x-ralf-mpeg4-generic")
        MDPR_ralf();
    else if (mime_type=="video/text")
        Stream_Prepare(Stream_Text);
    else if (mime_type=="logical-fileinfo")
        MDPR_fileinfo();
    else if (mime_type.find("video/")==0)
        Stream_Prepare(Stream_Video);
    else if (mime_type.find("audio/")==0)
        Stream_Prepare(Stream_Audio);
    else if (mime_type.find("logical")==0)
        ;
    else
        MDPR_IsStream=false;
    //Finalize
    ELEMENT_END(); //Details_Level_Last=0;
    if (MDPR_IsStream)
    {
        Fill("ID", stream_number);
        Fill("BitRate", avg_bit_rate);
        Fill("Delay", start_time);
        Fill("PlayTime", duration);
    }
}

//---------------------------------------------------------------------------
void File_Rm::MDPR_realvideo()
{
    //Parsing
    int32u Codec;
    int16u Width, Height, Resolution, FrameRate;
    CC_BEGIN();
    SKIP_B4(                                                    Size);
    SKIP_C4(                                                    FCC);
    GET_C4 (Codec,                                              Compression);
    GET_B2 (Width,                                              Width);
    GET_B2 (Height,                                             Height);
    GET_B2 (Resolution,                                         bpp);
    SKIP_B4(                                                    Unknown);
    GET_B2 (FrameRate,                                          fps);
    SKIP_B2(                                                    Unknown);
    SKIP_C4(                                                    Type1);
    SKIP_C4(                                                    Type2);
    CC_END();

    //Filling
    Stream_Prepare(Stream_Video);
    Fill("Codec", Ztring().From_CC4(Codec));
    Fill("Width", BigEndian2int16u(Buffer+Buffer_Offset+12)); //Width
    Fill("Height", BigEndian2int16u(Buffer+Buffer_Offset+14)); //Height
    Fill("Resolution", BigEndian2int16u(Buffer+Buffer_Offset+16)); //Resolution
    Fill("FrameRate", BigEndian2int16u(Buffer+Buffer_Offset+22)); //FrameRate
}

//---------------------------------------------------------------------------
void File_Rm::MDPR_realaudio()
{
    //Parsing
    std::string FourCC3="lpcJ"; //description of this codec : http://focus.ti.com/lit/an/spra136/spra136.pdf http://en.wikipedia.org/wiki/VSELP
    std::string FourCC4;
    int32u FourCC5=0;
    int16u Version, Samplerate=8000, Samplesize=16, Channels=0;
    CC_BEGIN();
    SKIP_C4(                                                    Header signature);
    GET_B2 (Version,                                            Version);
    INTEGRITY_VERSION(5);
    if (Version==3)
    {
        Ztring title, author, copyright, comment;
        int32u length;
        int8u title_len, author_len, copyright_len, comment_len;
        SKIP_B2(                                                Header size); //Header size, after this tag.
        GET_B2 (Channels,                                       Channels);
        SKIP_B4(                                                Uknown);
        SKIP_B4(                                                Uknown);
        SKIP_B4(                                                Data size);
        GET_B1 (title_len,                                      title_len); //The length of the title data in bytes.
        GET_LOCAL(title_len, title,                             title); //An array of ASCII characters that represents the title information for the RealMedia file.
        GET_B1 (author_len,                                     author_len); //The length of the author data in bytes.
        GET_LOCAL(author_len, author,                           author); //An array of ASCII characters that represents the author information for the RealMedia file.
        GET_B1 (copyright_len,                                  copyright_len); //The length of the copyright data in bytes.
        GET_LOCAL(copyright_len, copyright,                     copyright); //An array of ASCII characters that represents the copyright information for the RealMedia file.
        GET_B1 (comment_len,                                    comment_len); //The length of the comment data in bytes.
        GET_LOCAL(comment_len, comment,                         comment); //An array of ASCII characters that represents the comment information for the RealMedia file.
        if (Stream_Pos<Element_Size) //Optional
        {
            SKIP_B1(                                            Uknown);
            GET_B4 (length,                                     Fourcc string length);
            GET_STRING(length, FourCC3,                         Fourcc string);
        }
        CC_END();

        //Filling
        Fill(Stream_General, 0, "PlayTime", title);
        Fill(Stream_General, 0, "Performer", author);
        Fill(Stream_General, 0, "Copyright", copyright);
        Fill(Stream_General, 0, "Comment", comment);
    }
    if (Version==4 || Version==5)
    {
        SKIP_B2(                                                Unused);
        SKIP_C4(                                                ra signature);
        SKIP_B4(                                                AudioFileSize);
        SKIP_B2(                                                Version2);
        SKIP_B4(                                                Header size);
        SKIP_B2(                                                Codec flavor);
        SKIP_B4(                                                Coded frame size);
        SKIP_B4(                                                AudioBytes);
        SKIP_B4(                                                BytesPerMinute);
        SKIP_B4(                                                Unknown);
        SKIP_B2(                                                Sub packet h);
        SKIP_B2(                                                Frame size);
        SKIP_B2(                                                Subpacket size);
        SKIP_B2(                                                Unknown);
    }
    if (Version==5)
    {
        SKIP_B2(                                                Unknown);
        SKIP_B2(                                                Unknown);
        SKIP_B2(                                                Unknown);
    }
    if (Version==4 || Version==5)
    {
        GET_B2 (Samplerate,                                     Samplerate);
        SKIP_B2(                                                Unknown);
        GET_B2 (Samplesize,                                     Samplesize);
        GET_B2 (Channels,                                       Channels);
    }
    if (Version==4)
    {
        int8u length;
        GET_B1 (length,                                         Interleaver ID string lengt);
        SKIP_LOCAL(length,                                      Interleaver ID string);
        GET_B1 (length,                                         FourCC string lengt);
        GET_STRING(length, FourCC4,                             FourCC string);
    }
    if (Version==5)
    {
        SKIP_C4(                                                Interleaver ID);
        GET_C4 (FourCC5,                                        FourCC);
    }
    if (Version==4 || Version==5)
    {
        SKIP_B1(                                                Unknown);
        SKIP_B1(                                                Unknown);
        SKIP_B1(                                                Unknown);
    }
    if (Version==5)
    {
        SKIP_B1(                                                Unknown);
    }
    if (Version==4 || Version==5)
    {
        int32u length;
        GET_B4 (length,                                         Codec extradata length);
        SKIP_XX(length,                                         Codec extradata);
    }

    //Filling
    Stream_Prepare(Stream_Audio);
    if (Version==3)
        Fill("Codec", FourCC3);
    if (Version==4)
        Fill("Codec", FourCC4);
    if (Version==5)
        Fill("Codec", Ztring().From_CC4(FourCC5));
    Fill("SampleRate", Samplerate);
    Fill("Resolution", Samplesize);
    Fill("Channel(s)", Channels);
}

//---------------------------------------------------------------------------
void File_Rm::MDPR_mp3()
{
    //Filling
    Stream_Prepare(Stream_Audio);
    Fill("Codec", "MPEG1AL3");
}

//---------------------------------------------------------------------------
void File_Rm::MDPR_ralf()
{
    //Filling
    Stream_Prepare(Stream_Audio);
    Fill("Codec", "ralf");
}

//---------------------------------------------------------------------------
void File_Rm::MDPR_fileinfo()
{
    MDPR_IsStream=false;

    //Parsing
    int16u Version, num_physical_streams, num_rules, num_properties;
    CC_BEGIN();
    SKIP_B4(                                                    Size);
    GET_B2 (Version,                                            object_version);
    INTEGRITY_VERSION(0);
    GET_B2 (num_physical_streams,                               num_physical_streams); //The number of physical streams that make up this logical stream.
    for (int16u Pos=0; Pos<num_physical_streams; Pos++)
    {
        SKIP_B2(                                                physical_stream_numbers); //The list of physical stream numbers that comprise this logical stream.
        SKIP_B4(                                                data_offsets); //The list of data offsets indicating the start of the data section for each physical stream.
    }
    GET_B2 (num_rules,                                          num_rules); //The number of ASM rules for the logical stream. Each physical stream in the logical stream has at least one ASM rule associated with it or it will never get played. The mapping of ASM rule numbers to physical stream numbers is stored in a list immediately following this member. These physical stream numbers refer to the stream_number  field found in the Media Properties Object for each physical stream belonging to this logical stream.
    for (int16u Pos=0; Pos<num_physical_streams; Pos++)
        SKIP_B2(                                                rule_to_physical_stream_number_map); //The list of physical stream numbers that map to each rule. Each entry in the map corresponds to a 0-based rule number. The value in each entry is set to the physical stream number for the rule.
    GET_B2 (num_properties,                                     num_properties); //The number of NameValueProperty structures contained in this structure. These name/value structures can be used to identify properties of this logical stream (for example, language).

    //Parsing
    for (int16u Pos=0; Pos<num_properties; Pos++)
    {
        FLUSH();
        std::string name;
        int32u size, type;
        int16u value_length;
        int8u name_length;
        PEEK_B4(size);
        ELEMENT(2, "property", size);
        SKIP_B4(                                                size);
        SKIP_B2(                                                object_version);
        GET_B1 (name_length,                                    name_length); //The length of the name data.
        GET_STRING(name_length, name,                           name); //The name string data.
        GET_B4 (type,                                           type); //The type of the value data.
        GET_B2 (value_length,                                   value_length); //value_length
        switch (type)
        {
            case 0 : //Unsigned integer
                SKIP_B4(                                        value_data); break; //unsigned integer
            case 2 : //String
                SKIP_LOCAL(value_length,                        value_data); break; //string
            default : SKIP_XX(value_length,                     unknown);
        }

    }
    ELEMENT_END(); //Details_Level_Last=1;
}

//---------------------------------------------------------------------------
void File_Rm::PROP()
{
    NAME_VERSION("PROPerties");
    INTEGRITY_VERSION(0);

    //Parsing
    int32u avg_bit_rate, duration;
    int16u flags;
    CC_BEGIN();
    SKIP_B4(                                                    max_bit_rate); //The maximum bit rate required to deliver this file over a network.
    GET_B4 (avg_bit_rate,                                       avg_bit_rate); //The average bit rate required to deliver this file over a network.
    SKIP_B4(                                                    max_packet_size); //The largest packet size (in bytes) in the media data.
    SKIP_B4(                                                    avg_packet_size); //The average packet size (in bytes) in the media data.
    SKIP_B4(                                                    num_packets); //The number of packets in the media data.
    GET_B4 (duration,                                           duration); //The duration of the file in milliseconds.
    SKIP_B4(                                                    preroll); //The number of milliseconds to prebuffer before starting playback.
    SKIP_B4(                                                    index_offset); //The offset in bytes from the start of the file to the start of the index header object.
    SKIP_B4(                                                    data_offset); //The offset in bytes from the start of the file to the start of the Data Section. \n Note: There can be a number of Data_Chunk_Headers in a RealMedia file. The data_offset  value specifies the offset in bytes to the first Data_Chunk_Header. The offsets to the other Data_Chunk_Headers can be derived from the next_data_header field in a Data_Chunk_Header.
    SKIP_B2(                                                    num_streams); //The total number of media properties headers in the main headers section.
    GET_B2 (flags,                                              flags); //Bit mask containing information about this file.
        SKIP_FLAGS(flags, 0,                                    Save_Enabled); //If 1, clients are allowed to save this file to disk.
        SKIP_FLAGS(flags, 1,                                    Perfect_Play); //If 1, clients are instructed to use extra buffering.
        SKIP_FLAGS(flags, 2,                                    Live_Broadcast); //If 1, these streams are from a live broadcast.
        SKIP_FLAGS(flags, 3,                                    Allow_Download);
    CC_END();

    //Filling
    Fill(Stream_General, 0, "BitRate", avg_bit_rate);
    Fill(Stream_General, 0, "PlayTime", duration);
}

//---------------------------------------------------------------------------
void File_Rm::RJMD()
{
    NAME("Metadata Tag");

    //Parsing
    CC_BEGIN();
    SKIP_B4(                                                    object_version);
    CC_END_CANBEMORE();

    //Parsing
    Buffer_Offset+=4;
    Element_Size-=4;
    RJMD_property(std::string());
}

//---------------------------------------------------------------------------
void File_Rm::RJMD_property(std::string Name)
{
    NAME("Property");

    //Parsing
    Ztring value;
    std::string name;
    int32u type, flags, num_subproperties, name_length, value_length, valueI;
    CC_BEGIN();
    SKIP_B4(                                                    size);
    GET_B4 (type,                                               type);
    GET_B4 (flags,                                              flags);
        SKIP_FLAGS(flags, 0,                                    readonly); //Read only, cannot be modified.
        SKIP_FLAGS(flags, 1,                                    private); //Private, do not expose to users.
        SKIP_FLAGS(flags, 2,                                    type_dexcriptor); //Type descriptor used to further define type of value.
    SKIP_B4(                                                    value_offset); //The offset to the value_length , relative to the beginning of the MetadataProperty  structure.
    SKIP_B4(                                                    subproperties_offset); //The offset to the subproperties_list , relative to the beginning of the MetadataProperty  structure.
    GET_B4 (num_subproperties,                                  num_subproperties); //The number of subproperties for this MetadataProperty  structure.
    GET_B4 (name_length,                                        name_length); //The length of the name data, including the null-terminator.
    GET_STRING(name_length, name,                               name); //The name of the property (string data).
    GET_B4 (value_length,                                       value_length); //The length of the value data.
    switch(type)
    {
        case 0x00 : //Nothing
                    SKIP_XX(value_length,                       Junk);
                    break;
        case 0x01 : //String (text).
                    GET_LOCAL(value_length, value,              value); //String.
                    break;
        case 0x02 : //Separated list of strings, separator specified as sub-property/type descriptor.
                    GET_LOCAL(value_length, value,              value); //String.
                    break;
        case 0x03 : //Boolean flag�either 1 byte or 4 bytes, check size value.
                    switch(value_length)
                    {
                        case 1 : GET_L1(valueI,                 value); //1-byte boolean.
                                 value.From_Number(valueI);
                                 break;
                        case 4 : GET_L4(valueI,                 value); //4-byte boolean.
                                 value.From_Number(valueI);
                                 break;
                        default: SKIP_XX(value_length,          Unknown);
                    }
                    break;
        case 0x04 : //Four-byte integer.
                    GET_L4(valueI,                              value);
                    value.From_Number(valueI);
                    break;
        case 0x05 : //Byte stream.
                    SKIP_XX(value_length,                       Byte stream);
                    break;
        case 0x06 : //String (URL).
                    GET_LOCAL(value_length, value,              value); //String.
                    break;
        case 0x07 : //String representation of the date in the form: YYYYmmDDHHMMSS (m = month, M = minutes).
                    GET_LOCAL(value_length, value,              value); //String.
                    break;
        case 0x08 : //String (file name)
                    GET_LOCAL(value_length, value,              value); //String.
                    break;
        case 0x09 : //This property has subproperties, but its own value is empty.
                    SKIP_XX(value_length,                       junk);
                    break;
        case 0x0A : //Large buffer of data, use sub-properties/type descriptors to identify mime-type.
                    SKIP_XX(value_length,                       data);
                    break;
        default   : //Unknown
                    SKIP_XX(value_length,                       unknown);
                    break;
    }

    //Filling
    if (!Name.empty())
        Name+='/';
    Name+=name;
    if (Name!="Track/Comments/DataSize"
     && Name!="Track/Comments/MimeType"
       )
    Fill(Stream_General, 0, Name.c_str(), value);

    //Parsing
    for (int32u Pos=0; Pos<num_subproperties; Pos++)
    {
        FLUSH();
        ELEMENT_BEGIN();
        #ifndef MEDIAINFO_MINIMIZESIZE
            ELEMENT(Details_Level_Last+1, "PropListEntry", 8);
        #endif //MEDIAINFO_MINIMIZESIZE
        SKIP_B4(                                                offset); //The offset for this indexed sub-property, relative to the beginning of the containing MetadataProperty.
        SKIP_B4(                                                num_props_for_name); //The number of sub-properties that share the same name. For example, a lyrics property could have multiple versions as differentiated by the language sub-property type descriptor.
        ELEMENT_END();
    }
    for (int32u Pos=0; Pos<num_subproperties; Pos++)
    {
        FLUSH();
        int32u size;
        PEEK_B4(size);
        #ifndef MEDIAINFO_MINIMIZESIZE
            ELEMENT(Details_Level_Last+1, "MetadataProperty", size);
        #endif //MEDIAINFO_MINIMIZESIZE
        Buffer_Offset+=Stream_Pos;
        Element_Size-=Stream_Pos;
        RJMD_property(Name);
        Buffer_Offset-=Stream_Pos;
        Element_Size+=Stream_Pos;
        Stream_Pos+=size;
        ELEMENT_END();
    }
}

//---------------------------------------------------------------------------
void File_Rm::RMJE()
{
    NAME("Metadata Section Footer");

    //Parsing
    CC_BEGIN();
    SKIP_B4(                                                    object_version);
    SKIP_B4(                                                    size); //The size of the preceding metadata tag.
    CC_END();
}

//---------------------------------------------------------------------------
void File_Rm::RMMD()
{
    NAME("Metadata Section Header");

    //Parsing
    CC_BEGIN();
    SKIP_B4(                                                    size); //The size of the full metadata section in bytes.
    CC_END();
}

//---------------------------------------------------------------------------
void File_Rm::TAG()
{
    NAME("Id3v1 Tag");
}

//***************************************************************************
// Helpers
//***************************************************************************

//---------------------------------------------------------------------------
bool File_Rm::Element_Name_Get()
{
    //Enough data?
    if (Buffer_Offset+4>Buffer_Size)
        return false;

    //Element name
    Element_Name=CC4(Buffer+Buffer_Offset);

    return true;
}

//---------------------------------------------------------------------------
bool File_Rm::Element_Size_Get()
{
    if (Element_Name==Rm::RMMD)
    {
        Element_HeaderSize=4;
        Element_Size=4; //Element_Name + Size of the Metadata section (after Version) in bytes.
    }
    else if (Element_Name==Rm::RJMD)
    {
        Element_HeaderSize=4;
        Element_Size=BigEndian2int32u(Buffer+Buffer_Offset+8)+4; //Element_Name + Version + Size of the section (after Version) in bytes.
    }
    else if (Element_Name==Rm::RMJE)
    {
        Element_HeaderSize=4;
        Element_Size=8;
    }
    else if ((Element_Name&0xFFFFFF00)==Rm::TAG)
    {
        Element_Name=Rm::TAG;
        Element_HeaderSize=0;
        Element_Size=128;
    }
    else
    {
        Element_Size=BigEndian2int32u(Buffer+Buffer_Offset+4); //The size of the section in bytes.
        if (Element_Size<8)
        {
            File_Offset=File_Size;
            return false;
        }
        Element_HeaderSize=8;
        Element_Size-=8;
    }
    Element_Next=File_Offset+Buffer_Offset+Element_HeaderSize+Element_Size;

    return true;
}

//---------------------------------------------------------------------------
void File_Rm::HowTo(stream_t StreamKind)
{
    switch (StreamKind)
    {
        case (Stream_General) :
            Fill_HowTo("Format", "R");
            Fill_HowTo("BitRate", "R");
            Fill_HowTo("Performer", "R");
            Fill_HowTo("Copyright", "R");
            Fill_HowTo("Comment", "R");
            Fill_HowTo("PlayTime", "R");
            break;
        case (Stream_Video) :
            Fill_HowTo("Codec", "R");
            Fill_HowTo("Width", "R");
            Fill_HowTo("Height", "R");
            Fill_HowTo("Resolution", "R");
            Fill_HowTo("FrameRate", "R");
            Fill_HowTo("BitRate", "R");
            Fill_HowTo("Delay", "R");
            Fill_HowTo("PlayTime", "R");
            break;
        case (Stream_Audio) :
            Fill_HowTo("Codec", "R");
            Fill_HowTo("SamplingRate", "R");
            Fill_HowTo("Channel(s)", "R");
            Fill_HowTo("BitRate", "R");
            Fill_HowTo("Delay", "R");
            Fill_HowTo("PlayTime", "R");
            break;
        case (Stream_Text) :
            break;
        case (Stream_Chapters) :
            break;
        case (Stream_Image) :
            break;
        case (Stream_Menu) :
            break;
        case (Stream_Max) :
            break;
    }
}

} //NameSpace

#endif //MEDIAINFO_RM_YES
