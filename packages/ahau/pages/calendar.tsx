import React, { useState, useEffect } from 'react';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardNav from '../components/DashboardNav';
import { apiGet, apiPost } from '../lib/api-fetch';
import { useNotifications } from '../context/NotificationsContext';

interface CalendarSlot {
  id: string;
  dateISO: string;
  time: string;
  ownerProfileId: string;
  draftId: string;
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  status: string;
  ownerProfileId?: string;
}

interface Profile {
  id: string;
  displayName: string;
  role: string;
}

export default function CalendarPage() {
  const { session } = useAuthCtx();
  const { addNotification } = useNotifications();
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedDraft, setDraggedDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (session?.tenantId) {
      loadCalendarData();
    }
  }, [session?.tenantId]);

  const loadCalendarData = async () => {
    try {
      setIsLoading(true);
      
      // Load approved drafts
      const draftsResponse = await apiGet(`/drafts.list?tenantId=${session!.tenantId}&status=approved`);
      if (draftsResponse.success) {
        setDrafts(draftsResponse.data);
      }

      // Load profiles
      const profilesResponse = await apiGet(`/tenants/${session!.tenantId}/profiles`);
      if (profilesResponse.success) {
        setProfiles(profilesResponse.data);
      }

      // Load calendar slots for current month
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const slotsResponse = await apiGet(`/tenants/${session!.tenantId}/calendar/${year}-${month}`);
      if (slotsResponse.success) {
        setSlots(slotsResponse.data);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos del calendario'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, draft: Draft) => {
    setDraggedDraft(draft);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!draggedDraft) return;

    try {
      const dateISO = date.toISOString().split('T')[0];
      
      const response = await apiPost(`/tenants/${session!.tenantId}/calendar/schedule`, {
        dateISO,
        time: timeSlot,
        ownerProfileId: draggedDraft.ownerProfileId || profiles[0]?.id,
        draftId: draggedDraft.id
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Programado',
          message: `"${draggedDraft.title}" programado para ${dateISO} a las ${timeSlot}`
        });
        
        // Reload calendar data
        await loadCalendarData();
      }
    } catch (error) {
      console.error('Error scheduling draft:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo programar el draft'
      });
    }

    setDraggedDraft(null);
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getTimeSlots = () => {
    return [
      '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
  };

  const getSlotForDateAndTime = (date: Date, time: string) => {
    const dateISO = date.toISOString().split('T')[0];
    return slots.find(slot => slot.dateISO === dateISO && slot.time === time);
  };

  const getProfileName = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.displayName || 'Sin perfil';
  };

  const getDraftTitle = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    return draft?.title || 'Draft no encontrado';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (!session) {
    return (
      <ProtectedRoute>
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Calendario Editorial</h1>
          <p className="text-gray-300">
            Programa y gestiona las publicaciones de tu contenido
          </p>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 bg-ahau-gold text-ahau-dark font-medium rounded-lg hover:bg-ahau-gold/90 transition-colors"
          >
            Hoy
          </button>
        </div>

        {/* Drafts Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Drafts Aprobados</h3>
              
              {drafts.length === 0 ? (
                <p className="text-gray-300 text-sm">No hay drafts aprobados</p>
              ) : (
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, draft)}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-move hover:bg-white/10 transition-colors"
                    >
                      <h4 className="text-sm font-medium text-white truncate">
                        {draft.title}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1">
                        {getProfileName(draft.ownerProfileId || '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-8 border-b border-white/10">
                <div className="p-3"></div> {/* Empty corner */}
                {getWeekDays().map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-3 text-center border-l border-white/10 ${
                      isToday(day) ? 'bg-ahau-gold/20' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-white">
                      {formatDate(day)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div className="max-h-96 overflow-y-auto">
                {getTimeSlots().map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-white/10 last:border-b-0">
                    <div className="p-3 text-sm text-gray-300 border-r border-white/10 flex items-center justify-center">
                      {time}
                    </div>
                    
                    {getWeekDays().map((day) => {
                      const slot = getSlotForDateAndTime(day, time);
                      const isPast = new Date(day.toISOString() + 'T' + time) < new Date();
                      
                      return (
                        <div
                          key={`${day.toISOString()}-${time}`}
                          className={`p-2 border-l border-white/10 min-h-[60px] ${
                            isDragOver ? 'bg-ahau-gold/20' : ''
                          } ${isPast ? 'opacity-50' : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day, time)}
                        >
                          {slot ? (
                            <div className={`p-2 rounded-lg text-xs ${
                              slot.status === 'published' 
                                ? 'bg-green-500/20 border border-green-500/30' 
                                : slot.status === 'cancelled'
                                ? 'bg-red-500/20 border border-red-500/30'
                                : 'bg-blue-500/20 border border-blue-500/30'
                            }`}>
                              <div className="font-medium text-white truncate">
                                {getDraftTitle(slot.draftId)}
                              </div>
                              <div className="text-gray-300 truncate">
                                {getProfileName(slot.ownerProfileId)}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {slot.status === 'published' ? 'Publicado' : 
                                 slot.status === 'cancelled' ? 'Cancelado' : 'Programado'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                              {isPast ? 'Pasado' : 'Libre'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Cómo usar el calendario</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Arrastra los drafts aprobados desde el panel izquierdo a cualquier slot de tiempo</li>
            <li>• Los slots verdes indican publicaciones ya realizadas</li>
            <li>• Los slots azules indican publicaciones programadas</li>
            <li>• Los slots rojos indican publicaciones canceladas</li>
            <li>• Usa los controles de navegación para cambiar de semana</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
