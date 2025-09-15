import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'app-live-class',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './live-class.component.html',
  styleUrls: ['./live-class.component.scss']
})
export class LiveClassComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;

  isProfessor = false;
  isStudent = false;
  isConnected = false;
  isSharingScreen = false;
  isMuted = false;
  isVideoOn = true;
  isWebRTCSupported = true;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  peerConnection: RTCPeerConnection | null = null;

  // Configuração do WebRTC
  private readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private signalRService: SignalRService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isProfessor = this.authService.hasRole('Professor');
    this.isStudent = this.authService.hasRole('Aluno');

    if (!this.isProfessor && !this.isStudent) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Verificar compatibilidade do WebRTC
    this.checkWebRTCSupport();
    
    if (this.isWebRTCSupported) {
      try {
        await this.initializeSignalR();
        await this.initializeWebRTC();
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        this.snackBar.open('Erro ao conectar com o servidor', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      await this.signalRService.startConnection();
      
      // Configurar listeners para WebRTC signaling
      this.signalRService.onReceiveWebRTCSignal((signal, type, userId) => {
        this.handleWebRTCSignal(signal, type, userId);
      });

      this.signalRService.onJoinedClassroom((classroomId) => {
        console.log('Entrou na turma:', classroomId);
        this.snackBar.open('Conectado à turma!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      });

      this.signalRService.onError((error) => {
        console.error('Erro SignalR:', error);
        this.snackBar.open(`Erro: ${error}`, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      });

    } catch (error) {
      console.error('Erro ao conectar SignalR:', error);
      throw error;
    }
  }

  private checkWebRTCSupport(): void {
    // Verificar se estamos em um contexto seguro
    if (!this.isSecureContext()) {
      this.isWebRTCSupported = false;
      return;
    }

    // Verificar se a API de mídia está disponível
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.isWebRTCSupported = false;
      return;
    }

    // Verificar se o navegador suporta WebRTC
    if (!window.RTCPeerConnection) {
      this.isWebRTCSupported = false;
      return;
    }

    this.isWebRTCSupported = true;
  }

  private isSecureContext(): boolean {
    // Verificar se estamos em localhost ou HTTPS
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.');
    const isHttps = window.location.protocol === 'https:';
    
    return isLocalhost || isHttps;
  }

  private async initializeWebRTC(): Promise<void> {
    try {
      // Verificar se estamos em um contexto seguro (HTTPS ou localhost)
      if (!this.isSecureContext()) {
        throw new Error('WebRTC requer conexão segura (HTTPS) ou localhost');
      }

      // Verificar se a API de mídia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API de mídia não disponível neste navegador');
      }

      // Verificar se o navegador suporta WebRTC
      if (!window.RTCPeerConnection) {
        throw new Error('WebRTC não suportado neste navegador');
      }

      // Solicitar acesso à câmera e microfone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = this.localStream;
      }

      // Configurar peer connection
      this.setupPeerConnection();

      this.snackBar.open('Câmera e microfone ativados!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Erro ao acessar mídia:', error);
      
      let errorMessage = 'Erro ao acessar câmera/microfone';
      if (error instanceof Error) {
        if (error.message.includes('WebRTC requer conexão segura')) {
          errorMessage = 'WebRTC requer HTTPS ou localhost. Acesse via https://192.168.0.136:4200';
        } else if (error.message.includes('API de mídia não disponível')) {
          errorMessage = 'Seu navegador não suporta acesso à câmera/microfone. Use Chrome, Firefox ou Edge atualizados.';
        } else if (error.message.includes('WebRTC não suportado')) {
          errorMessage = 'WebRTC não suportado neste navegador. Use Chrome, Firefox ou Edge.';
        } else if (error.message.includes('Permission denied')) {
          errorMessage = 'Permissão negada para acessar câmera/microfone. Verifique as configurações do navegador.';
        } else if (error.message.includes('Not found')) {
          errorMessage = 'Câmera/microfone não encontrados. Verifique se estão conectados.';
        }
      }
      
      this.snackBar.open(errorMessage, 'Fechar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  private setupPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Adicionar stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Configurar recebimento de stream remoto
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = this.remoteStream;
      }
      this.isConnected = true;
      this.snackBar.open('Conexão estabelecida!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    };

    // Configurar ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalRService.sendWebRTCSignal(event.candidate, 'ice-candidate');
      }
    };

    // Iniciar oferta de conexão se for professor
    if (this.isProfessor) {
      this.createOffer();
    }
  }

  private async createOffer(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      await this.signalRService.sendWebRTCSignal(offer, 'offer');
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
    }
  }

  private async createAnswer(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      await this.signalRService.sendWebRTCSignal(answer, 'answer');
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
    }
  }

  private async handleWebRTCSignal(signal: any, type: string, userId: string): Promise<void> {
    if (!this.peerConnection) return;

    try {
      switch (type) {
        case 'offer':
          await this.peerConnection.setRemoteDescription(signal);
          await this.createAnswer();
          break;
        case 'answer':
          await this.peerConnection.setRemoteDescription(signal);
          break;
        case 'ice-candidate':
          await this.peerConnection.addIceCandidate(signal);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar sinal WebRTC:', error);
    }
  }

  async startScreenShare(): Promise<void> {
    if (!this.isProfessor) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Substituir stream de vídeo pela tela
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => 
        s.track?.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }

      this.isSharingScreen = true;
      this.snackBar.open('Compartilhamento de tela iniciado!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      // Parar compartilhamento quando a tela for fechada
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      this.snackBar.open('Erro ao compartilhar tela', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.isProfessor) return;

    try {
      // Voltar para a câmera
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => 
        s.track?.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }

      this.isSharingScreen = false;
      this.snackBar.open('Compartilhamento de tela parado!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Erro ao parar compartilhamento:', error);
    }
  }

  toggleMute(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoOn = videoTrack.enabled;
      }
    }
  }

  async joinClass(): Promise<void> {
    if (this.isStudent) {
      // TODO: Implementar lógica para aluno entrar na aula
      this.snackBar.open('Entrando na aula...', 'Fechar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  async startClass(): Promise<void> {
    if (this.isProfessor) {
      // TODO: Implementar lógica para professor iniciar aula
      this.snackBar.open('Aula iniciada!', 'Fechar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  async leaveClass(): Promise<void> {
    await this.cleanup();
    this.router.navigate(['/dashboard']);
  }

  private async cleanup(): Promise<void> {
    // Limpar listeners do SignalR
    this.signalRService.offReceiveWebRTCSignal();
    this.signalRService.offJoinedClassroom();
    this.signalRService.offError();

    // Parar conexão SignalR
    await this.signalRService.stopConnection();

    // Limpar streams de mídia
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Fechar conexão WebRTC
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Resetar estados
    this.isConnected = false;
    this.isSharingScreen = false;
  }
}
