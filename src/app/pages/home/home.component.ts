import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
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

  // Je définis colorScheme avec les données attendues
  colorScheme: Color = {
    domain: ['#793d52', '#89a1db', '#9780a1', '#bee0f1', '#b9cbe7', '#956065'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'MedalsColorScheme'
  };

  // Propriété pour la taille de la vue
  view: [number, number];

  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService) {
    // Permet de définir la taille de la pie en fonction de la taille de l'écran
    this.view = this.getViewSize(window.innerWidth);
  }

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

  // Méthode pour obtenir la taille de la vue en fonction de la largeur de l'écran
  private getViewSize(width: number): [number, number] {
    if (width <= 768) {
      return [420, 420]; 
    } else {
      return [600, 600]; 
    }
  }

  // Écouteur d'événements pour ajuster la taille de la vue lors du redimensionnement de la fenêtre
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.view = this.getViewSize(event.target.innerWidth);
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
    this.subscription.unsubscribe(); // Cela permet d'éviter les fuites de mémoire
  }
}
