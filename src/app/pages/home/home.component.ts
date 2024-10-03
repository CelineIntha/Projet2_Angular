import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  olympics: OlympicCountry[] | null = null;
  totalMedals: number = 0;
  totalCountries: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService) { }

  ngOnInit() {
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe() 
    );
  
    // Abonnement à l'observable qui fournit les données des pays olympiques
    this.subscription.add(
      this.olympicService.getOlympics().subscribe(data => {
        this.olympics = data;
  
        // Appelle la méthode pour calculer des données sur les pays olympiques
        this.calculateOlympicsData();
      })
    );
  }
  

  calculateOlympicsData() {
    // Je vérifie si les données olympiques sont disponibles
    if (this.olympics) {
      // Je compte le nombre total de pays et l'assigne à totalCountries
      this.totalCountries = this.olympics.length; // La propriété .length est utilisée pour obtenir le nombre d'éléments dans un tableau.
  
      // J'initialise le compteur total de médailles à zéro
      this.totalMedals = 0;
  
      // Je parcours chaque pays dans le tableau olympics
      for (const country of this.olympics) {
        // Pour chaque pays, je parcours ses participations 
        for (const participation of country.participations) {
          // J'ajoute le nombre de médailles de chaque participation au total
          this.totalMedals += participation.medalsCount;
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Bonne pratique, permet d'éviter les fuites de mémoire
  }
}