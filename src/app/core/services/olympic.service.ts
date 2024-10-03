import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<OlympicCountry[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)), // Met à jour le BehaviorSubject avec les données
      catchError((error) => {
        // TODO: improve error handling
        console.error('Erreur lors du chargement des données :', error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next(null); // Indique une erreur dans le BehaviorSubject
        return of([]); // Retourne un tableau vide ou une valeur de substitution
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
