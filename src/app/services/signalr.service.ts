import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private classroomId = 'default-classroom'; // ID da turma padrão para teste

  constructor(private authService: AuthService) {}

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    // Temporariamente sem autenticação para testar CORS
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/classroomHub`, {
        skipNegotiation: false,
        transport: HttpTransportType.LongPolling, // Usar LongPolling em vez de WebSockets
        withCredentials: false // Não usar credenciais para evitar problemas de CORS
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR conectado com sucesso');
      
      // Entrar na turma padrão
      await this.joinClassroom();
    } catch (error) {
      console.error('Erro ao conectar SignalR:', error);
      throw error;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  private async joinClassroom(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinClassroom', this.classroomId);
    }
  }

  // Métodos para WebRTC signaling
  async sendWebRTCSignal(signal: any, type: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendWebRTCSignal', this.classroomId, JSON.stringify(signal), type);
    }
  }

  // Event listeners para WebRTC
  onReceiveWebRTCSignal(callback: (signal: any, type: string, userId: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveWebRTCSignal', (signal: string, type: string, userId: string) => {
        callback(JSON.parse(signal), type, userId);
      });
    }
  }

  onJoinedClassroom(callback: (classroomId: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('JoinedClassroom', callback);
    }
  }

  onError(callback: (error: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('Error', callback);
    }
  }

  // Remover listeners
  offReceiveWebRTCSignal(): void {
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveWebRTCSignal');
    }
  }

  offJoinedClassroom(): void {
    if (this.hubConnection) {
      this.hubConnection.off('JoinedClassroom');
    }
  }

  offError(): void {
    if (this.hubConnection) {
      this.hubConnection.off('Error');
    }
  }

  get isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }
}
