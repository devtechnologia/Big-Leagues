import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Phone, MessageSquare, Clock, Battery, Wifi, User, Mic, Video, Volume2, Grid, PhoneOff, Signal, Copy, Check, Pill, Bird, Globe, Music, Mail, Compass } from 'lucide-react';

// --- Global Audio Instances ---
// Using silent fallback or just handling errors if files are missing
const callAudio = new Audio('/call.mp3');
const homeAudio = new Audio('/home.mp3');

callAudio.preload = 'auto';
homeAudio.preload = 'auto';

// --- Styles ---
const styles = `
  :root {
    --phone-width: 400px;
    --phone-height: 850px;
    --chassis-color: #2c2c2e; /* Dark Graphite/Titanium */
    --chassis-shine: #505055;
    --bezel-width: 12px;
    --frame-thickness: 4px;
    --corner-radius: 60px;
    --screen-radius: 50px;
  }

  body {
    background-color: #111;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 40px 20px;
    box-sizing: border-box;
    gap: 40px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  /* --- The Physical Device --- */
  .phone-chassis {
    position: relative;
    width: var(--phone-width);
    height: var(--phone-height);
    background: var(--chassis-color);
    border-radius: var(--corner-radius);
    padding: var(--frame-thickness);
    box-shadow: 
      0 0 0 1px #000, /* Ultra thin black edge */
      0 0 0 2px #333, /* Outer rim highlight */
      0 30px 60px -10px rgba(0,0,0,0.6), /* Drop shadow */
      inset 0 0 0 2px rgba(255,255,255,0.1), /* Inner metallic chamfer */
      inset 0 0 10px rgba(0,0,0,0.5); /* Inner depth */
    display: flex;
    flex-direction: column;
    z-index: 10;
    flex-shrink: 0; /* Prevent phone from shrinking */
  }

  /* Side Buttons */
  .hw-btn {
    position: absolute;
    background: var(--chassis-color);
    border-radius: 4px 0 0 4px;
    box-shadow: inset -1px 0 2px rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.3);
    z-index: 5;
  }
  
  .hw-btn.right {
    right: -3px;
    left: auto;
    border-radius: 0 4px 4px 0;
    box-shadow: inset 1px 0 2px rgba(0,0,0,0.5), 1px 0 2px rgba(0,0,0,0.3);
  }

  .btn-silent { top: 100px; left: -3px; width: 3px; height: 30px; }
  .btn-vol-up { top: 160px; left: -3px; width: 3px; height: 60px; }
  .btn-vol-down { top: 240px; left: -3px; width: 3px; height: 60px; }
  .btn-power { top: 180px; width: 3px; height: 90px; }

  /* Antenna Bands */
  .antenna {
    position: absolute;
    background: #555;
    width: 3px; /* Thickness of the frame */
    height: 12px; /* Visual gap */
    opacity: 0.6;
    z-index: 11;
    pointer-events: none;
  }
  .ant-top-l { top: 70px; left: 0; height: 2px; width: 6px; }
  .ant-top-r { top: 70px; right: 0; height: 2px; width: 6px; }
  .ant-bot-l { bottom: 70px; left: 0; height: 2px; width: 6px; }
  .ant-bot-r { bottom: 70px; right: 0; height: 2px; width: 6px; }

  /* The Black Bezel */
  .phone-bezel {
    flex: 1;
    background: #000;
    border-radius: 56px; /* Slightly less than chassis */
    padding: var(--bezel-width);
    position: relative;
    display: flex;
    overflow: hidden;
    box-shadow: inset 0 0 20px rgba(255,255,255,0.05); /* Slight reflection on the glass edge */
  }

  /* The Screen Display */
  .screen {
    flex: 1;
    background: linear-gradient(135deg, #2a0845 0%, #6441A5 50%, #2a0845 100%);
    border-radius: var(--screen-radius);
    position: relative;
    overflow: hidden;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    mask-image: radial-gradient(white, black); /* Fixes some border-radius anti-aliasing issues in Webkit */
    -webkit-mask-image: -webkit-radial-gradient(white, black); 
  }

  /* Screen Content Styling */
  .screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Dynamic Island */
  .dynamic-island {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 35px;
    background: #000;
    border-radius: 20px;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
  }
  
  /* Camera lens reflection simulation */
  .dynamic-island::after {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #1a1a1a;
    border-radius: 50%;
    box-shadow: inset 0 0 2px rgba(255,255,255,0.2);
  }

  .status-bar {
    margin-top: 14px;
    padding: 0 28px; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    z-index: 55;
    color: #fff;
  }

  .status-icons {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  /* Incoming Call Content */
  .call-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 80px; /* Adjusted spacing */
    z-index: 20;
  }

  .contact-avatar {
    width: 100px;
    height: 100px;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    font-size: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .caller-label {
    font-size: 16px;
    opacity: 0.7;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .caller-name {
    font-size: 34px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 50px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 0 20px;
    line-height: 1.2;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 45px;
    margin-bottom: 50px;
    z-index: 30;
  }

  .icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
  }

  .icon-btn-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .icon-btn-circle:active {
    background: rgba(255,255,255,0.25);
  }

  .icon-label {
    font-size: 13px;
    font-weight: 500;
  }

  /* Slider */
  .slider-container {
    margin: 0 25px 45px 25px;
    height: 80px;
    position: relative;
    z-index: 30;
  }

  .slider-track {
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-radius: 100px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .slider-text {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.5px;
    pointer-events: none;
    background: linear-gradient(to right, rgba(255,255,255,0.4) 0%, #fff 50%, rgba(255,255,255,0.4) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    to {
      background-position: 200% center;
    }
  }

  .slider-knob {
    width: 72px;
    height: 72px;
    background: white;
    border-radius: 50%;
    position: absolute;
    left: 4px;
    top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2E7D32; /* Slightly darker green */
    cursor: grab;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 40;
  }

  .slider-knob:active {
    cursor: grabbing;
    transform: scale(1.05);
  }

  /* Connected State */
  .connected-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
    z-index: 20;
    width: 100%;
  }
  
  .timer {
    font-size: 20px;
    font-weight: 300;
    margin-top: 12px;
    opacity: 0.8;
  }

  .visualizer-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin: 20px 0;
  }

  .vis-bar {
    width: 4px;
    background: white;
    border-radius: 2px;
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { height: 10%; opacity: 0.5; }
    50% { height: 100%; opacity: 1; }
  }

  .grid-controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    margin-top: auto;
    margin-bottom: 105px; /* Increased from 90px */
    padding: 0 40px;
    width: 100%;
  }

  .control-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .control-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: 0.2s;
  }

  .control-circle:active, .control-circle.active {
    background: white;
    color: #333;
  }

  .control-label {
    font-size: 13px;
    font-weight: 500;
  }

  .end-call-btn {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #ff3b30;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 15px rgba(255, 59, 48, 0.4);
  }

  .home-indicator {
    width: 130px; 
    height: 5px; 
    background: white; 
    border-radius: 100px; 
    position: absolute; 
    bottom: 8px; 
    left: 50%; 
    transform: translateX(-50%);
    opacity: 0.6;
    z-index: 60;
  }

  /* --- Home Screen --- */
  .home-screen {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 25px 30px 25px;
      box-sizing: border-box;
      z-index: 20;
  }

  .app-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px 15px; /* row gap, col gap */
      width: 100%;
  }

  .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.1s;
      position: relative;
  }

  .app-item:active {
      transform: scale(0.95);
      opacity: 0.7;
  }

  .app-icon {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      color: white;
      font-size: 24px;
  }

  .app-name {
      color: white;
      font-size: 11px;
      font-weight: 500;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
  }

  .dock {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-radius: 32px;
      padding: 18px 15px;
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-top: auto;
      margin-bottom: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  
  .dock .app-icon {
      width: 58px;
      height: 58px;
      border-radius: 14px;
      box-shadow: none;
  }
  .dock .app-item {
      gap: 0;
  }

  /* --- Contract Address Footer --- */
  .contract-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 5;
    width: 100%;
    max-width: 600px;
    margin-top: 80px; /* Added spacing */
  }

  .contract-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .contract-value-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .contract-value {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.08);
    padding: 14px 20px;
    padding-right: 40px; /* Space for icon */
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    text-align: center;
    word-break: break-all;
    user-select: text;
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .contract-value:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  
  .contract-value:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.2);
  }

  .copy-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .contract-value:hover .copy-icon {
    opacity: 1;
  }
`;

