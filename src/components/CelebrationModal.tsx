import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Calendar, Clock, MapPin, Edit3, Check, Download, ArrowRight, X } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface CelebrationModalProps {
  onBackToRoom: () => void;
}

interface DateDetails {
  partnerName: string;
  senderName: string;
  anniversaryDate: string;
  dateTime: string;
  location: string;
  dressCode: string;
  personalMessage: string;
}

const DEFAULT_DETAILS: DateDetails = {
  partnerName: 'My Favorite Person',
  senderName: 'Your Love',
  anniversaryDate: 'October 18, 2026',
  dateTime: '11:00 PM',
  location: '365º Napoli Pizza',
  dressCode: 'Naked',
  personalMessage: 'Je\'taime.',
};

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ onBackToRoom }) => {
  const [showSurprise, setShowSurprise] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load custom date details from localStorage or default
  const [details, setDetails] = useState<DateDetails>(() => {
    try {
      const saved = localStorage.getItem('anniversary_date_details');
      return saved ? JSON.parse(saved) : DEFAULT_DETAILS;
    } catch {
      return DEFAULT_DETAILS;
    }
  });

  const [editForm, setEditForm] = useState<DateDetails>(details);

  // Trigger gentle floral confetti on reveal
  useEffect(() => {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#A8C68A', '#F5D98C', '#F5F0E5', '#49B8D8', '#D4A373'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        ticks: 300,
        shapes: ['circle'],
        scalar: 0.9,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        ticks: 300,
        shapes: ['circle'],
        scalar: 0.9,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleRevealSurprise = () => {
    romanticAudio.playSparkle();
    setShowSurprise(true);
  };

  const handleSaveEdit = () => {
    setDetails(editForm);
    localStorage.setItem('anniversary_date_details', JSON.stringify(editForm));
    setIsEditing(false);
  };

  // Download .ics Calendar Invite
  const handleDownloadCalendar = () => {
    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//A Little Date for Us//Anniversary Invitation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Anniversary Date with ${details.senderName} ♡
DESCRIPTION:${details.personalMessage}\\nLocation: ${details.location}
LOCATION:${details.location}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'anniversary-date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/25">
      {/* Background golden sunlight flare overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(245, 217, 140, 0.45) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {!showSurprise ? (
        /* STEP 1: Celebration Screen */
        <div className="glass-panel-warm rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center relative z-10 transition-all duration-700 animate-float shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#A8C68A]/30 border border-[#A8C68A]/60 flex items-center justify-center text-[#174A2D] shadow-lg">
              <Heart className="w-8 h-8 fill-[#174A2D] animate-pulse" />
            </div>
          </div>

          <h2 className="font-romantic text-3xl sm:text-4xl text-[#174A2D] font-medium leading-tight mb-3">
            “Gau gau,congratsulation”
          </h2>

          <p className="font-romantic text-2xl sm:text-3xl text-[#718B91] italic mb-6">
            “You received a date with the prettiest person in the world”
          </p>

          <p className="text-base sm:text-lg text-[#174A2D]/85 font-normal leading-relaxed mb-8">
            Ba oui 
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRevealSurprise}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#174A2D] hover:bg-[#1f5f3a] text-[#F5F0E5] font-medium text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>One little surprise</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBackToRoom}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blaFck/5 hover:bg-black/10 text-[#174A2D] font-medium text-sm transition-all duration-200 cursor-pointer"
            >
              Back to our room
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: Surprise Love Letter & Itinerary Card */
        <div className="glass-panel-warm rounded-3xl p-6 sm:p-10 max-w-xl w-full text-left relative z-10 my-8 shadow-2xl animate-float">
          {/* Top Bar with Edit Toggle */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#174A2D]/15">
            <div className="flex items-center gap-2 text-[#174A2D]">
              <Sparkles className="w-5 h-5 text-[#F5D98C] fill-[#F5D98C]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#174A2D]/70">
                A Keepsake For You
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-[#174A2D] bg-[#A8C68A]/30 hover:bg-[#A8C68A]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={isEditing ? 'Cancel editing' : 'Customize date & names'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Personalize Note'}</span>
              </button>
            </div>
          </div>

          {/* Romantic Quote */}
          <blockquote className="font-romantic text-2xl sm:text-3xl text-[#174A2D] italic leading-snug mb-6 text-center">
            “Out of all the places in the world, I'd still choose to spend my time with you.”
          </blockquote>

          {isEditing ? (
            /* Inline Edit Form */
            <div className="space-y-4 mb-6 bg-white/60 p-5 rounded-2xl border border-[#174A2D]/10">
              <h3 className="text-sm font-semibold text-[#174A2D]">Customize Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">To (Boyfriend's Name)</label>
                  <input
                    type="text"
                    value={editForm.partnerName}
                    onChange={(e) => setEditForm({ ...editForm, partnerName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">From (Your Name)</label>
                  <input
                    type="text"
                    value={editForm.senderName}
                    onChange={(e) => setEditForm({ ...editForm, senderName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">Date</label>
                  <input
                    type="text"
                    value={editForm.anniversaryDate}
                    onChange={(e) => setEditForm({ ...editForm, anniversaryDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">Time</label>
                  <input
                    type="text"
                    value={editForm.dateTime}
                    onChange={(e) => setEditForm({ ...editForm, dateTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                />
              </div>

              <div>
                <label className="text-xs text-[#174A2D]/70 font-medium block mb-1">Personal Love Message</label>
                <textarea
                  rows={3}
                  value={editForm.personalMessage}
                  onChange={(e) => setEditForm({ ...editForm, personalMessage: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#718B91]/30 bg-white text-[#174A2D] focus:outline-none focus:ring-2 focus:ring-[#A8C68A]"
                />
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full py-2.5 rounded-xl bg-[#174A2D] text-[#F5F0E5] font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#1f5f3a] transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            /* Beautiful Presented Card */
            <div className="space-y-5 mb-8">
              {/* Salutation */}
              <div className="text-sm font-medium text-[#174A2D]/80">
                To: <span className="font-semibold text-[#174A2D] text-base">{details.partnerName} ♡</span>
              </div>

              {/* Heartfelt Note */}
              <p className="text-sm sm:text-base text-[#174A2D]/90 leading-relaxed font-light bg-white/40 p-4 rounded-2xl border border-[#174A2D]/10 italic">
                “{details.personalMessage}”
              </p>

              {/* Date Itinerary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#A8C68A]/20 border border-[#A8C68A]/30">
                  <Calendar className="w-4 h-4 text-[#174A2D]" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#174A2D]/60 block font-semibold">Anniversary Date</span>
                    <span className="text-xs sm:text-sm font-medium text-[#174A2D]">{details.anniversaryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5D98C]/25 border border-[#F5D98C]/40">
                  <Clock className="w-4 h-4 text-[#174A2D]" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#174A2D]/60 block font-semibold">Time</span>
                    <span className="text-xs sm:text-sm font-medium text-[#174A2D]">{details.dateTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-[#174A2D]/10 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#174A2D]" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#174A2D]/60 block font-semibold">Meeting Place</span>
                    <span className="text-xs sm:text-sm font-medium text-[#174A2D]">{details.location}</span>
                  </div>
                </div>
              </div>

              {/* Signoff */}
              <div className="text-right pt-2 text-sm font-romantic text-lg text-[#174A2D]">
                With all my love, <br />
                <span className="font-semibold">{details.senderName} ♡</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#174A2D]/15">
            <button
              onClick={handleDownloadCalendar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A8C68A] hover:bg-[#b8d49b] text-[#174A2D] font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Add this anniversary date to Apple Calendar or Google Calendar"
            >
              <Download className="w-4 h-4" />
              <span>Add to Calendar (.ics)</span>
            </button>

            <button
              onClick={onBackToRoom}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#174A2D] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Return to Room</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
