import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Clock, Timer, Settings2 } from 'lucide-react';

type WatchMode = 'TIME' | 'STOPWATCH' | 'ALARM';

const SevenSegment = ({ value, size = 'default', color = 'rgba(0, 0, 0, 0.85)' }: { value: string | number; size?: 'default' | 'small' | 'large'; color?: string }) => {
  const segments: Record<string, boolean[]> = {
    '0': [true, true, true, false, true, true, true],
    '1': [false, false, true, false, false, true, false],
    '2': [true, false, true, true, true, false, true],
    '3': [true, false, true, true, false, true, true],
    '4': [false, true, true, true, false, true, false],
    '5': [true, true, false, true, false, true, true],
    '6': [true, true, false, true, true, true, true],
    '7': [true, false, true, false, false, true, false],
    '8': [true, true, true, true, true, true, true],
    '9': [true, true, true, true, false, true, true],
    ':': [false, false, false, false, false, false, false], // Handle dots separately
    ' ': [false, false, false, false, false, false, false],
  };

  const activeSegments = segments[value.toString()] || segments[' '];

  const sizes = {
    small: { w: 16, h: 28, thickness: 3 },
    default: { w: 42, h: 72, thickness: 6 },
    large: { w: 64, h: 110, thickness: 9 },
  };

  const { w, h, thickness: t } = sizes[size];

  return (
    <div 
      className="relative" 
      style={{ 
        width: `${w}px`, 
        height: `${h}px`,
        transform: 'skewX(-2deg)' // Subtle italic tilt
      }}
    >
      {/* Background (Ghost segments) */}
      <div className="absolute inset-0 opacity-5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
           <Segment key={i} index={i} active={true} w={w} h={h} t={t} color={color} />
        ))}
      </div>
      {/* Foreground (Active segments) */}
      <div className="absolute inset-0">
        {activeSegments.map((active, i) => (
          <Segment key={i} index={i} active={active} w={w} h={h} t={t} color={color} />
        ))}
      </div>
    </div>
  );
};

const Segment = ({ index, active, w, h, t, color = 'black' }: { index: number; active: boolean; w: number; h: number; t: number; color?: string; key?: React.Key }) => {
  if (!active) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: color,
    borderRadius: t / 2,
  };

  switch (index) {
    case 0: // Top
      return <div style={{ ...style, top: 0, left: t, right: t, height: t }} />;
    case 1: // Top Left
      return <div style={{ ...style, top: t, left: 0, bottom: h / 2 + t / 2, width: t }} />;
    case 2: // Top Right
      return <div style={{ ...style, top: t, right: 0, bottom: h / 2 + t / 2, width: t }} />;
    case 3: // Middle
      return <div style={{ ...style, top: h / 2 - t / 2, left: t, right: t, height: t }} />;
    case 4: // Bottom Left
      return <div style={{ ...style, top: h / 2 + t / 2, left: 0, bottom: t, width: t }} />;
    case 5: // Bottom Right
      return <div style={{ ...style, top: h / 2 + t / 2, right: 0, bottom: t, width: t }} />;
    case 6: // Bottom
      return <div style={{ ...style, bottom: 0, left: t, right: t, height: t }} />;
    default:
      return null;
  }
};

