import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores";
import {
  evaluateSpeaking,
  evaluateSpeakingAudio,
  getSpeakingExerciseById,
  type SpeakingExerciseDto,
} from "../../api/speakingExerciseApi";
import { Button } from "../../components/ui";

// Type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function SpeakingPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const speakingExerciseId = Number(id);
  const { user } = useAuthStore();

  // Data
  const [exercise, setExercise] = useState<SpeakingExerciseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State
  const [status, setStatus] = useState<'intro' | 'active' | 'review' | 'finished'>('intro');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins for speaking
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score?: number | null; feedback?: string | null; userText?: string | null } | null>(null);

  // Audio Recording (MediaRecorder)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Speech Recognition
  const recognitionRef = useRef<any>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript || interimTranscript) {
          setAnswerText(prev => {
            const base = prev.replace(/\s*\(recording\.\.\.\)\s*$/, '');
            if (finalTranscript) {
              return base + (base && !base.endsWith(' ') ? ' ' : '') + finalTranscript;
            }
            return base + " (recording...)";
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };

      recognitionRef.current.onend = () => {
        // If we are still recording audio, restart speech recognition 
        // Chrome often stops recognition after a pause, we want to keep it going if isRecording is true
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) { /* ignore restart error */ }
        }
      };
    }
  }, []);

  // Audio Visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f97316'); // orange-500
        gradient.addColorStop(1, '#ea580c'); // orange-600

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Visualizer
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Resume if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      sourceRef.current = source;
      visualize();


      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url); // Ensure this is set for review
        setAudioBlob(audioBlob);
        _logger_info(`Audio blob created, size: ${audioBlob.size} bytes`);

        // Stop updates
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      _logger_info("MediaRecorder stopped.");
    }
  };

  // Helper for logging (internal)
  const _logger_info = (msg: string) => console.log(`[SpeakingLog] ${msg}`);

  const toggleRecording = async () => {
    if (isRecording) {
      // STOP
      if (recognitionRef.current) recognitionRef.current.stop();
      stopMediaRecording();
      setIsRecording(false);
      isRecordingRef.current = false;
    } else {
      // START
      // 1. Start Speech Recognition (if supported) for transcript
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) { console.error(e); }
      }

      // 2. Start Media Recorder for actual audio
      await startMediaRecording();

      setIsRecording(true);
      isRecordingRef.current = true;
      // Clear previous inputs
      if (status === 'intro') {
        setAnswerText("");
        setAudioUrl(null);
        setAudioBlob(null);
      }
    }
  };

  useEffect(() => {
    if (!speakingExerciseId) return;
    setIsLoading(true);
    getSpeakingExerciseById(speakingExerciseId)
      .then((data) => {
        setExercise(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load speaking exercise.");
      })
      .finally(() => setIsLoading(false));
  }, [speakingExerciseId]);

  // Timer
  useEffect(() => {
    if (status !== 'active') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('review');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);


  const handleStart = () => {
    setStatus('active');
  };

  const handleFinishRecording = () => {
    // ALWAYS attempt to stop, even if SpeechRecognition failed
    recognitionRef.current?.stop();
    stopMediaRecording();
    setIsRecording(false);

    setStatus('review');
  };

  const handleSubmit = async () => {
    if (!exercise) return;

    if (!user) {
      alert("Authentication error. Please login.");
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      // If we have an audio file, send it to the new endpoint
      if (audioBlob) {
        const extension = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
        const fileName = `recording_${Date.now()}.${extension}`;
        res = await evaluateSpeakingAudio(speakingExerciseId, audioBlob, user.targetBand || 6.5, fileName);
        // If browser transcription is empty, get accurate transcription from Server's AI Whisper
        if (!answerText && res.userText) {
          setAnswerText(res.userText);
        }
      } else {
        // Fallback to text-only evaluation
        res = await evaluateSpeaking(speakingExerciseId, {
          userId: user.id || 1,
          answerText: answerText,
          targetBand: user.targetBand || 6.5,
        });
      }
      setResult(res);
      setStatus('finished');
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
        <p className="text-gray-600 mb-6">{error || 'Exercise not found'}</p>
        <Button onClick={() => navigate('/speaking/list')}>Back to List</Button>
      </div>
    );
  }

  // INTRO SCREEN
  if (status === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-orange-500 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
            <p className="opacity-90">IELTS Speaking Practice</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-500 mb-1">{exercise.part}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Phần</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-500 mb-1">~15</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Phút</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-500 mb-1">{exercise.level}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Trình độ</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-500 mb-1">AI</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Chấm điểm</div>
              </div>
            </div>

            <div className="prose text-gray-600 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Hướng dẫn:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bạn sẽ thấy đề bài Speaking ở màn hình tiếp theo.</li>
                <li>Nhấn nút biểu tượng Micro để bắt đầu ghi âm bài nói.</li>
                <li>Nói rõ ràng và mạch lạc.</li>
                <li>Hệ thống sử dụng công nghệ Speech-to-Text để chuyển giọng nói thành văn bản cho AI phân tích.</li>
                <li>Bạn có thể chỉnh sửa bản gỡ băng (transcript) trước khi nộp nếu cần.</li>
              </ul>
            </div>

            {!isSpeechSupported && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
                <strong>Lưu ý:</strong> Trình duyệt của bạn không hỗ trợ tính năng Nhận diện giọng nói. Bạn sẽ cần nhập câu trả lời bằng văn bản thủ công.
              </div>
            )}

            <div className="flex justify-center">
              <Button size="lg" className="w-full md:w-auto px-12 py-4 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200" onClick={handleStart}>
                Bắt đầu làm bài
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE SPEAKING SCREEN
  if (status === 'active') {
    return (
      <div className="h-screen flex flex-col bg-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h2 className="font-outfit text-2xl font-extrabold text-slate-800 tracking-tight">{exercise.title}</h2>
          <div className={`font-mono text-2xl font-extrabold px-6 py-2 rounded-2xl shadow-sm border transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
            {formatTime(timeLeft)}
          </div>
        </header>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Left: Prompt */}
          <div className="w-full md:w-1/3 bg-white border-r border-gray-200 p-8 overflow-y-auto">
            <div className="sticky top-0">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-4">
                {exercise.part}
              </span>

              {exercise.part?.includes('2') && exercise.cueCardJson ? (
                // Premium Cue Card Display
                <div className="bg-[#fff9e6] border-2 border-[#d4af37]/30 rounded-lg p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-5 pointer-events-none">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                  </div>
                  <h3 className="text-xl font-serif font-black text-slate-900 mb-4 border-b border-[#d4af37]/20 pb-2">
                    IELTS Cue Card
                  </h3>
                  {(() => {
                    try {
                      const card = JSON.parse(exercise.cueCardJson);
                      return (
                        <div className="space-y-4">
                          <p className="font-bold text-lg text-slate-800 italic">
                            {card.topic || exercise.topic}
                          </p>
                          <p className="text-sm text-slate-500 font-medium">You should say:</p>
                          <ul className="space-y-2">
                            {card.bullets?.map((bullet: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                                <span className="text-[#d4af37] mt-1">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-slate-400 font-bold mt-4 pt-4 border-t border-[#d4af37]/10 uppercase tracking-widest">
                            And explain why you feel this way
                          </p>
                        </div>
                      );
                    } catch (e) {
                      return <div className="text-gray-900 font-medium text-lg leading-relaxed">{exercise.question}</div>;
                    }
                  })()}
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Topic: {exercise.topic}</h3>
                  <div className="text-gray-900 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                    {exercise.question}
                  </div>
                </>
              )}

              {exercise.tips && (
                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Tips
                  </h4>
                  <p className="text-sm text-blue-700 whitespace-pre-line">{exercise.tips}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Modern Studio Recorder */}
          <div className="w-full md:w-2/3 bg-slate-50 p-6 md:p-14 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl flex flex-col items-center">

              {/* Main Recorder Console */}
              <div className="w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50 p-12 mb-10 relative flex flex-col items-center justify-center overflow-hidden min-h-[400px]">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {/* Visualizer Area */}
                <div className="relative z-10 w-full flex flex-col items-center gap-10">
                  <div className="relative w-full flex items-center justify-center min-h-[180px]">
                    {isRecording ? (
                      <canvas ref={canvasRef} width={600} height={180} className="w-full h-full drop-shadow-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-6 group">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <p className="font-outfit text-slate-400 font-semibold text-xl tracking-tight">Sẵn sàng lắng nghe bạn...</p>
                      </div>
                    )}
                  </div>

                  {isRecording && (
                    <div className="flex flex-col items-center gap-4 bg-emerald-50/50 px-8 py-4 rounded-3xl border border-emerald-100 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {[0.2, 0.4, 0.6].map((delay, i) => (
                            <span key={i} style={{ animationDelay: `${delay}s` }} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                          ))}
                        </div>
                        <p className="font-outfit text-emerald-700 font-bold text-sm uppercase tracking-widest">Giọng nói đang được thu lại</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* REC Badge */}
                {isRecording && (
                  <div className="absolute top-10 right-10 flex items-center gap-3 text-red-500 font-black text-xs bg-red-50 px-5 py-2.5 rounded-full border border-red-100 shadow-sm transition-all tracking-widest">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    LIVE SESSION
                  </div>
                )}
              </div>

              {/* Controls Bar */}
              <div className="flex items-center gap-10 bg-white/60 backdrop-blur-md p-6 rounded-full border border-white shadow-lg">
                <button
                  onClick={toggleRecording}
                  className={`group w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${isRecording ? 'bg-red-500 animate-pulse-red' : 'bg-orange-500 shadow-orange-100'}`}
                >
                  {isRecording ? (
                    <div className="w-7 h-7 bg-white rounded-md shadow-inner"></div>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>

                <div className="h-12 w-px bg-slate-200"></div>

                <Button
                  size="xl"
                  variant={isRecording ? 'outline' : 'primary'}
                  className={`h-16 px-12 rounded-full font-outfit text-lg font-bold shadow-xl transition-all ${!isRecording && 'bg-emerald-600 hover:bg-emerald-700'}`}
                  onClick={handleFinishRecording}
                >
                  {isRecording ? 'Kết thúc ngay' : 'Nộp bài & Chấm điểm'}
                </Button>
              </div>

              <p className="mt-8 text-slate-400 font-medium text-sm">
                💡 {isRecording ? "Nói rõ ràng để đạt điểm Pronunciation cao nhất" : "Nhấn Micro để bắt đầu trả lời"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW SCREEN (Before submitting)
  if (status === 'review') {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
              </div>
              <h1 className="font-outfit text-3xl font-black mb-2 text-white">Kiểm tra câu trả lời</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Lắng nghe lại bản ghi âm trước khi gửi cho giám khảo AI</p>
            </div>

            <div className="p-10 space-y-10">
              {/* Audio Replay Section */}
              <div className="space-y-4">
                <h3 className="font-outfit text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828a1 1 0 010-1.415z" /></svg>
                  </div>
                  Bản ghi âm của bạn
                </h3>
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner flex flex-col items-center justify-center min-h-[120px]">
                  {audioUrl ? (
                    <audio key={audioUrl} src={audioUrl} controls className="w-full max-w-md h-12 accent-slate-900" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium text-sm animate-pulse">Đang xử lý âm thanh...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Preview Section */}
              <div className="space-y-4">
                <h3 className="font-outfit text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  Bản gỡ băng (Transcript)
                </h3>
                <div className="bg-blue-50/50 border-2 border-blue-100 rounded-[2rem] p-10 relative overflow-hidden group">
                  {answerText ? (
                    <div className="space-y-4">
                      <p className="text-blue-900 leading-[1.8] font-medium text-lg italic bg-white/60 p-6 rounded-2xl border border-blue-100 shadow-sm">
                        "{answerText}"
                      </p>
                      <p className="text-blue-600/60 text-xs font-bold text-center uppercase tracking-widest">
                        Draft preview từ trình duyệt
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-800 leading-relaxed font-semibold italic text-lg text-center leading-[1.8]">
                      "Hệ thống AI sẽ tự động gỡ băng chính xác lời nói của bạn sau khi nhấn nộp bài để đảm bảo phân tích đạt kết quả tốt nhất."
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-6 pt-6 text-xs">
                <Button
                  variant="outline"
                  size="xl"
                  className="flex-grow rounded-full h-20 font-outfit font-black border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  onClick={() => setStatus('active')}
                >
                  Ghi âm lại
                </Button>
                <Button
                  size="xl"
                  className="flex-grow rounded-full h-20 font-outfit font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-200 transition-all active:scale-95"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'ĐANG PHÂN TÍCH...' : 'XÁC NHẬN NỘP BÀI'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED / RESULT SCREEN
  if (status === 'finished') {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Dashboard */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-12 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
              </div>
              <h1 className="font-outfit text-5xl font-black mb-4 text-white">Phân tích kết quả</h1>
              <p className="text-orange-50 font-bold text-xl opacity-90 tracking-tight">Giám khảo AI đã hoàn tất đánh giá bài nói của bạn.</p>
            </div>

            <div className="p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Overall Score & Replay */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50"></div>
                  <span className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] block mb-6 relative z-10">OVERALL BAND</span>
                  <div className="text-9xl font-black text-orange-600 tracking-tighter mb-6 relative z-10 drop-shadow-sm">
                    {result?.score?.toFixed(1) || "N/A"}
                  </div>
                  <div className={`inline-block px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wider relative z-10 ${(result?.score || 0) >= 7 ? 'bg-emerald-50 text-emerald-700' :
                    (result?.score || 0) >= 5 ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {(result?.score || 0) >= 7 ? 'Excellent Performance' :
                      (result?.score || 0) >= 5 ? 'Good Effort' : 'Needs Improvement'}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12A10 10 0 112 12a10 10 0 0120 0zM10 8v8l6-4-6-4z" /></svg>
                  </div>
                  <h4 className="font-outfit font-bold text-lg mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    Nghe lại phần trả lời
                  </h4>
                  {audioUrl && <audio controls src={audioUrl} className="w-full h-10 accent-orange-500" />}
                </div>

                {/* Sub-scores Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    try {
                      const fb = result?.feedback ? JSON.parse(result.feedback) : {};
                      const criteria = fb.criteria || {};
                      const labels: Record<string, string> = { FC: 'Fluency', P: 'Pron', LR: 'Lexical', GRA: 'Grammar' };
                      return Object.entries(criteria).map(([key, val]: [string, any]) => (
                        <div key={key} className="bg-white border border-slate-100 p-5 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-3xl font-black text-slate-800 tracking-tighter">{Number(val).toFixed(1)}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{labels[key] || key}</div>
                        </div>
                      ));
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>

              {/* Right Column: In-depth Feedback */}
              <div className="lg:col-span-8 space-y-10">
                {/* Transcript Section */}
                <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
                  <h3 className="font-outfit text-2xl font-black text-slate-800 mb-8 border-l-4 border-orange-500 pl-6 tracking-tight">Văn bản bài nói (AI Transcript)</h3>
                  <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-50 text-slate-700 text-xl font-medium leading-[2] italic whitespace-pre-wrap">
                    "{result?.userText || answerText}"
                  </div>
                </div>

                {/* AI Analysis Sections */}
                {(() => {
                  try {
                    const fb = result?.feedback ? JSON.parse(result.feedback) : null;
                    if (!fb) return null;
                    return (
                      <div className="space-y-10 animate-fade-in text-xs">
                        {/* Corrections Section (Added for completeness) */}
                        {fb.corrections && fb.corrections.length > 0 && (
                          <div className="space-y-6">
                            <h3 className="font-outfit text-2xl font-black text-slate-800 mb-4 tracking-tight">Sửa lỗi Ngữ pháp & Từ vựng</h3>
                            <div className="grid grid-cols-1 gap-4">
                              {fb.corrections.map((item: any, i: number) => (
                                <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-grow space-y-3">
                                      <div className="flex items-start gap-4">
                                        <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-xl text-xs font-black shadow-sm">!</div>
                                        <p className="text-red-500/80 line-through text-sm font-semibold italic pt-1">{item.original}</p>
                                      </div>
                                      <div className="flex items-start gap-4">
                                        <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100">OK</div>
                                        <p className="text-slate-800 text-base font-bold pt-1">{item.corrected}</p>
                                      </div>
                                    </div>
                                    <div className="md:w-1/3 md:border-l border-slate-100 md:pl-6">
                                      <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                        <span className="text-slate-400 mr-1 opacity-50 font-black tracking-widest uppercase text-[9px]">Giải thích:</span>
                                        {item.reason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths & Weaknesses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-emerald-50/40 border border-emerald-100 p-10 rounded-[3rem]">
                            <h4 className="font-outfit font-black text-emerald-800 mb-6 text-sm flex items-center gap-3 uppercase tracking-[0.2em]">
                              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              Điểm mạnh
                            </h4>
                            <ul className="space-y-4 font-semibold italic text-slate-600 text-base leading-relaxed">
                              {fb.strengths?.map((item: string, i: number) => (
                                <li key={i} className="flex gap-4">
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2.5"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-orange-50/40 border border-orange-100 p-10 rounded-[3rem]">
                            <h4 className="font-outfit font-black text-orange-800 mb-6 text-sm flex items-center gap-3 uppercase tracking-[0.2em]">
                              <svg className="w-6 h-6 shrink-0 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              Cần cải thiện
                            </h4>
                            <ul className="space-y-4 font-semibold italic text-slate-600 text-base leading-relaxed">
                              {fb.improvements?.map((item: string, i: number) => (
                                <li key={i} className="flex gap-4">
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-orange-400 mt-2.5"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Standard Version */}
                        {fb.betterVersion && (
                          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-20 -top-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                              <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
                            </div>
                            <h4 className="font-outfit font-black text-2xl mb-8 tracking-tight">Bài trả lời mẫu lý tưởng (Band 9.0)</h4>
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10">
                              <p className="text-orange-50/95 text-2xl leading-[1.8] italic font-medium">
                                "{fb.betterVersion}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) { return null; }
                })()}
              </div>
            </div>

            {/* Persistence Bar */}
            <div className="bg-slate-50/80 p-12 border-t border-slate-100 flex flex-col md:flex-row justify-center gap-8">
              <Button
                variant="outline"
                size="xl"
                className="rounded-full px-16 h-20 font-outfit font-black border-2 border-slate-200 hover:bg-white hover:shadow-xl transition-all active:scale-95 text-lg"
                onClick={() => navigate('/speaking/list')}
              >
                Về danh sách bài học
              </Button>
              <Button
                size="xl"
                className="bg-slate-900 hover:bg-black text-white rounded-full px-20 h-20 font-outfit font-black shadow-2xl transition-all active:scale-95 text-lg"
                onClick={() => window.location.reload()}
              >
                Làm lại bài khác ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default SpeakingPracticePage;