const SlideToAnswer = ({ onAnswer }: { onAnswer: () => void }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const maxDrag = React.useRef(0);

  useEffect(() => {
    if (trackRef.current && knobRef.current) {
      maxDrag.current = trackRef.current.offsetWidth - knobRef.current.offsetWidth - 8;
    }
  }, []);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left - 40; 
    
    const newPos = Math.max(0, Math.min(offsetX, maxDrag.current));
    setPosition(newPos);
    
    const percentage = newPos / maxDrag.current;
    if (trackRef.current) {
        const textElement = trackRef.current.querySelector('.slider-text') as HTMLElement;
        if(textElement) textElement.style.opacity = `${1 - percentage * 1.5}`;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (position > maxDrag.current * 0.85) {
      setPosition(maxDrag.current);
      setTimeout(onAnswer, 200);
    } else {
      setPosition(0);
      if (trackRef.current) {
        const textElement = trackRef.current.querySelector('.slider-text') as HTMLElement;
        if(textElement) textElement.style.opacity = '1';
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => isDragging && handleEnd();

  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  return (
    <div 
      className="slider-container"
      onMouseMove={isDragging ? onMouseMove : undefined}
      onMouseUp={isDragging ? onMouseUp : undefined}
      onMouseLeave={isDragging ? onMouseLeave : undefined}
      onTouchMove={isDragging ? onTouchMove : undefined}
      onTouchEnd={isDragging ? onTouchEnd : undefined}
    >
      <div className="slider-track" ref={trackRef}>
        <div className="slider-text">slide to answer</div>
        <div 
          className="slider-knob" 
          ref={knobRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{ 
            transform: `translateX(${position}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
          }}
        >
          <Phone size={36} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

const Visualizer = () => {
  return (
    <div className="visualizer-container">
      <div className="vis-bar" style={{ animationDelay: '0ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '200ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '400ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '100ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '300ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '500ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '200ms' }}></div>
      <div className="vis-bar" style={{ animationDelay: '0ms' }}></div>
    </div>
  );
}

const ConnectedScreen = ({ onHangup }: { onHangup: () => void }) => {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="connected-screen">
       <div className="contact-avatar">
          <User size={60} color="white" />
        </div>
      <div className="caller-name" style={{marginBottom: 5}}>The Big Leagues</div>
      <div className="timer">{formatTime(seconds)}</div>

      <Visualizer />
      
      {/* Spacer where subtitles used to be */}
      <div style={{ minHeight: '80px' }}></div>

      <div className="grid-controls">
        <div className="control-item" onClick={() => setMuted(!muted)}>
          <div className={`control-circle ${muted ? 'active' : ''}`}>
            <Mic size={32} />
          </div>
          <span className="control-label">mute</span>
        </div>
        <div className="control-item">
          <div className="control-circle">
            <Grid size={32} />
          </div>
          <span className="control-label">keypad</span>
        </div>
        <div className="control-item" onClick={() => setSpeaker(!speaker)}>
          <div className={`control-circle ${speaker ? 'active' : ''}`}>
            <Volume2 size={32} />
          </div>
          <span className="control-label">audio</span>
        </div>
        <div className="control-item">
          <div className="control-circle">
            <MessageSquare size={32} />
          </div>
          <span className="control-label">message</span>
        </div>
        <div className="control-item">
          <div className="control-circle">
            <Video size={32} />
          </div>
          <span className="control-label">FaceTime</span>
        </div>
        <div className="control-item">
           <div className="control-circle" style={{opacity: 0, pointerEvents: 'none'}}></div>
        </div>
         <div className="control-item">
           <div className="control-circle" style={{opacity: 0, pointerEvents: 'none'}}></div>
        </div>
        <div className="control-item" onClick={onHangup}>
          <div className="end-call-btn">
            <PhoneOff size={36} fill="currentColor" />
          </div>
          <span className="control-label">end</span>
        </div>
         <div className="control-item">
           <div className="control-circle" style={{opacity: 0, pointerEvents: 'none'}}></div>
        </div>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const apps = [
    {
      name: 'pump.fun',
      url: 'https://pump.fun/coin/7PVk3W4kXAWkSy15TTfbXdrFSg6FB3tPaUrYjeJdpump',
      icon: <Pill size={32} color="white" />,
      color: '#10B981', // Emerald green like the pill
    },
    {
      name: 'X',
      url: 'https://x.com/bigleaguesonsol',
      // Custom X logo SVG
      icon: <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
      color: '#000000',
    },
    {
      name: 'Dexscreener',
      url: 'https://dexscreener.com/solana/H7b6LA7Cgdaz6k946fbAz7BtfsbsbyHJir8TfVxPtg4a',
      icon: <Bird size={32} color="white" />, // Owl/Bird proxy
      color: '#2b2b2b',
    },
  ];

  return (
    <div className="home-screen">
        <div className="app-grid">
            {apps.map(app => (
                <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer" className="app-item">
                    <div className="app-icon" style={{ background: app.color }}>
                        {app.icon}
                    </div>
                    <span className="app-name">{app.name}</span>
                </a>
            ))}
        </div>
        
        {/* Dock */}
        <div className="dock">
             <div className="app-item">
                <div className="app-icon" style={{ background: '#34C759' }}>
                    <Phone size={28} color="white" fill="white" />
                </div>
             </div>
             <div className="app-item">
                <div className="app-icon" style={{ background: '#007AFF' }}>
                    <Compass size={28} color="white" />
                </div>
             </div>
             <div className="app-item">
                <div className="app-icon" style={{ background: '#5856D6' }}>
                    <MessageSquare size={28} color="white" fill="white" />
                </div>
             </div>
             <div className="app-item">
                <div className="app-icon" style={{ background: '#FA2D48' }}>
                     <Music size={28} color="white" />
                </div>
             </div>
        </div>
    </div>
  );
};

const App = () => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'home'>('incoming');
  const [currentTime, setCurrentTime] = useState('');
  const [copied, setCopied] = useState(false);
  
  const contractAddress = "7PVk3W4kXAWkSy15TTfbXdrFSg6FB3tPaUrYjeJdpump";
  
  useEffect(() => {
    // Attach listeners to global audio for time updates and ending
    const handleEnded = () => {
        setCallState('home');
    };

    callAudio.addEventListener('ended', handleEnded);

    return () => {
      callAudio.removeEventListener('ended', handleEnded);
      // Clean up on unmount
      callAudio.pause();
      homeAudio.pause();
    };
  }, []);

  // Handle Home Audio Playback based on state
  useEffect(() => {
    if (callState === 'home') {
        homeAudio.currentTime = 0;
        homeAudio.play().catch(e => {
            console.warn("Home audio failed (missing file?):", e);
        });
    } else {
        homeAudio.pause();
        homeAudio.currentTime = 0;
    }
  }, [callState]);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnswer = () => {
    callAudio.currentTime = 0;
    callAudio.play().catch(err => {
      console.warn('Call audio failed (missing file?):', err);
    });
    setCallState('connected');
  };

  const handleHangup = () => {
    callAudio.pause();
    callAudio.currentTime = 0;
    setCallState('home');
  };

  const renderContent = () => {
    switch (callState) {
      case 'incoming':
        return (
          <>
            <div className="call-info">
              <div className="contact-avatar">
                <span style={{ fontSize: '40px', fontWeight: 'bold' }}>BL</span>
              </div>
              <div className="caller-label">Mobile</div>
              <div className="caller-name">The Big Leagues</div>
            </div>

            <div className="incoming-controls">
              <div className="action-buttons">
                <button className="icon-btn">
                  <div className="icon-btn-circle">
                    <Clock size={28} />
                  </div>
                  <span className="icon-label">Remind Me</span>
                </button>
                <button className="icon-btn">
                  <div className="icon-btn-circle">
                    <MessageSquare size={28} />
                  </div>
                  <span className="icon-label">Message</span>
                </button>
              </div>
              <SlideToAnswer onAnswer={handleAnswer} />
            </div>
          </>
        );
      case 'connected':
        return <ConnectedScreen onHangup={handleHangup} />;
      case 'home':
        return <HomeScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="phone-chassis">
        {/* Hardware Buttons */}
        <div className="hw-btn btn-silent"></div>
        <div className="hw-btn btn-vol-up"></div>
        <div className="hw-btn btn-vol-down"></div>
        <div className="hw-btn right btn-power"></div>
        
        {/* Antenna Bands */}
        <div className="antenna ant-top-l"></div>
        <div className="antenna ant-top-r"></div>
        <div className="antenna ant-bot-l"></div>
        <div className="antenna ant-bot-r"></div>

        <div className="phone-bezel">
          <div className="screen">
            {/* Dynamic Island */}
            <div className="dynamic-island"></div>

            <div className="status-bar">
              <span>{currentTime}</span>
              <div className="status-icons">
                <Signal size={16} fill="currentColor" />
                <Wifi size={16} />
                <Battery size={20} />
              </div>
            </div>

            {renderContent()}
            
            <div className="home-indicator"></div>
          </div>
        </div>
      </div>

      {/* Contract Address Footer */}
      <div className="contract-container">
        <span className="contract-label">Contract Address</span>
        <div className="contract-value-wrapper" onClick={handleCopy}>
          <div className="contract-value">
            {contractAddress}
            <div className="copy-icon">
              {copied ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);