import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<OlympicCountry[] | null>(null); // BehaviorSubject pour stocker les données

  constructor(private http: HttpClient) {}

  // Méthode pour charger les données depuis le fichier JSON
  loadInitialData(): Observable<OlympicCountry[] | null> {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((data) => this.olympics$.next(data)), // Met à jour les données du BehaviorSubject
      catchError((error) => {
        console.error('Erreur lors du chargement des données :', error);
        this.olympics$.next(null); // Indique une erreur
        return of(null);
      })
    );
  }

  // Méthode pour exposer les données sous forme d'Observable
  getOlympics(): Observable<OlympicCountry[] | null> {
    return this.olympics$.asObservable();
  }

}
