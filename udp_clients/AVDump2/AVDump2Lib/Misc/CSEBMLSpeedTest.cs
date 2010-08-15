﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CSEBMLLib;
using CSEBMLLib.DocTypes.Elements;
using System.Threading;
using AVDump2Lib.InfoGathering.Parser.CSEBMLLib;
using AVDump2Lib.BlockBuffer;
using System.IO;
using CSEBMLLib.DocTypes;

namespace AVDump2Lib.Misc {
	public class CSEBMLSpeedTest {
		private bool finished;
		private FileSource src;
		private ulong hitCount;

		public void Start(string filePath, int blockSize, int blockCount) {
			//var fileStream = System.IO.File.Open(filePath, System.IO.FileMode.Open, System.IO.FileAccess.Read, System.IO.FileShare.Read);
			//var blockSource = new ByteStreamToBlock(fileStream, blockSize);
			//var circb = new CircularBuffer<byte[]>(1, (int)Math.Log(blockCount, 2));
			//var buffer = new RefillBuffer<byte[]>(circb, blockSource);
			//buffer.Start();


			//src = new FileSource(buffer, 0);
			//var docType = new DocTypeEBML(new DocTypeMatroskaV2());
			//var reader = new EBMLReader(src, docType);

			//while(circb.ProducerCanWrite() && fileStream.Position != fileStream.Length) Thread.Sleep(20);


			//(new Thread(Speed)).Start();
			//SpeedRecurse(reader);
			//finished = true;
		}

		private void SpeedRecurse(EBMLReader reader) {
			ElementInfo elementInfo;

			while((elementInfo = reader.NextElementInfo()) != null) {
				hitCount++;
				if(elementInfo.ElementType.Type == ElementType.eType.Master) {
					reader.EnterMasterElement();
					SpeedRecurse(reader);
					reader.LeaveMasterElement();

				} else {
					reader.RetrieveValue();
				}
			}
		}

		private void Speed() {
			DateTime started = DateTime.Now;
			DateTime now;
			int buffer;
			while(!finished) {
				Thread.Sleep(20);
				now = DateTime.Now;

				Console.CursorTop = 0;
				Console.Write(((int)(src.Position / (double)(1024 * 1024))).ToString("#####") + " " + (now - started).TotalSeconds.ToString("#####") + " ");
				Console.WriteLine(((int)((src.Position / (double)(1024 * 1024)) / (now - started).TotalSeconds)).ToString("###0.00") + "   " + hitCount);

				buffer = (int)(Console.WindowWidth * (src.buffer.BaseStream.Count(0) / (double)src.buffer.BaseStream.BlockCount));
				Console.Write("".PadLeft(buffer, '*'));
				Console.WriteLine("".PadLeft(Console.WindowWidth - buffer));
			}
		}
	}
}
