import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService, type Classroom, type ClassMessage } from '../../services/classroom.service';
import { useAuthStore } from '../../store/auth.store';
import { Loader2, Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Send, Hand, Monitor, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface Peer {
    stream?: MediaStream;
    user?: {
        id: number;
        name: string;
        photo?: string;
    };
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
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [handRaised, setHandRaised] = useState(false);

    // WebRTC / WS Refs
    const wsRef = useRef<WebSocket | null>(null);
    const pcsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
    const localStreamRef = useRef<MediaStream | null>(null);

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

    // Chat Polling
    useEffect(() => {
        let interval: any;
        if (joined && id) {
            loadMessages();
            interval = setInterval(loadMessages, 3000);
        }
        return () => clearInterval(interval);
    }, [joined, id]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // View Logic - compute main stream
    const isInstructor = user?.role === 'instructor';
    const instructorId = String(classroom?.instructor_id || '');
    const mainStream = isInstructor ? localStream : remotePeers.get(instructorId)?.stream;

    // Attach Main Video
    useEffect(() => {
        if (mainVideoRef.current && mainStream) {
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
        try {
            await classroomService.sendMessage(parseInt(id), newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    // --- Media Action Handlers ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            setCameraOn(true);
            setMicOn(true);

            // Add to existing PCs
            Object.values(pcsRef.current).forEach(pc => {
                stream.getTracks().forEach(track => {
                    const senders = pc.getSenders();
                    const hasTrack = senders.some(s => s.track?.kind === track.kind);
                    if (!hasTrack) pc.addTrack(track, stream);
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
        setHandRaised(!handRaised);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'hand_raise',
                user_id: user?.id,
                user_name: user?.full_name
            }));
        }
        toast.success(handRaised ? 'Hand lowered' : 'Hand raised');
    };

    // --- Signaling ---
    const handleJoinSession = async () => {
        if (!id || !user) return;

        try {
            const response = await classroomService.joinClassroom(parseInt(id));

            // Set TURN
            let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
            if (response.turn_server) {
                iceServers = response.turn_server.urls.map((url: string) => ({
                    urls: url,
                    username: response.turn_server.username,
                    credential: response.turn_server.credential
                }));
            }

            // Connect WS
            const wsUrl = `ws://localhost:8000/${response.websocket_url}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = async () => {
                console.log('WS Connected');
                wsRef.current?.send(JSON.stringify({
                    type: 'join',
                    user_id: user.id,
                    user_info: { id: user.id, name: user.full_name, photo: user.photo }
                }));

                // Start Camera
                await startCamera();
                setJoined(true);
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
                createPeerConnection(data.user_id, true, currentIceServers, data.payload);
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
            case 'hand_raise':
                if (data.user_id !== user?.id) toast(`${data.user_name} raised hand!`);
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

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current) {
                wsRef.current.send(JSON.stringify({
                    type: 'candidate',
                    target_user_id: targetId,
                    candidate: event.candidate,
                    sender_user_id: user?.id
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
                    sdp: pc.localDescription
                }));
            });
        }
        return pc;
    };

    const handleOffer = async (data: any, iceServers: RTCIceServer[]) => {
        const senderId = data.sender_user_id;
        const pc = createPeerConnection(senderId, false, iceServers);
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(JSON.stringify({
            type: 'answer',
            target_user_id: senderId,
            sender_user_id: user?.id,
            sdp: answer
        }));
    };

    const handleAnswer = async (data: any) => {
        const pc = pcsRef.current[data.sender_user_id];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    };

    const handleCandidate = async (data: any) => {
        const pc = pcsRef.current[data.sender_user_id];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    };


    const handleStartClass = async () => {
        if (!id) return;
        try {
            await classroomService.startClassroom(parseInt(id));
            toast.success('Class started');
            fetchClassroom(parseInt(id));
        } catch (error) {
            toast.error('Failed to start class');
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


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    if (!classroom) return null;

    // Remote participants (exclude instructor from this list if we are student, showing them in main)
    const participants = Array.from(remotePeers.entries()).filter(([uid]) => {
        if (!isInstructor && uid === instructorId) return false;
        return true;
    });

    if (joined) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col">
                <div className="flex-1 p-4 flex gap-4 overflow-hidden">
                    {/* Main Video Area */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
                            <video
                                ref={mainVideoRef}
                                autoPlay
                                muted={isInstructor}
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
                                                ref={el => { if (el) el.srcObject = peer.stream!; }}
                                                autoPlay playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                No Video
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                                            {peer.user?.name || `User ${uid}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Sidebar */}
                    <div className="w-80 bg-gray-800 rounded-xl flex flex-col border border-gray-700">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-white font-medium flex gap-2"><MessageSquare className="w-4 h-4" /> Chat</h3>
                            <span className="text-gray-400 text-xs flex gap-1"><Users className="w-3 h-3" /> {remotePeers.size + 1}</span>
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
                                <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 p-2 rounded text-white hover:bg-indigo-700 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-8 z-10">
                    <div className="text-white">
                        <h2 className="font-bold">{classroom.title}</h2>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span>Connected</span>
                            {classroom.subject_id && (
                                <>
                                    <span className="text-gray-600">|</span>
                                    <button onClick={() => navigate(`/communities/${classroom.subject_id}`)} className="hover:text-white transition-colors">
                                        Community
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={toggleMic} variant={micOn ? 'secondary' : 'destructive'} className="rounded-full w-12 h-12 p-0">
                            {micOn ? <Mic /> : <MicOff />}
                        </Button>
                        <Button onClick={toggleCamera} variant={cameraOn ? 'secondary' : 'destructive'} className="rounded-full w-12 h-12 p-0">
                            {cameraOn ? <Video /> : <VideoOff />}
                        </Button>
                        <Button onClick={isScreenSharing ? stopScreenShare : startScreenShare} variant={isScreenSharing ? 'default' : 'secondary'} className="rounded-full w-12 h-12 p-0">
                            {isScreenSharing ? <X /> : <Monitor />}
                        </Button>
                        <Button onClick={toggleHandRaise} variant={handRaised ? 'default' : 'secondary'} className={`rounded-full w-12 h-12 p-0 ${handRaised ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600' : ''}`}>
                            <Hand />
                        </Button>
                        <div className="w-px h-8 bg-gray-600 mx-2 self-center"></div>
                        <Button onClick={handleLeave} variant="destructive" className="rounded-full w-12 h-12 p-0">
                            <PhoneOff />
                        </Button>
                    </div>
                    <div>
                        {user?.role === 'instructor' && <Button variant="destructive" size="sm" onClick={handleEndClass}>End Class</Button>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-8 text-center"><h1 className="text-2xl font-bold text-white">{classroom.title}</h1><p className="text-indigo-100">{classroom.description}</p></div>
                <div className="p-8 space-y-4">
                    <div className="text-center"><span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{classroom.status.toUpperCase()}</span></div>
                    {classroom.status === 'live' ? (
                        <Button className="w-full h-12 text-lg" onClick={handleJoinSession}><Video className="mr-2" /> Join Class Now</Button>
                    ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <p>Waiting for instructor...</p>
                            {user?.role === 'instructor' && <Button className="mt-4 w-full" onClick={handleStartClass}>Start Class</Button>}
                        </div>
                    )}
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/classrooms')}>Back to List</Button>
                </div>
            </div>
        </div>
    );
};
