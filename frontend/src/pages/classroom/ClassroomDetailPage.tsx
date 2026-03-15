import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService, type Classroom, type ClassMessage } from '../../services/classroom.service';
import { PageLoader } from '../../components/common/PageLoader';
import { useAuthStore } from '../../store/auth.store';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Send, Hand, Monitor, X, Calendar, Clock, User as UserIcon, Maximize, Minimize, Volume2, VolumeX, Copy } from 'lucide-react';
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

    // --- View Logic / Hooks must be before returns ---

    // View Logic - compute main stream
    const isInstructor = Number(user?.id) === Number(classroom?.instructor_id);
    const instructorId = String(classroom?.instructor_id || '');
    const mainStream = isInstructor ? localStream : remotePeers.get(instructorId)?.stream;

    // Attach Main Video
    useEffect(() => {
        if (mainVideoRef.current && mainStream && mainVideoRef.current.srcObject !== mainStream) {
            mainVideoRef.current.srcObject = mainStream;
        }
    }, [mainStream]);


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
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            stream.getVideoTracks()[0].onended = () => stopScreenShare();
            setLocalStream(stream);
            setIsScreenSharing(true);

            // Replace Video Track
            const videoTrack = stream.getVideoTracks()[0];
            Object.values(pcsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });
        } catch (error) {
            toast.error('Could not share screen');
        }
    };

    const stopScreenShare = async () => {
        setIsScreenSharing(false);
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
        try {
            await classroomService.endClassroom(parseInt(id));
            toast.success('Class ended');
            fetchClassroom(parseInt(id));
            handleLeave();
        } catch (error) {
            toast.error('Failed to end class');
        }
    };

    if (loading) return <PageLoader />;
    if (!classroom) return null;

    // Remote participants (exclude instructor from this list if we are student, showing them in main)
    const participants = Array.from(remotePeers.entries()).filter(([uid]) => {
        if (!isInstructor && uid === instructorId) return false;
        return true;
    });

    if (joined) {
        return (
            <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
                <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">
                    {/* Full Screen Toggle (Top Right Overlay) */}
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-6 right-6 z-50 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm"
                        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>

                    {/* Main Video Area */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
                            <video
                                ref={mainVideoRef}
                                autoPlay
                                muted={isInstructor || isAudioMuted}
                                playsInline
                                className={`w-full h-full object-cover ${isInstructor && !isScreenSharing ? 'transform scale-x-[-1]' : ''}`}
                                style={isScreenSharing && isInstructor ? { objectFit: 'contain' } : {}}
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
                                {handRaised && (
                                    <div className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full animate-bounce flex items-center gap-1">
                                        <Hand className="w-3 h-3" /> Hand Raised
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Participants Strip */}
                        {participants.length > 0 && (
                            <div className="h-32 flex gap-4 overflow-x-auto pb-2">
                                {participants.map(([uid, peer]) => (
                                    <div key={uid} className="relative aspect-video bg-gray-800 rounded-lg border border-gray-700 flex-shrink-0 overflow-hidden">
                                        {peer.stream ? (
                                            <video
                                                ref={el => { if (el && el.srcObject !== peer.stream) el.srcObject = peer.stream!; }}
                                                autoPlay playsInline
                                                muted={isAudioMuted}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                No Video
                                            </div>
                                        )}
                                        <div className="absolute top-1 right-1 flex gap-1">
                                            {peer.handRaised && (
                                                <div className="bg-yellow-500 p-1 rounded-full shadow-lg animate-bounce">
                                                    <Hand className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                                            {peer.user?.name || `User ${uid}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Sidebar */}
                    {showChat && (
                        <div className="w-80 bg-gray-800 rounded-xl flex flex-col border border-gray-700 transition-all duration-300 z-40">
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h3 className="text-white font-medium flex gap-2"><MessageSquare className="w-4 h-4" /> Chat</h3>
                                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-800/50 scrollbar-thin">
                                {messages.length === 0 ? <p className="text-center text-gray-500 text-sm mt-10">No messages</p> :
                                    messages.map(msg => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                                            <div className={`px-3 py-2 rounded-2xl text-sm break-words max-w-[85%] ${msg.user_id === user?.id ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}>
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
                                    <Button type="submit" isLoading={sendingMsg} disabled={!newMessage.trim()} className="bg-indigo-600 p-2 rounded text-white hover:bg-indigo-700 disabled:opacity-50"><Send className="w-4 h-4" /></Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 sm:px-8 z-10">
                    <div className="text-white hidden lg:block max-w-[200px]">
                        <h2 className="font-bold text-sm truncate">{classroom.title}</h2>
                        <div className="flex gap-2 text-[10px] text-gray-400">
                            <span>Connected</span>
                        </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-4 flex-1 justify-center">
                        <Button onClick={toggleMic} variant={micOn ? 'secondary' : 'destructive'} className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg">
                            {micOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <Button onClick={toggleCamera} variant={cameraOn ? 'secondary' : 'destructive'} className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg">
                            {cameraOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <Button onClick={isScreenSharing ? stopScreenShare : startScreenShare} variant={isScreenSharing ? 'default' : 'secondary'} className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg">
                            {isScreenSharing ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <Button onClick={toggleHandRaise} variant={handRaised ? 'default' : 'secondary'} className={`rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg ${handRaised ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600' : ''}`}>
                            <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <Button
                            onClick={() => setIsAudioMuted(!isAudioMuted)}
                            variant={isAudioMuted ? 'destructive' : 'secondary'}
                            className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg"
                        >
                            {isAudioMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Class link copied');
                            }}
                            variant="secondary"
                            className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg"
                        >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <Button onClick={() => setShowChat(!showChat)} variant={showChat ? 'default' : 'secondary'} className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg" title="Toggle Chat">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <div className="hidden sm:block w-px h-8 bg-gray-600 mx-1 self-center"></div>
                        <Button onClick={handleLeave} variant="destructive" className="rounded-full w-9 h-9 sm:w-12 sm:h-12 p-0 shadow-lg hover:brightness-110">
                            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
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

                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transform rotate-3">
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
