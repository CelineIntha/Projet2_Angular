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
        // Todo: Via un component afficher une erreur
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }

  //getOlympicsByCountry : retourner un olympic avec un objet
  getCountryDataWithTotalMedals(countryName: string): { country: OlympicCountry | null, totalMedals: number } {
    const olympicCountries = this.olympics$.getValue();
    if (!olympicCountries) return { country: null, totalMedals: 0 };

    const selectedCountry = olympicCountries.find(country => country.country === countryName);

    if (!selectedCountry) return { country: null, totalMedals: 0 };

    const totalMedals = selectedCountry.participations.reduce((totalMedals, participation) => {
      return totalMedals + participation.medalsCount;
    }, 0);

    return { country: selectedCountry, totalMedals };
  }
}



