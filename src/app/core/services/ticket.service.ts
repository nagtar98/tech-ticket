import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Ticket {
  id: number;
  title: string;
  completed: boolean;
}

interface TicketState {
  data: Ticket[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  // DIP: Inyección de dependencias moderna
  private http = inject(HttpClient);

  // OCP & Encapsulación: El estado es privado y mutable solo desde aquí
  private state = signal<TicketState>({
    data: [],
    loading: false,
    error: null
  });

  // Exposición controlada (Solo lectura / Derivaciones reactivas)
  public tickets = computed(() => this.state().data);
  public isLoading = computed(() => this.state().loading);
  public errorMessage = computed(() => this.state().error);

  public fetchTickets(): void {
    // Mutación inicial: Activamos el indicador de carga
    this.state.update(s => ({ ...s, loading: true, error: null }));
    
    // Petición HTTP a una API pública de pruebas que coincide con la interfaz Ticket
    this.http.get<Ticket[]>('https://jsonplaceholder.typicode.com/todos').subscribe({
      next: (response) => {
        // Guardamos los datos recibidos y quitamos el loading
        this.state.update(s => ({ ...s, data: response, loading: false }));
      },
      error: () => {
        // En caso de error, mostramos el mensaje y quitamos el loading
        this.state.update(s => ({
          ...s,
          error: 'Error de red al contactar con el servidor. Revise su conexión.',
          loading: false
        }));
      }
    });
  }
}