import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl: string = './assets/mock/olympic.json';
  private olympics$: BehaviorSubject<OlympicCountry[] | null> = new BehaviorSubject<OlympicCountry[] | null>(null);


  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<OlympicCountry[] | null> {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((data: OlympicCountry[]) => this.olympics$.next(data)),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des données :', error);
        this.olympics$.next(null);
        return of(null);
      })
    );
  }

  // Méthode pour exposer les données sous forme d'Observable
  getOlympics(): Observable<OlympicCountry[] | null> {
    return this.olympics$.asObservable();
  }

}
