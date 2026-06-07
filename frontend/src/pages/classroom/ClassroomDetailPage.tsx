import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService, type Classroom, type ClassMessage } from '../../services/classroom.service';
import { PageLoader } from '../../components/common/PageLoader';
import { useAuthStore } from '../../store/auth.store';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Send, Hand, Monitor, X, Calendar, Clock, User as UserIcon, Maximize, Minimize, Volume2, VolumeX, Loader2, Users, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface Peer {
    stream?: MediaStream;
    user?: {
        id: number;
        name: string;
        photo?: string;
    };
    handRaised?: boolean;
}

const pulseOptions = [
    'I agree',
    'Correct',
    'Give example',
    'Repeat',
    'Too fast',
    'Confused',
];

export const ClassroomDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [joined, setJoined] = useState(false);

    // Chat
    const [messages, setMessages] = useState<ClassMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Media Controls
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false); // Global audio out mute
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [showChat, setShowChat] = useState(false); // Default hidden for full screen
    const [sendingMsg, setSendingMsg] = useState(false);
    const [actionLoading, setActionLoading] = useState(false); // For Start/Join/End
    const [chatWidth, setChatWidth] = useState(360);
    const [isResizingChat, setIsResizingChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [endingClass, setEndingClass] = useState(false);
    const [screenShareOwner, setScreenShareOwner] = useState<{ id: number; name: string } | null>(null);
    const [showPulseMenu, setShowPulseMenu] = useState(false);
    const [lastLearningPulse, setLastLearningPulse] = useState<{ userId: number; userName: string; pulse: string } | null>(null);
    const [selectedStageUserId, setSelectedStageUserId] = useState<string | null>(null);

    // WebRTC / WS Refs
    const wsRef = useRef<WebSocket | null>(null);
    const pcsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const candidateQueueRef = useRef<{ [key: string]: RTCIceCandidateInit[] }>({});

    // Media State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remotePeers, setRemotePeers] = useState<Map<string, Peer>>(new Map());

    // Main video ref
    const mainVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (id) {
            fetchClassroom(parseInt(id));
        }
        return () => {
            cleanupMedia();
        };
    }, [id]);

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // Chat Load
    useEffect(() => {
        if (joined && id) {
            loadMessages();
        }
    }, [joined, id]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // --- UI State ---
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Helper Functions ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change events (esc key, etc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (!isResizingChat) return;

        const handlePointerMove = (event: PointerEvent) => {
            const bounds = containerRef.current?.getBoundingClientRect();
            if (!bounds) return;

            const nextWidth = bounds.right - event.clientX - 16;
            const maxWidth = Math.min(620, bounds.width * 0.48);
            setChatWidth(Math.max(300, Math.min(maxWidth, nextWidth)));
        };

        const stopResizing = () => setIsResizingChat(false);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopResizing);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingChat]);

    // --- View Logic / Hooks must be before returns ---

    // View Logic - compute main stream
    const isInstructor = Number(user?.id) === Number(classroom?.instructor_id);
    const instructorId = String(classroom?.instructor_id || '');
    const selectedStagePeer = selectedStageUserId ? remotePeers.get(selectedStageUserId) : undefined;
    const selectedStageIsLocal = selectedStageUserId === String(user?.id);
    const defaultMainStream = isInstructor ? localStream : remotePeers.get(instructorId)?.stream;
    const mainStream = selectedStageIsLocal ? localStream : selectedStagePeer?.stream || defaultMainStream;
    const isMainLocal = selectedStageIsLocal || (!selectedStageUserId && isInstructor);

    // Attach Main Video
    useEffect(() => {
        if (mainVideoRef.current && mainStream && mainVideoRef.current.srcObject !== mainStream) {
            mainVideoRef.current.srcObject = mainStream;
        } else if (mainVideoRef.current && !mainStream) {
            mainVideoRef.current.srcObject = null;
        }
    }, [mainStream]);

    useEffect(() => {
        if (!selectedStageUserId || selectedStageIsLocal) return;
        if (!remotePeers.has(selectedStageUserId)) {
            setSelectedStageUserId(null);
        }
    }, [remotePeers, selectedStageIsLocal, selectedStageUserId]);


    const cleanupMedia = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        Object.values(pcsRef.current).forEach(pc => pc.close());
        pcsRef.current = {};
        if (wsRef.current) wsRef.current.close();
        setLocalStream(null);
        setRemotePeers(new Map());
    };

    const fetchClassroom = async (classroomId: number) => {
        try {
            const data = await classroomService.getClassroom(classroomId);
            setClassroom(data);
        } catch (error) {
            console.error('Failed to fetch classroom:', error);
            toast.error('Failed to load classroom');
            navigate('/classrooms');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!id) return;
        try {
            const data = await classroomService.getMessages(parseInt(id));
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !id) return;
        setSendingMsg(true);
        try {
            const savedMsg = await classroomService.sendMessage(parseInt(id), newMessage);
            setNewMessage('');
            setMessages(prev => [...prev, savedMsg]);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'chat',
                    payload: savedMsg
                }));
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSendingMsg(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            localStreamRef.current = stream; // Immediate update for race conditions
            setCameraOn(true);
            setMicOn(true);

            // Add to existing PCs
            Object.values(pcsRef.current).forEach(pc => {
                stream.getTracks().forEach(track => {
                    const senders = pc.getSenders();
                    const sender = senders.find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, stream);
                    }
                });
            });
            return stream;
        } catch (error) {
            console.error('Media Access Error:', error);
            toast.error('Could not access camera/mic');
            return null;
        }
    };

    const startScreenShare = async () => {
        if (screenShareOwner && Number(screenShareOwner.id) !== Number(user?.id)) {
            toast(`${screenShareOwner.name} is already sharing. Ask them to stop sharing before you start.`);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            stream.getVideoTracks()[0].onended = () => stopScreenShare();
            setLocalStream(stream);
            setIsScreenSharing(true);
            if (user?.id) {
                setScreenShareOwner({ id: user.id, name: user.full_name || 'You' });
                wsRef.current?.send(JSON.stringify({
                    type: 'screen_share_state',
                    user_id: user.id,
                    user_name: user.full_name || 'Participant',
                    active: true
                }));
            }

            // Replace Video Track
            const videoTrack = stream.getVideoTracks()[0];
            Object.values(pcsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });
        } catch (error) {
            toast('Screen share was not started. If someone else is presenting, wait until they stop sharing.');
        }
    };

    const stopScreenShare = async () => {
        setIsScreenSharing(false);
        if (user?.id) {
            setScreenShareOwner(null);
            wsRef.current?.send(JSON.stringify({
                type: 'screen_share_state',
                user_id: user.id,
                user_name: user.full_name || 'Participant',
                active: false
            }));
        }
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        await startCamera();
    };

    const toggleMic = () => {
        if (localStream) {
            const track = localStream.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setMicOn(track.enabled);
            }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const track = localStream.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setCameraOn(track.enabled);
            }
        } else {
            startCamera();
        }
    };

    const toggleHandRaise = () => {
        const newState = !handRaised;
        setHandRaised(newState);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'hand_raise',
                user_id: user?.id,
                user_name: user?.full_name,
                raised: newState
            }));
        }
        toast.success(newState ? 'Hand raised' : 'Hand lowered');
    };

    const sendLearningPulse = (pulse: string) => {
        if (!user?.id) return;

        const payload = {
            type: 'learning_pulse',
            user_id: user.id,
            user_name: user.full_name || 'Participant',
            pulse
        };

        setLastLearningPulse({ userId: user.id, userName: user.full_name || 'You', pulse });
        setShowPulseMenu(false);
        wsRef.current?.send(JSON.stringify({
            ...payload
        }));
        // toast.success(`Pulse sent: ${pulse}`);
    };

    const clearLearningPulse = () => {
        if (!user?.id) return;

        setLastLearningPulse(null);
        wsRef.current?.send(JSON.stringify({
            type: 'learning_pulse',
            user_id: user.id,
            user_name: user.full_name || 'Participant',
            pulse: null,
            cleared: true
        }));
    };

    // --- Signaling ---
    const handleJoinSession = async () => {
        if (!id || !user) return;
        setActionLoading(true);
        try {
            const response = await classroomService.joinClassroom(parseInt(id));

            // Set TURN
            let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
            if (response.turn_server) {
                const turnServers = response.turn_server.urls.map((url: string) => ({
                    urls: url,
                    username: response.turn_server.username,
                    credential: response.turn_server.credential
                }));
                iceServers = [...iceServers, ...turnServers];
            }

            // Connect WS
            const apiBase = import.meta.env.VITE_API_URL;
            const wsProto = apiBase.startsWith('https') ? 'wss' : 'ws';
            const hostUrl = apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');
            const wsUrl = `${wsProto}://${hostUrl}/${response.websocket_url}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = async () => {
                console.log('WS Connected');

                // Start Camera FIRST before verifying presence to avoid answering without tracks
                await startCamera();
                setJoined(true);

                wsRef.current?.send(JSON.stringify({
                    type: 'join',
                    user_id: user.id,
                    user_info: { id: user.id, name: user.full_name, photo: user.photo }
                }));

                toast.success('Joined session');
                classroomService.markAttendance(parseInt(id)).catch(err => console.error('Failed to mark attendance', err));
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleSignalingMessage(data, iceServers);
            };

        } catch (error) {
            console.error(error);
            toast.error('Failed to join');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = () => {
        cleanupMedia();
        setJoined(false);
        setHandRaised(false);
        setShowChat(false);
        setShowParticipants(false);
        setScreenShareOwner(null);
        setShowPulseMenu(false);
        setLastLearningPulse(null);
        setSelectedStageUserId(null);
        setEndingClass(false);
        toast('Left session');
    };

    const handleSignalingMessage = async (data: any, currentIceServers: RTCIceServer[]) => {
        switch (data.type) {
            case 'user_joined':
                toast.success(`${data.payload?.name} joined`);
                createPeerConnection(String(data.user_id), true, currentIceServers, data.payload);
                break;
            case 'user_left':
                if (pcsRef.current[data.user_id]) {
                    pcsRef.current[data.user_id].close();
                    delete pcsRef.current[data.user_id];
                }
                setRemotePeers(prev => {
                    const next = new Map(prev);
                    next.delete(String(data.user_id));
                    return next;
                });
                break;
            case 'offer':
                await handleOffer(data, currentIceServers);
                break;
            case 'answer':
                await handleAnswer(data);
                break;
            case 'candidate':
                await handleCandidate(data);
                break;
            case 'chat':
                if (data.payload) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === data.payload.id)) return prev;
                        return [...prev, data.payload];
                    });
                }
                break;
            case 'hand_raise':
                if (data.user_id !== user?.id) {
                    if (data.raised) toast(`${data.user_name} raised hand!`);
                    setRemotePeers(prev => {
                        const next = new Map(prev);
                        const peer = next.get(String(data.user_id));
                        if (peer) {
                            next.set(String(data.user_id), { ...peer, handRaised: !!data.raised });
                        }
                        return next;
                    });
                }
                break;
            case 'screen_share_state':
                if (data.active) {
                    setScreenShareOwner({ id: Number(data.user_id), name: data.user_name || 'A participant' });
                    if (Number(data.user_id) !== Number(user?.id)) {
                        toast(`${data.user_name || 'A participant'} started sharing their screen`);
                    }
                } else {
                    setScreenShareOwner(prev => Number(data.user_id) === Number(prev?.id) ? null : prev);
                    if (Number(data.user_id) !== Number(user?.id)) {
                        toast(`${data.user_name || 'A participant'} stopped sharing`);
                    }
                }
                break;
            case 'learning_pulse':
                if (Number(data.user_id) !== Number(user?.id)) {
                    if (data.cleared || data.pulse === null) {
                        setLastLearningPulse(null);
                        return;
                    }
                    const pulse = data.pulse || 'Shared a pulse';
                    setLastLearningPulse({
                        userId: Number(data.user_id),
                        userName: data.user_name || 'A participant',
                        pulse
                    });
                    toast(`${data.user_name || 'A participant'}: ${pulse}`);
                }
                break;
            case 'class_ended':
                if (Number(data.user_id) !== Number(user?.id)) {
                    setEndingClass(true);
                    toast(`${data.user_name || 'Instructor'} ended the class`);
                    await new Promise(resolve => setTimeout(resolve, 1600));
                    if (id) {
                        fetchClassroom(parseInt(id));
                    }
                    handleLeave();
                }
                break;
        }
    };

    const createPeerConnection = (targetId: string, initiator: boolean, iceServers: RTCIceServer[], userInfo?: any) => {
        const pc = new RTCPeerConnection({ iceServers });
        pcsRef.current[targetId] = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
        }

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemotePeers(prev => {
                const next = new Map(prev);
                const existing = next.get(String(targetId)) || { user: userInfo };
                next.set(String(targetId), { ...existing, stream });
                return next;
            });
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE Connection State for ${targetId}: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current) {
                wsRef.current.send(JSON.stringify({
                    type: 'candidate',
                    target_user_id: targetId,
                    candidate: event.candidate,
                    sender_user_id: user?.id,
                    user_info: { id: user?.id, full_name: user?.full_name, role: user?.role }
                }));
            }
        };

        if (userInfo) {
            setRemotePeers(prev => {
                const next = new Map(prev);
                if (!next.has(String(targetId))) next.set(String(targetId), { user: userInfo });
                return next;
            });
        }

        if (initiator) {
            pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
                wsRef.current?.send(JSON.stringify({
                    type: 'offer',
                    target_user_id: targetId,
                    sender_user_id: user?.id,
                    sdp: pc.localDescription,
                    user_info: { id: user?.id, full_name: user?.full_name, role: user?.role }
                }));
            });
        }
        return pc;
    };

    const handleOffer = async (data: any, iceServers: RTCIceServer[]) => {
        const senderId = String(data.sender_user_id);
        const pc = createPeerConnection(senderId, false, iceServers);
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Add any queued candidates for this specific PC
        const queued = candidateQueueRef.current[senderId] || [];
        for (const candidate of queued) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        }
        delete candidateQueueRef.current[senderId];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(JSON.stringify({
            type: 'answer',
            target_user_id: senderId,
            sender_user_id: user?.id,
            sdp: answer,
            user_info: { id: user?.id, full_name: user?.full_name, role: user?.role }
        }));
    };

    const handleAnswer = async (data: any) => {
        const senderId = String(data.sender_user_id);
        const pc = pcsRef.current[senderId];
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            // Add any queued candidates for this specific PC that arrived before answer
            const queued = candidateQueueRef.current[senderId] || [];
            for (const candidate of queued) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
            delete candidateQueueRef.current[senderId];
        }
    };

    const handleCandidate = async (data: any) => {
        const senderId = String(data.sender_user_id);
        const pc = pcsRef.current[senderId];

        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.error("Error adding ice candidate", e);
            }
        } else {
            // Queue candidate for later
            if (!candidateQueueRef.current[senderId]) {
                candidateQueueRef.current[senderId] = [];
            }
            candidateQueueRef.current[senderId].push(data.candidate);
        }
    };


    const handleStartClass = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            await classroomService.startClassroom(parseInt(id));
            toast.success('Class started');
            fetchClassroom(parseInt(id));
        } catch (error) {
            toast.error('Failed to start class');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndClass = async () => {
        if (!id) return;
        setEndingClass(true);
        setActionLoading(true);
        try {
            await classroomService.endClassroom(parseInt(id));
            wsRef.current?.send(JSON.stringify({
                type: 'class_ended',
                user_id: user?.id,
                user_name: user?.full_name || 'Instructor'
            }));
            toast.success('Class ended');
            await new Promise(resolve => setTimeout(resolve, 1600));
            fetchClassroom(parseInt(id));
            handleLeave();
        } catch (error) {
            toast.error('Failed to end class');
            setEndingClass(false);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <PageLoader />;
    if (!classroom) return null;

    if (joined) {
        const participantCards = [
            {
                uid: String(user?.id || 'local'),
                name: `${user?.full_name || 'You'} (You)`,
                stream: localStream,
                isLocal: true,
                handRaised
            },
            ...Array.from(remotePeers.entries()).map(([uid, peer]) => ({
                uid,
                name: peer.user?.name || `User ${uid}`,
                stream: peer.stream,
                isLocal: false,
                handRaised: !!peer.handRaised
            }))
        ];
        const controlButtonClass = 'group relative h-12 w-12 rounded-full p-0 shadow-lg';
        const controlIconClass = 'w-4 h-4 sm:w-5 sm:h-5';
        const ControlTitle = ({ label }: { label: string }) => (
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg group-hover:block">
                {label}
            </span>
        );

        return (
            <div ref={containerRef} className="fixed inset-0 z-60 bg-gray-950 flex flex-col text-white">
                {endingClass && (
                    <div className="absolute inset-0 z-80 flex items-center justify-center bg-gray-950/90 backdrop-blur-md">
                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-primary-400/40 bg-primary-500/10 shadow-[0_0_60px_rgba(99,102,241,0.45)] animate-ping" />
                            <div className="relative -mt-24 mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 mx-auto">
                                <PhoneOff className="h-10 w-10 text-white" />
                            </div>
                            <p className="text-3xl font-black text-white">Wrapping up the class</p>
                            <p className="mt-2 text-sm font-semibold text-gray-400">Saving attendance and closing the live room...</p>
                        </div>
                    </div>
                )}
                <div className="flex-1 p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-hidden relative">
                    {showPulseMenu && (
                        <div className="absolute bottom-4 left-1/2 z-70 w-48 -translate-x-1/2 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl sm:bottom-5">
                            {pulseOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => sendLearningPulse(option)}
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-100 transition hover:bg-primary-600 hover:text-white"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="absolute right-5 top-5 z-50 flex items-center gap-2">
                        {selectedStageUserId && (
                            <button
                                onClick={() => setSelectedStageUserId(null)}
                                className="rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                                title="Switch back to the default main screen"
                            >
                                Back to main screen
                            </button>
                        )}
                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                        </button>
                    </div>

                    {/* Main Video Area */}
                    <div className="min-w-0 flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
                            <video
                                ref={mainVideoRef}
                                autoPlay
                                muted={isMainLocal || isAudioMuted}
                                playsInline
                                className={`w-full h-full object-cover ${isMainLocal && !isScreenSharing ? 'transform scale-x-[-1]' : ''}`}
                                style={isScreenSharing && isMainLocal ? { objectFit: 'contain' } : {}}
                            />
                            {!mainStream && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl font-bold text-white">
                                                {classroom.instructor?.full_name?.charAt(0)}
                                            </span>
                                        </div>
                                        <p className="text-gray-400">
                                            {isInstructor ? 'Initializing camera...' : 'Waiting for instructor stream...'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    LIVE
                                </div>
                                {screenShareOwner && (
                                    <div className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <Monitor className="w-3 h-3" /> {screenShareOwner.name} sharing
                                    </div>
                                )}
                                {handRaised && (
                                    <div className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full animate-bounce flex items-center gap-1">
                                        <Hand className="w-3 h-3" /> Hand Raised
                                    </div>
                                )}
                            </div>
                            {lastLearningPulse && (
                                <div className="absolute bottom-4 left-4 max-w-[min(26rem,calc(100%-2rem))] rounded-xl border border-emerald-400/30 bg-gray-950/80 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-gray-950">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">Learning Pulse</p>
                                            <p className="truncate text-sm font-bold">{lastLearningPulse.userName}: {lastLearningPulse.pulse}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearLearningPulse}
                                            className="-mr-1 -mt-1 rounded-md p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                            title="Clear pulse"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {showParticipants && (
                        <div className="fixed inset-x-3 bottom-24 top-16 z-40 flex flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-2xl md:static md:inset-auto md:w-96 md:shrink-0">
                            <div className="flex items-center justify-between border-b border-gray-700 p-4">
                                <h3 className="flex items-center gap-2 font-bold text-white"><Users className="h-4 w-4" /> Participants</h3>
                                <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="grid flex-1 auto-rows-min grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 md:grid-cols-1">
                                {participantCards.map((participant) => (
                                    <button
                                        key={participant.uid}
                                        type="button"
                                        onClick={() => participant.stream && setSelectedStageUserId(participant.uid)}
                                        disabled={!participant.stream}
                                        className={`overflow-hidden rounded-xl border bg-gray-800 text-left transition hover:border-primary-400 disabled:cursor-not-allowed disabled:opacity-70 ${selectedStageUserId === participant.uid ? 'border-primary-400 ring-2 ring-primary-500/70' : 'border-gray-700'}`}
                                        title={participant.stream ? 'Show on main screen' : 'No video available'}
                                    >
                                        <div className="relative aspect-video bg-gray-950">
                                            {participant.stream && participant.stream.getVideoTracks().some(track => track.enabled) ? (
                                                <video
                                                    ref={el => { if (el && el.srcObject !== participant.stream) el.srcObject = participant.stream!; }}
                                                    autoPlay
                                                    muted={participant.isLocal || isAudioMuted || selectedStageUserId === participant.uid}
                                                    playsInline
                                                    className={`h-full w-full object-cover ${participant.isLocal && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-900/50 text-xl font-black text-primary-200">
                                                        {participant.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                            )}
                                            {participant.handRaised && (
                                                <div className="absolute right-2 top-2 rounded-full bg-yellow-400 p-1 text-black">
                                                    <Hand className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                            {selectedStageUserId === participant.uid && (
                                                <div className="absolute bottom-2 right-2 rounded bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <p className="truncate text-xs font-bold text-white">{participant.name}</p>
                                            <span className="text-[10px] font-bold text-gray-400">{participant.stream ? 'Camera' : 'No camera'}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Sidebar */}
                    {showChat && (
                        <>
                            <div
                                className="hidden md:flex w-2 cursor-col-resize items-center justify-center rounded-full hover:bg-primary-500/20 transition-colors"
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    setIsResizingChat(true);
                                }}
                                title="Drag to resize chat"
                                role="separator"
                                aria-orientation="vertical"
                            >
                                <div className="h-16 w-1 rounded-full bg-gray-600" />
                            </div>
                            <div
                                className="fixed inset-x-3 bottom-24 top-16 z-40 flex flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-2xl md:static md:inset-auto md:z-40 md:w-(--chat-width) md:shrink-0 md:bg-gray-800"
                                style={{ '--chat-width': `${chatWidth}px` } as CSSProperties & Record<'--chat-width', string>}
                            >
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h3 className="text-white font-medium flex gap-2"><MessageSquare className="w-4 h-4" /> Chat</h3>
                                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-800/50 scrollbar-thin">
                                {messages.length === 0 ? <p className="text-center text-gray-500 text-sm mt-10">No messages</p> :
                                    messages.map(msg => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                                            <div className={`px-3 py-2 rounded-2xl text-sm wrap-break-word max-w-[85%] ${msg.user_id === user?.id ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}>
                                                <div className="text-[10px] opacity-75 mb-1">{msg.user?.full_name}</div>
                                                {msg.message_text}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="p-4 border-t border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Type..." />
                                    <button
                                        type="submit"
                                        disabled={sendingMsg || !newMessage.trim()}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={sendingMsg ? 'Sending...' : 'Send Message'}
                                    >
                                        {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                            </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="min-h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-between gap-3 px-3 sm:px-6 z-10">
                    <div className="text-white hidden lg:block max-w-[200px]">
                        <h2 className="font-bold text-sm truncate">{classroom.title}</h2>
                        <div className="flex gap-2 text-[10px] text-gray-400">
                            <span>Connected</span>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-1 justify-center overflow-x-auto py-2">
                        <Button onClick={toggleMic} variant={micOn ? 'secondary' : 'destructive'} className={controlButtonClass} title={micOn ? 'Mic On' : 'Mic Off'}>
                            {micOn ? <Mic className={controlIconClass} /> : <MicOff className={controlIconClass} />}
                            <ControlTitle label={micOn ? 'Mic On' : 'Mic Off'} />
                        </Button>
                        <Button onClick={toggleCamera} variant={cameraOn ? 'secondary' : 'destructive'} className={controlButtonClass} title={cameraOn ? 'Camera On' : 'Camera Off'}>
                            {cameraOn ? <Video className={controlIconClass} /> : <VideoOff className={controlIconClass} />}
                            <ControlTitle label={cameraOn ? 'Camera On' : 'Camera Off'} />
                        </Button>
                        <Button onClick={isScreenSharing ? stopScreenShare : startScreenShare} variant={isScreenSharing ? 'default' : 'secondary'} className={controlButtonClass} title={isScreenSharing ? 'Stop Share' : 'Share Screen'}>
                            {isScreenSharing ? <X className={controlIconClass} /> : <Monitor className={controlIconClass} />}
                            <ControlTitle label={isScreenSharing ? 'Stop Share' : 'Share Screen'} />
                        </Button>
                        <Button onClick={toggleHandRaise} variant={handRaised ? 'default' : 'secondary'} className={`${controlButtonClass} ${handRaised ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-black' : ''}`} title={handRaised ? 'Lower Hand' : 'Raise Hand'}>
                            <Hand className={controlIconClass} />
                            <ControlTitle label={handRaised ? 'Lower Hand' : 'Raise Hand'} />
                        </Button>
                        <Button
                            onClick={() => setIsAudioMuted(!isAudioMuted)}
                            variant={isAudioMuted ? 'destructive' : 'secondary'}
                            className={controlButtonClass}
                            title={isAudioMuted ? 'Audio Muted' : 'Audio On'}
                        >
                            {isAudioMuted ? <VolumeX className={controlIconClass} /> : <Volume2 className={controlIconClass} />}
                            <ControlTitle label={isAudioMuted ? 'Audio Muted' : 'Audio On'} />
                        </Button>
                        <Button onClick={() => setShowPulseMenu(prev => !prev)} variant={showPulseMenu ? 'default' : 'secondary'} className={controlButtonClass} title="Learning Pulse">
                            <Sparkles className={controlIconClass} />
                            <ControlTitle label="Learning Pulse" />
                        </Button>
                        <Button onClick={() => setShowParticipants(!showParticipants)} variant={showParticipants ? 'default' : 'secondary'} className={controlButtonClass} title="Participants">
                            <Users className={controlIconClass} />
                            <ControlTitle label="Participants" />
                        </Button>
                        <Button onClick={() => setShowChat(!showChat)} variant={showChat ? 'default' : 'secondary'} className={controlButtonClass} title="Toggle Chat">
                            <MessageSquare className={controlIconClass} />
                            <ControlTitle label={showChat ? 'Hide Chat' : 'Chat'} />
                        </Button>
                        <div className="hidden sm:block w-px h-8 bg-gray-600 mx-1 self-center"></div>
                        <Button onClick={handleLeave} variant="destructive" className={controlButtonClass} title="Leave">
                            <PhoneOff className={controlIconClass} />
                            <ControlTitle label="Leave" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        {user?.role === 'instructor' && isInstructor && (
                            <Button variant="destructive" size="sm" onClick={handleEndClass} isLoading={actionLoading} className="shadow-lg hover:brightness-110 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
                                End Class
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row">

                {/* Left Side: Info */}
                <div className="p-8 md:p-12 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-700 bg-gray-800/50">
                    <div className="mb-8">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${classroom.status === 'live' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            classroom.status === 'completed' ? 'bg-gray-700 text-gray-400 border border-gray-600' :
                                'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                            {classroom.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
                            {classroom.status.replace('_', ' ')}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{classroom.title}</h1>
                        <p className="text-gray-400 text-lg leading-relaxed">{classroom.description || 'No description provided.'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center text-gray-300">
                            <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center mr-4 border border-gray-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date</p>
                                <p className="font-medium">{format(new Date(classroom.start_time), 'EEEE, MMMM do, yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center mr-4 border border-gray-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Time</p>
                                <p className="font-medium">
                                    {format(new Date(classroom.start_time), 'h:mm a')}
                                    {classroom.end_time && ` - ${format(new Date(classroom.end_time), 'h:mm a')}`}
                                </p>
                            </div>
                        </div>
                        {classroom.instructor && (
                            <div className="flex items-center text-gray-300">
                                <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center mr-4 border border-gray-600">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Host</p>
                                    <p className="font-medium">{classroom.instructor.full_name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Action */}
                <div className="p-8 md:p-12 w-full md:w-[380px] bg-gray-900/50 flex flex-col justify-center items-center text-center">

                    <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transform rotate-3">
                        <Video className="w-10 h-10 text-white" />
                    </div>

                    {classroom.status === 'live' ? (
                        <div className="w-full space-y-4">
                            <h3 className="text-xl font-bold text-white">Class is Live!</h3>
                            <p className="text-gray-400 text-sm mb-6">The session has started. You can join now.</p>
                            <Button className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105" onClick={handleJoinSession} isLoading={actionLoading}>
                                Join Class Now
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            <h3 className="text-xl font-bold text-white">
                                {classroom.status === 'completed' ? 'Class Ended' : 'Waiting for Host'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                                {classroom.status === 'completed'
                                    ? 'This session has already finished.'
                                    : 'The class hasn\'t started yet. Please wait.'}
                            </p>

                            {user?.role === 'instructor' && isInstructor && classroom.status !== 'completed' && (
                                <Button className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105" onClick={handleStartClass} isLoading={actionLoading}>
                                    Start Class
                                </Button>
                            )}

                            {classroom.status === 'scheduled' && !isInstructor && (
                                <Button className="w-full py-6 text-lg bg-gray-700 text-gray-400 cursor-not-allowed rounded-xl" disabled>
                                    Not Started Yet
                                </Button>
                            )}
                        </div>
                    )}

                    <Button variant="ghost" className="mt-6 text-gray-400 hover:bg-gray-700 dark:hover:text-gray-200" onClick={() => navigate('/classrooms')}>
                        Back to Classrooms
                    </Button>
                </div>
            </div>
        </div>
    );
};