export default function CasioWatch() {
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState<WatchMode>('TIME');
  const [isLightOn, setIsLightOn] = useState(false);
  const [is24h, setIs24h] = useState(true);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      if (isStopwatchRunning) {
        setStopwatchTime(prev => prev + 100);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [isStopwatchRunning]);

  const toggleMode = () => {
    const modes: WatchMode[] = ['TIME', 'ALARM', 'STOPWATCH'];
    const currentIndex = modes.indexOf(mode);
    setMode(modes[(currentIndex + 1) % modes.length]);
  };

  const toggleLight = () => {
    setIsLightOn(true);
    setTimeout(() => setIsLightOn(false), 2000);
  };

  const handleBottomRight = () => {
    if (mode === 'TIME') {
      setIs24h(!is24h);
    } else if (mode === 'STOPWATCH') {
      setIsStopwatchRunning(!isStopwatchRunning);
    }
  };

  const resetStopwatch = () => {
    if (mode === 'STOPWATCH' && !isStopwatchRunning) {
      setStopwatchTime(0);
    }
  };

  const formatStopwatch = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return {
      min: min.toString().padStart(2, '0'),
      sec: sec.toString().padStart(2, '0'),
      centi: centi.toString().padStart(2, '0'),
    };
  };

  const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][time.getDay()];
  const dayOfMonth = time.getDate().toString().padStart(2, '0');
  
  let hours = time.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (!is24h) {
    hours = hours % 12 || 12;
  }
  const hoursStr = hours.toString().padStart(2, ' ');
  const minsStr = time.getMinutes().toString().padStart(2, '0');
  const secsStr = time.getSeconds().toString().padStart(2, '0');

  const sw = formatStopwatch(stopwatchTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0c0d] font-sans p-4 select-none">
      {/* Watch Strap Top */}
      <div className="w-60 h-24 bg-gradient-to-r from-bezel via-case to-bezel rounded-t-lg z-0 mb-[-20px] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-4 mt-6 items-center">
            {[1, 2].map(i => (
                <div key={i} className="w-32 h-1.5 bg-black/40 rounded-full"></div>
            ))}
        </div>
      </div>

      {/* Main Watch Body */}
      <div className="relative z-10">
        {/* Physical Buttons */}
        <button 
          onClick={toggleLight}
          className="absolute -left-3 top-[100px] w-[15px] h-10 bg-gradient-to-b from-[#555] to-[#222] rounded-l shadow-lg active:translate-x-1 transition-transform z-5"
          title="Light"
        />
        <button 
          onClick={toggleMode}
          className="absolute -left-3 bottom-[100px] w-[15px] h-10 bg-gradient-to-b from-[#555] to-[#222] rounded-l shadow-lg active:translate-x-1 transition-transform z-5"
          title="Mode"
        />
        <button 
          onClick={handleBottomRight}
          onDoubleClick={resetStopwatch}
          className="absolute -right-3 bottom-[100px] w-[15px] h-10 bg-gradient-to-b from-[#555] to-[#222] rounded-r shadow-lg active:-translate-x-1 transition-transform z-5"
          title="Adjust/Start"
        />

        {/* Watch Case */}
        <div className="w-[480px] h-[420px] bg-case rounded-[60px] p-5 shadow-[inset_0_4px_10px_rgba(255,255,255,0.1),0_30px_60px_rgba(0,0,0,0.8)] border-2 border-black flex items-center justify-center">
          <div className="w-full h-full bg-bezel rounded-[40px] border-4 border-black px-18 py-8 flex flex-col relative overflow-hidden">
            
            {/* Button Help Labels */}
            <div className="absolute left-6 top-[112px] text-[10px] font-extrabold uppercase text-stone-500">Light</div>
            <div className="absolute left-6 bottom-[112px] text-[10px] font-extrabold uppercase text-stone-500">Mode</div>
            <div className="absolute right-6 bottom-[112px] text-[10px] font-extrabold uppercase text-stone-500 text-right">Start·Stop</div>

            {/* Bezel Labels Top */}
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="text-2xl text-white font-extrabold tracking-[2px] leading-none">CASIO</div>
              <div className="text-sm text-accent-gold font-bold tracking-wider leading-none uppercase">f-91w</div>
            </div>

            {/* Screen Frame (Blue border / Black inner) */}
            <div className="flex-1 border-[3px] border-accent-blue rounded-xl p-1 bg-black overflow-hidden flex">
              {/* LCD Display Container */}
              <div className="flex-1 bg-lcd-bg rounded-md p-2 flex flex-col justify-between relative shadow-[inset_0_5px_15px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-0 transition-colors duration-500" 
                     style={{ backgroundColor: isLightOn ? '#bbf7d0' : 'transparent' }}>
                </div>
                
                {/* LCD Components */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between text-lcd-ink">
                  
                  {/* Top Row: Day/Date or Mode Icon */}
                  <div className="flex justify-between items-center font-bold text-xl px-2">
                    <div className="flex items-center gap-2">
                      {mode === 'TIME' && <span>{dayOfWeek}</span>}
                      {mode === 'STOPWATCH' && <Timer size={18} strokeWidth={3} />}
                      {mode === 'ALARM' && <Clock size={18} strokeWidth={3} />}
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === 'TIME' && <span>{dayOfMonth}</span>}
                      {mode === 'STOPWATCH' && <span>ST.W</span>}
                      {mode === 'ALARM' && <span>AL</span>}
                    </div>
                  </div>

                  {/* Main Time Display */}
                  <div className="flex items-end justify-center gap-2 my-1">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={mode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-end gap-1.5"
                      >
                        {mode === 'TIME' && (
                          <>
                            {!is24h && (
                              <div className="flex flex-col text-[12px] font-black mb-2 mr-1">
                                  <span>{ampm}</span>
                              </div>
                            )}
                            <SevenSegment value={hoursStr[0]} color="var(--color-lcd-ink)" />
                            <SevenSegment value={hoursStr[1]} color="var(--color-lcd-ink)" />
                            
                            {/* Separator */}
                            <div className="flex flex-col justify-center items-center gap-5 h-full px-1">
                              <div className={`w-2.5 h-2.5 bg-lcd-ink rounded-full transition-opacity duration-300 ${time.getSeconds() % 2 === 0 ? 'opacity-100' : 'opacity-20'}`}></div>
                              <div className={`w-2.5 h-2.5 bg-lcd-ink rounded-full transition-opacity duration-300 ${time.getSeconds() % 2 === 0 ? 'opacity-100' : 'opacity-20'}`}></div>
                            </div>

                            <SevenSegment value={minsStr[0]} color="var(--color-lcd-ink)" />
                            <SevenSegment value={minsStr[1]} color="var(--color-lcd-ink)" />
                            
                            <div className="ml-3 mb-0">
                              <SevenSegment value={secsStr[0]} size="small" color="var(--color-lcd-ink)" />
                            </div>
                            <div className="mb-0">
                              <SevenSegment value={secsStr[1]} size="small" color="var(--color-lcd-ink)" />
                            </div>
                          </>
                        )}

                        {mode === 'STOPWATCH' && (
                          <>
                            <SevenSegment value={sw.min[0]} size="small" color="var(--color-lcd-ink)" />
                            <SevenSegment value={sw.min[1]} size="small" color="var(--color-lcd-ink)" />
                            <div className="px-1 text-5xl font-black mb-2">.</div>
                            <SevenSegment value={sw.sec[0]} color="var(--color-lcd-ink)" />
                            <SevenSegment value={sw.sec[1]} color="var(--color-lcd-ink)" />
                            <div className="px-1 text-5xl font-black mb-2">.</div>
                            <SevenSegment value={sw.centi[0]} size="small" color="var(--color-lcd-ink)" />
                            <SevenSegment value={sw.centi[1]} size="small" color="var(--color-lcd-ink)" />
                          </>
                        )}

                        {mode === 'ALARM' && (
                          <>
                            <SevenSegment value="0" color="var(--color-lcd-ink)" />
                            <SevenSegment value="7" color="var(--color-lcd-ink)" />
                            <div className="flex flex-col justify-center items-center gap-6 h-full px-1">
                              <div className="w-3 h-3 bg-lcd-ink rounded-full"></div>
                              <div className="w-3 h-3 bg-lcd-ink rounded-full"></div>
                            </div>
                            <SevenSegment value="0" color="var(--color-lcd-ink)" />
                            <SevenSegment value="0" color="var(--color-lcd-ink)" />
                            <div className="ml-3 mb-2 text-lg font-black uppercase">OFF</div>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* LCD Indicators Bottom */}
                  <div className="flex gap-6 font-black text-base uppercase opacity-90 px-2">
                      <span>PM</span>
                      <span>ALARM</span>
                      <span>SIG</span>
                  </div>
                </div>

                {/* LCD Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(0,0,0,0.1),rgba(0,0,0,0.05),rgba(0,0,0,0.1))] bg-[length:100%_3px,4px_100%]"></div>
              </div>
            </div>

            {/* Bezel Labels Bottom */}
            <div className="mt-4 flex justify-between items-center px-2">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">Water Resist</div>
              <div className="text-[11px] font-extrabold text-accent-red uppercase tracking-[0.05em]">Alarm Chronograph</div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">Lithium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Watch Strap Bottom */}
      <div className="w-60 h-64 bg-gradient-to-r from-bezel via-case to-bezel rounded-b-lg mt-[-20px] shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="flex flex-col gap-8 mt-16 items-center">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-6 h-6 bg-black/40 rounded-full shadow-inner border border-white/5"></div>
            ))}
        </div>
      </div>

      {/* Interaction Hints */}
      <div className="mt-12 text-stone-600 text-xs flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <kbd className="px-3 py-1.5 bg-bezel border border-stone-800 rounded shadow-md text-stone-300 font-bold">LIGHT</kbd>
          <span className="opacity-50">Top Left</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <kbd className="px-3 py-1.5 bg-bezel border border-stone-800 rounded shadow-md text-stone-300 font-bold">MODE</kbd>
          <span className="opacity-50">Bottom Left</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <kbd className="px-3 py-1.5 bg-bezel border border-stone-800 rounded shadow-md text-stone-300 font-bold">START</kbd>
          <span className="opacity-50">Bottom Right</span>
        </div>
      </div>

      <div className="mt-8 text-accent-gold/40 text-[10px] uppercase tracking-[0.5em] font-black italic">
        Electro Luminescence
      </div>
    </div>
  );
}
