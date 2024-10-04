import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  olympics: OlympicCountry[] | null = null;
  totalMedals: number = 0;
  totalCountries: number = 0;

  // Données pour le graphique
  pieChartData: any[] = [];
  // Définir colorScheme avec le type attendu
  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'MedalsColorScheme'
  };

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
        this.prepareChartData();
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

  prepareChartData() {
    if (this.olympics) {
      // Initialise un tableau vide pour stocker les données du graphique
      const chartData: any[] = [];

      // Parcours chaque pays dans le tableau olympics
      this.olympics.forEach(country => {

        const countryName = country.country;

        // Je calcule le total des médailles pour un pays
        const totalMedalsForCountry = country.participations.reduce(
          (totalMedals, participation) => {
            // Ajoute le nombre de médailles de chaque participation
            return totalMedals + participation.medalsCount;
          },
          0 // On commence avec 0 médailles au départ
        );


        // Je crée un objet avec le nom du pays et le total des médailles
        const countryData = {
          name: countryName,  // Nom du pays
          value: totalMedalsForCountry  // Nombre total de médailles pour ce pays
        };

        // Ajoute cet objet au tableau de données du graphique
        chartData.push(countryData);
      });

      // Assigne le tableau de données formaté à la variable pieChartData
      this.pieChartData = chartData;

    } else {
      // Si les données olympiques ne sont pas encore disponibles, assigne un tableau vide
      this.pieChartData = [];
    }
  }


  ngOnDestroy() {
    this.subscription.unsubscribe(); // Bonne pratique, permet d'éviter les fuites de mémoire
  }
}