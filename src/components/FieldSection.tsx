import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MapPin, 
  Battery, 
  CheckSquare, 
  FileText, 
  AlertTriangle, 
  Send, 
  UserCheck, 
  Download, 
  Smartphone 
} from "lucide-react";
import { WorkerStatus, CrowdReport, TreeRecord } from "../types";

interface FieldSectionProps {
  workers: WorkerStatus[];
  reports: CrowdReport[];
  onUpdateWorkerStatus: (id: string, status: WorkerStatus["status"]) => void;
  onUpdateReportStatus: (id: string, status: CrowdReport["status"]) => void;
  onConfirmInfection: (report: CrowdReport) => void;
}

export default function FieldSection({
  workers,
  reports,
  onUpdateWorkerStatus,
  onUpdateReportStatus,
  onConfirmInfection
}: FieldSectionProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "crowd" | "mobile">("tracking");
  
  // Mobile form inputs
  const [mobileWorker, setMobileWorker] = useState("김예찰");
  const [mobileArea, setMobileArea] = useState("경북 포항 죽장면 GRID-3629");
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(false);
  const [comment, setComment] = useState("수관부 상단 잎들이 노랗게 변색되고 상처 주변에서 송진 배출이 급감한 것을 확인함. 시료 칩 채취 후 국립산림과학원 이송 조치 대기.");
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Selected crowd report detailed state (FR-FLD-005)
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || "");
  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = `
===================================================
[소나무재선충병 예찰요원 스마트 일일 활동 보고서 (FLD-003)]
===================================================
보고일시: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
조 사 자: ${mobileWorker} (GPS 추적 ID: W-101)
예찰구역: ${mobileArea}
---------------------------------------------------
[외부 변색 및 3대 병징 체크리스트]
1. 수관부 잎의 급격한 변색 (갈변/황변): [적합]
2. 구멍 천공 시 송진 분비 저하/중단: [적합]
3. 우화 탈출공 및 매개충 유충 가해흔: [부적합 / 발견안됨]
---------------------------------------------------
[요원 현장 소견]
"${comment}"
---------------------------------------------------
본 서류는 500m 격자 환경 데이터와 통합 대조 검증을 완료한
행정 보고서 초안입니다. (국가산림정보시스템 연계 규격)
===================================================
`;
    setGeneratedReport(doc);
  };

  const handleConfirmReportToInfection = (rep: CrowdReport) => {
    onConfirmInfection(rep);
    onUpdateReportStatus(rep.id, "확진전환");
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 max-w-lg">
        <button 
          onClick={() => setActiveTab("tracking")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "tracking" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-slate-900"}`}
        >
          🚶 요원 GPS 및 출동배정
        </button>
        <button 
          onClick={() => setActiveTab("crowd")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "crowd" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-slate-900"}`}
        >
          👥 크라우드 시민 제보
        </button>
        <button 
          onClick={() => setActiveTab("mobile")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "mobile" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-slate-900"}`}
        >
          📱 요원 스마트 활동 보고서
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "tracking" && (
          <motion.div 
            key="tracking-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Real-time Worker Dispatch (FR-FLD-002) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      👷 예찰 요원 출동 상태 및 임무 자동 배정 (FLD-002)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      XGBoost 고위험점수 0.7 이상 격자에 대한 지능형 최적 경로 및 구역 배정 목록
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                        <th className="py-3 px-3">조사 요원</th>
                        <th className="py-3 px-3">배정 격자 구역</th>
                        <th className="py-3 px-3">이동 잔여거리</th>
                        <th className="py-3 px-3">배터리</th>
                        <th className="py-3 px-3 text-right">상태 전환</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {workers.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white shrink-0" />
                              <span className="font-bold text-slate-900">{w.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-600">{w.region}</td>
                          <td className="py-3.5 px-3 font-mono text-slate-500">{w.distance}</td>
                          <td className="py-3.5 px-3 font-mono">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Battery size={14} className={w.battery <= 50 ? "text-rose-500" : "text-emerald-600"} />
                              <span>{w.battery}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <select 
                              value={w.status}
                              onChange={(e) => onUpdateWorkerStatus(w.id, e.target.value as any)}
                              className="text-[11px] font-bold border border-slate-200 rounded-lg p-1 outline-none bg-white"
                            >
                              <option value="대기">대기</option>
                              <option value="출동">출동</option>
                              <option value="복귀">복귀</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Simulated Live GPS Map tracking (FR-FLD-001) */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  🌐 실시간 요원 GPS 추적 폴리라인 (FLD-001)
                </h3>

                <div className="bg-gradient-to-br from-emerald-100/40 via-sky-50/30 to-emerald-50 border border-slate-200 rounded-2xl h-[280px] relative overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-8 gap-0.5 pointer-events-none opacity-25">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border-t border-l border-slate-400/30 w-full h-12" />
                    ))}
                  </div>

                  {/* Real-time route vector representation */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.path 
                      d="M 50,220 Q 120,120 220,180 T 340,90"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashOffset: -100 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>

                  {/* Active worker spots */}
                  <div className="absolute top-[34%] left-[27%] group cursor-pointer z-10">
                    <div className="w-5 h-5 rounded-full bg-emerald-800 border-2 border-white shadow-lg flex items-center justify-center text-[8px] text-white font-bold animate-bounce">
                      김
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                      김예찰 (75% 진행)
                    </div>
                  </div>

                  <div className="absolute bottom-[40%] right-[30%] group cursor-pointer z-10">
                    <div className="w-5 h-5 rounded-full bg-emerald-800 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      박
                    </div>
                  </div>

                  {/* Target Point coordinates marker */}
                  <div className="absolute top-[25%] left-[72%] text-center space-y-1">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                    <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200 font-bold whitespace-nowrap">PT-2026-0712</span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-mono text-[9px] p-2 rounded-lg space-y-0.5">
                    <div>GPS SYNC: 30s INTERV</div>
                    <div>TELEMETRY ACTIVE</div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100/60 text-xs text-emerald-800/90 leading-relaxed font-semibold">
                  🌿 <b>스마트 조율:</b> 산악 음영 지역 이탈 방지를 위해 LoRa 및 하이브리드 GPS 캐싱 기술(NFR)이 장착되어 있어 신호 유실 시 30초 내 오프라인 버퍼링을 지원합니다.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Crowdsourced reports center (FR-FLD-004, FR-FLD-005, FR-FLD-006) */}
        {activeTab === "crowd" && (
          <motion.div 
            key="crowd-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Reports List */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                👥 크라우드 소싱 기반 대국민 시민 제보대장 (FLD-004)
              </h3>

              <div className="space-y-4">
                {reports.map((rep) => (
                  <div 
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedReportId === rep.id ? "bg-emerald-50/60 border-emerald-300 shadow-sm" : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{rep.id} | {rep.reporter} | {rep.date}</span>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{rep.title}</h4>
                        <span className="text-xs text-slate-500 font-semibold inline-block">{rep.region}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          rep.status === "접수" ? "bg-sky-100 text-sky-700" : rep.status === "검토" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {rep.status}
                        </span>
                        <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">
                          AI 판단: {rep.aiProbability}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected report detail board (FR-FLD-005, FR-FLD-006) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                🔎 시민 제보 원문 정밀 검증 (FLD-005)
              </h3>

              {selectedReport ? (
                <div className="space-y-4 text-xs pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">제보 제목</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedReport.title}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">제보 상세 서술</span>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">{selectedReport.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">제보 지역</span>
                        <span className="font-bold text-slate-700">{selectedReport.region}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">AI 감염 매핑지수</span>
                        <span className="font-extrabold text-rose-600">{selectedReport.aiProbability}% 확률</span>
                      </div>
                    </div>
                  </div>

                  {/* Citizen SMS feedback integration (FR-FLD-006) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider block">제보 처리 및 대장 연계 (FLD-006)</span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConfirmReportToInfection(selectedReport)}
                        disabled={selectedReport.status === "확진전환"}
                        className="flex-1 bg-emerald-800 text-white rounded-xl py-3 font-bold hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5"
                      >
                        <UserCheck size={14} />
                        <span>확진 대장 전환</span>
                      </button>
                      <button 
                        onClick={() => onUpdateReportStatus(selectedReport.id, "반려")}
                        disabled={selectedReport.status === "반려" || selectedReport.status === "확진전환"}
                        className="px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold text-slate-600 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        반려
                      </button>
                    </div>

                    {selectedReport.status === "확진전환" && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-[11px] font-medium leading-relaxed"
                      >
                        📬 <b>제보자 알림 자동 발송 완료:</b> 시민 {selectedReport.reporter}님께 "소나무재선충 확진 확인에 따른 방제 배정" 감사 피드백 SMS가 자동 전송되었습니다. (FR-FLD-006 연계)
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  제보를 선택해 주십시오.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Mobile report form generator (FR-FLD-003) */}
        {activeTab === "mobile" && (
          <motion.div 
            key="mobile-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Mobile frame emulator */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex justify-center">
              <div className="w-full max-w-[340px] border-[12px] border-slate-900 rounded-[42px] overflow-hidden shadow-2xl relative bg-slate-50 flex flex-col h-[540px]">
                
                {/* Mobile Camera bar */}
                <div className="w-32 h-5 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-850 border border-slate-800" />
                </div>

                {/* Mobile Header */}
                <div className="bg-emerald-800 text-white pt-8 pb-4 px-4 shadow-sm flex items-center gap-1.5">
                  <Smartphone size={16} />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">M-Patrol System (FLD-003)</span>
                </div>

                {/* Mobile Content body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">조사 요원 서명</label>
                    <input 
                      type="text" 
                      value={mobileWorker}
                      onChange={(e) => setMobileWorker(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">현장 위치 (GPS 자동 투영)</label>
                    <input 
                      type="text" 
                      value={mobileArea}
                      onChange={(e) => setMobileArea(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-500 block">3대 주요 병징 체크리스트</label>
                    <div className="space-y-2 font-bold text-slate-700">
                      <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 cursor-pointer">
                        <input type="checkbox" checked={check1} onChange={() => setCheck1(!check1)} className="accent-emerald-700" />
                        <span>수관부 잎 급격한 갈변·황변</span>
                      </label>
                      <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 cursor-pointer">
                        <input type="checkbox" checked={check2} onChange={() => setCheck2(!check2)} className="accent-emerald-700" />
                        <span>송진 분비 현저한 저하</span>
                      </label>
                      <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 cursor-pointer">
                        <input type="checkbox" checked={check3} onChange={() => setCheck3(!check3)} className="accent-emerald-700" />
                        <span>솔수염하늘소 성충 탈출 흔적</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">요원 현장 특이사항 기술</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-medium"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateReport}
                    className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-900 transition-colors mt-2"
                  >
                    일일 보고서 자동 캡처
                  </button>
                </div>
              </div>
            </div>

            {/* Generated report preview */}
            <div className="bg-slate-900 text-emerald-400 font-mono text-xs rounded-3xl p-6 border border-slate-800 shadow-inner flex flex-col justify-between h-[540px]">
              <div className="space-y-2 overflow-y-auto">
                <span className="text-[10px] text-slate-500 font-bold block">// GENERATED OFFICIAL PROTOCOL PREVIEW</span>
                {generatedReport ? (
                  <pre className="whitespace-pre-wrap leading-relaxed text-[11px] font-bold font-mono">
                    {generatedReport}
                  </pre>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-slate-500 text-center font-bold">
                    좌측 스마트폰 에뮬레이터 폼을 작성하고<br />
                    "일일 보고서 자동 캡처" 단추를 누르면<br />
                    FR-FLD-003 자동 생성 보고서 규격이 캡처됩니다.
                  </div>
                )}
              </div>

              {generatedReport && (
                <button 
                  onClick={() => {
                    const blob = new Blob([generatedReport], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `Patrol-Report-${mobileWorker}-${new Date().toISOString().split("T")[0]}.txt`;
                    link.click();
                  }}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 font-bold transition-colors w-full mt-4"
                >
                  <Download size={14} />
                  <span>예찰 일지 텍스트 다운로드 (.txt)</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
