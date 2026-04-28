'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Headphones, Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';

export default function SpeakingRoomPage() {
    const { user } = useContext(AuthContext) || {};
    const router = useRouter();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<'IDLE' | 'FINDING' | 'MATCHED' | 'CONNECTED'>('IDLE');
    const [partnerName, setPartnerName] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Initialize Socket.io connection on mount
    useEffect(() => {
        if (!user) return;

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to signaling server');
        });

        newSocket.on('room_matched', async ({ roomId: matchedRoomId, partnerName: pName, isInitiator }) => {
            console.log('Matched!', { matchedRoomId, pName, isInitiator });
            setRoomId(matchedRoomId);
            setPartnerName(pName);
            setStatus('MATCHED');

            await setupWebRTC(newSocket, matchedRoomId, isInitiator);
        });

        newSocket.on('partner_left', () => {
            endCallAndReset('Your partner left the room.');
        });

        return () => {
            newSocket.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const setupWebRTC = async (activeSocket: Socket, rId: string, initiator: boolean) => {
        try {
            // Get local media
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create Peer Connection
            const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(configuration);
            peerConnectionRef.current = pc;

            // Add local tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Handle incoming tracks
            pc.ontrack = (event) => {
                console.log('Received remote track');
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setStatus('CONNECTED');
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    activeSocket.emit('webrtc_signal', {
                        roomId: rId,
                        signalData: { type: 'ice-candidate', candidate: event.candidate }
                    });
                }
            };

            // Listen for signaling data from server
            activeSocket.on('webrtc_signal', async ({ signalData }) => {
                if (signalData.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signalData.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    activeSocket.emit('webrtc_signal', {
                        roomId: rId,
                        signalData: { type: 'answer', answer }
                    });
                } else if (signalData.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signalData.answer));
                } else if (signalData.type === 'ice-candidate') {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                }
            });

            // If initiator, create and send offer
            if (initiator) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                activeSocket.emit('webrtc_signal', {
                    roomId: rId,
                    signalData: { type: 'offer', offer }
                });
            }

        } catch (err) {
            console.error('Error accessing media devices.', err);
            endCallAndReset('Could not access Camera/Microphone. Please check permissions.');
        }
    };

    const findPartner = () => {
        if (!socket || !user) return;
        setStatus('FINDING');
        socket.emit('join_queue', {
            cefrLevel: user.cefrLevel || 'Any',
            userId: user._id,
            userName: user.name
        });
    };

    const cancelSearch = () => {
        if (!socket) return;
        socket.emit('leave_queue');
        setStatus('IDLE');
    };

    const endCallAndReset = (message?: string) => {
        if (message) alert(message);

        if (socket && roomId) {
            socket.emit('leave_room', { roomId });
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        setStatus('IDLE');
        setRoomId('');
        setPartnerName('');
        setIsMuted(false);
        setIsVideoOff(false);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <p className="text-gray-500">Please log in to use the Speaking Room.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-8 px-4 transition-colors font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header Navbar */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/practice" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-emerald-600 transition-colors border border-gray-200 dark:border-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/40 px-5 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Headphones className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                            P2P Speaking Room
                        </span>
                    </div>

                    <div className="w-9"></div> {/* Placeholder */}
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center">

                    {/* State: IDLE */}
                    {status === 'IDLE' && (
                        <div className="text-center p-8 max-w-lg mx-auto animate-fade-in-up">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 dark:text-emerald-400 shadow-inner">
                                <Users className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to practice?</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Join the queue and we will match you with another learner at your level (<strong className="text-emerald-600 dark:text-emerald-400">{user.cefrLevel || 'Any'}</strong>). Don't worry, cameras can be turned off!
                            </p>
                            <button
                                onClick={findPartner}
                                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1"
                            >
                                Find a Partner
                            </button>
                        </div>
                    )}

                    {/* State: FINDING */}
                    {status === 'FINDING' && (
                        <div className="text-center p-8 max-w-lg mx-auto animate-fade-in-up">
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shadow-inner">
                                    <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Searching for a partner...</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Looking for a fellow {user.cefrLevel || 'learner'}.</p>
                            <button
                                onClick={cancelSearch}
                                className="px-8 py-3 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold transition-all border border-gray-200 hover:border-red-200"
                            >
                                Cancel Search
                            </button>
                        </div>
                    )}

                    {/* State: MATCHED / CONNECTED (Video UI) */}
                    {(status === 'MATCHED' || status === 'CONNECTED') && (
                        <div className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-gray-900">

                            {/* Remote Video (Takes full background essentially, or split half) */}
                            <div className="relative flex-1 bg-black flex items-center justify-center border-r md:border-b-0 border-b border-gray-800">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                ></video>

                                {status === 'MATCHED' && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                                        <h3 className="text-xl text-white font-bold">Connecting to {partnerName}...</h3>
                                    </div>
                                )}

                                {/* Partner Name Badge */}
                                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium text-sm border border-white/10">
                                    {partnerName || 'Partner'}
                                </div>
                            </div>

                            {/* Local Video (Picture in picture style on desktop, side by side on mobile if cramped, but let's do sidebar) */}
                            <div className="md:w-72 bg-gray-800 flex flex-col justify-between p-4 relative">

                                <div className="aspect-[3/4] w-full bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-gray-700">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted // Mute local video playback to avoid echo
                                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                                    ></video>

                                    {isVideoOff && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
                                            <VideoOff className="w-12 h-12" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-md text-xs font-bold border border-white/10">
                                        You
                                    </div>

                                    {isMuted && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                            <MicOff className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Controls area */}
                                <div className="mt-8 flex justify-center space-x-4">
                                    <button
                                        onClick={toggleMute}
                                        className={`p-4 rounded-full transition-all shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                    >
                                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>

                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 rounded-full transition-all shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                    >
                                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                    </button>

                                    <button
                                        onClick={() => endCallAndReset()}
                                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all transform hover:-translate-y-1"
                                    >
                                        <PhoneOff className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
